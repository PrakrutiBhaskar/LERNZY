const logger = require("../utils/logger");
const { buildUserPrompt, getSystemPrompt } = require("./prompt.service");
const { CircuitBreaker, fetchWithRetry } = require("../utils/circuitBreaker");
const metricsService = require("./metrics.service");
const { AppError } = require("../utils/errors");

let activeAIRequests = 0;

const checkAndIncrementConcurrency = () => {
  const maxConcurrent = parseInt(process.env.MAX_CONCURRENT_AI_CALLS, 10) || 20;
  if (activeAIRequests >= maxConcurrent) {
    metricsService.incrementAIMetric("rate_limit");
    throw new AppError("Too many concurrent AI requests. Please try again later.", 503, "AI_CONCURRENCY_LIMIT_EXCEEDED");
  }
  activeAIRequests++;
  metricsService.incrementAIMetric("requests");
};

const decrementConcurrency = () => {
  activeAIRequests = Math.max(0, activeAIRequests - 1);
};

const withConcurrencyControl = (fn) => {
  return async (...args) => {
    checkAndIncrementConcurrency();
    try {
      return await fn(...args);
    } finally {
      decrementConcurrency();
    }
  };
};

const handleAIError = (error, fallbackUsed = false) => {
  const errMsg = error.message ? error.message.toLowerCase() : "";
  if (errMsg.includes("timeout") || errMsg.includes("timed out")) {
    metricsService.incrementAIMetric("timeout");
  } else if (errMsg.includes("safety") || errMsg.includes("block") || errMsg.includes("moderation")) {
    metricsService.incrementAIMetric("moderation_failure");
  } else {
    metricsService.incrementAIMetric("provider_error");
  }

  if (fallbackUsed) {
    metricsService.incrementAIMetric("fallback_used");
  }
};

const geminiCircuit = new CircuitBreaker("Gemini", { failureThreshold: 3, cooldownPeriod: 30000 });
const ollamaCircuit = new CircuitBreaker("Ollama", { failureThreshold: 3, cooldownPeriod: 30000 });

const fetchWithTimeout = async (url, options = {}, timeoutMs) => {
  const finalTimeout = timeoutMs || parseInt(process.env.AI_TIMEOUT_MS, 10) || 15000;
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), finalTimeout);
  try {
    const response = await fetch(url, {
      ...options,
      signal: options.signal || controller.signal
    });
    return response;
  } catch (error) {
    if (error.name === "AbortError" || error.message?.includes("aborted")) {
      throw new Error(`AI API request timed out after ${finalTimeout}ms`);
    }
    throw error;
  } finally {
    clearTimeout(id);
  }
};

const getFallbackAnswer = ({ question, language }) => {
  const prefix =
    language === "kn"
      ? "ಈಗ ನಾನು ಸರಳವಾಗಿ ವಿವರಿಸುತ್ತೇನೆ: "
      : "Here is a simple explanation: ";

  return `${prefix}${question}`;
};

const normalizeProvider = () => {
  const provider = (process.env.AI_PROVIDER || "gemini").toLowerCase();
  if (provider === "openai") return "gemini";
  return provider;
};

const isValidAIResponse = (text) => {
  if (!text || typeof text !== "string") return false;
  const trimmed = text.trim();
  if (trimmed.length < 10) return false;
  if (trimmed === "{}" || trimmed === "[]") return false;
  
  // Validation layer to automatically reject placeholder or template language
  const lower = trimmed.toLowerCase();
  const forbiddenPatterns = [
    "concept 1",
    "definition 1",
    "primary choice",
    "secondary option",
    "lorem ipsum",
    "understand key concepts",
    "generic phrase",
    "placeholder explanation",
    "unrelated options"
  ];
  for (const pattern of forbiddenPatterns) {
    if (lower.includes(pattern)) {
      logger.warn(`AI Response rejected: contains forbidden placeholder pattern "${pattern}"`);
      return false;
    }
  }
  return true;
};

const callGemini = async ({ prompt, stream, abortSignal }) => {
  const apiKey = process.env.GEMINI_API_KEY;
  const model = process.env.GEMINI_MODEL || "gemini-2.0-flash";

  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is required for Gemini provider.");
  }

  const endpoint = stream
    ? `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:streamGenerateContent`
    : `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent`;

  const query = stream ? `key=${encodeURIComponent(apiKey)}&alt=sse` : `key=${encodeURIComponent(apiKey)}`;
  const url = `${endpoint}?${query}`;

  const headers = {
    "Content-Type": "application/json"
  };

  if (stream) {
    headers.Accept = "text/event-stream";
  }

  // Enforce retry with exponential backoff on Gemini outbound call
  const response = await fetchWithRetry(url, {
    method: "POST",
    headers,
    body: JSON.stringify({
      contents: [
        {
          role: "user",
          parts: [{ text: `${getSystemPrompt()}\n\n${prompt}` }]
        }
      ]
    }),
    signal: abortSignal
  }, 3, 200);

  return response;
};

const extractGeminiText = (json) => {
  const candidates = json?.candidates || [];
  const parts = candidates?.[0]?.content?.parts || [];
  const text = parts.map((p) => p.text).filter(Boolean).join(" ");
  return (text || "").trim();
};

const consumeGeminiStream = async (response, onToken, abortSignal) => {
  const contentType = response.headers.get("content-type") || "";

  if (contentType.includes("text/event-stream")) {
    const reader = response.body.getReader();
    const decoder = new TextDecoder("utf-8");
    let buffer = "";

    while (true) {
      if (abortSignal && abortSignal.aborted) {
        throw new Error("Stream generation aborted by user client disconnect.");
      }

      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      let idx;

      while ((idx = buffer.indexOf("\n")) !== -1) {
        const line = buffer.slice(0, idx).trimEnd();
        buffer = buffer.slice(idx + 1);

        if (!line.startsWith("data:")) {
          continue;
        }

        const payload = line.replace(/^data:\s*/, "").trim();
        if (!payload || payload === "[DONE]") {
          continue;
        }

        try {
          const json = JSON.parse(payload);
          const token = extractGeminiText(json);
          if (token) {
            onToken(token);
          }
        } catch (error) {
          // Ignore partial line parses
        }
      }
    }
    return;
  }

  const text = await response.text();
  const trimmed = text.trim();
  let inner = trimmed;

  if (inner.startsWith("[") && inner.endsWith("]")) {
    inner = inner.slice(1, -1);
  }

  const objects = inner
    .split(/}\s*,\s*{/g)
    .map((chunk, idx, arr) => {
      let part = chunk;
      if (idx > 0) part = `{${part}`;
      if (idx < arr.length - 1) part = `${part}}`;
      return part;
    });

  for (const raw of objects) {
    if (abortSignal && abortSignal.aborted) {
      throw new Error("Stream generation aborted by user client disconnect.");
    }
    try {
      const json = JSON.parse(raw);
      const token = extractGeminiText(json);
      if (token) {
        onToken(token);
      }
    } catch (error) {
      // Ignore errors on partial chunks
    }
  }
};

const generateWithGemini = async ({ prompt, abortSignal }) => {
  return geminiCircuit.execute(
    async () => {
      const response = await callGemini({ prompt, stream: false, abortSignal });

      if (!response.ok) {
        const body = await response.text().catch(() => "");
        throw new Error(`Gemini error (${response.status}): ${body}`);
      }

      const json = await response.json();
      const result = extractGeminiText(json);

      if (!isValidAIResponse(result)) {
        throw new Error("Invalid/garbage response returned from Gemini");
      }
      return result;
    },
    async () => {
      logger.warn("gemini_circuit_breaker_triggered_fallback_to_ollama");
      return generateWithOllama({ prompt, abortSignal });
    }
  );
};

const generateWithOllama = async ({ prompt, abortSignal }) => {
  return ollamaCircuit.execute(
    async () => {
      const baseUrl = process.env.OLLAMA_BASE_URL || "http://127.0.0.1:11434";
      const model = process.env.OLLAMA_MODEL || "llama3.2";

      const response = await fetchWithTimeout(`${baseUrl}/api/generate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model,
          prompt: `${getSystemPrompt()}\n\n${prompt}`,
          stream: false,
          options: {
            temperature: 0.4
          }
        }),
        signal: abortSignal
      });

      if (!response.ok) {
        const body = await response.text().catch(() => "");
        throw new Error(`Ollama error (${response.status}): ${body}`);
      }

      const json = await response.json();
      const text = (json.response || "").trim();

      if (!isValidAIResponse(text)) {
        throw new Error("Invalid/garbage response returned from Ollama");
      }
      return text;
    },
    async () => {
      logger.warn("ollama_circuit_breaker_triggered_fallback_to_static");
      throw new Error("All AI providers failed. Fall back to local template.");
    }
  );
};

const streamWithOllama = async ({ prompt, onToken, abortSignal }) => {
  const baseUrl = process.env.OLLAMA_BASE_URL || "http://127.0.0.1:11434";
  const model = process.env.OLLAMA_MODEL || "llama3.2";

  const response = await fetchWithTimeout(`${baseUrl}/api/generate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model,
      prompt: `${getSystemPrompt()}\n\n${prompt}`,
      stream: true,
      options: {
        temperature: 0.4
      }
    }),
    signal: abortSignal
  });

  if (!response.ok || !response.body) {
    const body = await response.text().catch(() => "");
    throw new Error(`Ollama stream error (${response.status}): ${body}`);
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder("utf-8");
  let buffered = "";

  while (true) {
    if (abortSignal && abortSignal.aborted) {
      throw new Error("Ollama stream aborted by client.");
    }

    const { done, value } = await reader.read();
    if (done) break;
    buffered += decoder.decode(value, { stream: true });

    let idx;
    while ((idx = buffered.indexOf("\n")) !== -1) {
      const line = buffered.slice(0, idx).trim();
      buffered = buffered.slice(idx + 1);
      if (!line) continue;

      try {
        const json = JSON.parse(line);
        if (json.response) {
          onToken(json.response);
        }
      } catch (error) {
        // ignore malformed chunk
      }
    }
  }
};

const generateJSONResponse = async ({ prompt, abortSignal }) => {
  const fullPrompt = `${prompt}\n\nIMPORTANT: Return ONLY valid JSON. Do not include markdown blocks like \`\`\`json. Return the raw JSON object directly.`;
  const provider = normalizeProvider();
  
  try {
    let text;
    if (provider === "ollama") {
      text = await generateWithOllama({ prompt: fullPrompt, abortSignal });
    } else {
      text = await generateWithGemini({ prompt: fullPrompt, abortSignal });
    }
    
    let cleanedText = text.trim();
    if (cleanedText.startsWith("```json")) {
      cleanedText = cleanedText.slice(7);
    } else if (cleanedText.startsWith("```")) {
      cleanedText = cleanedText.slice(3);
    }
    if (cleanedText.endsWith("```")) {
      cleanedText = cleanedText.slice(0, -3);
    }
    
    return JSON.parse(cleanedText.trim());
  } catch (error) {
    logger.error("Failed to generate or parse JSON from AI", { error: error.message });
    handleAIError(error, false);
    throw error;
  }
};

const generateTextResponse = async ({ prompt, abortSignal }) => {
  const provider = normalizeProvider();
  try {
    if (provider === "ollama") {
      return await generateWithOllama({ prompt, abortSignal });
    } else {
      return await generateWithGemini({ prompt, abortSignal });
    }
  } catch (error) {
    logger.error("Failed to generate text from AI", { error: error.message });
    handleAIError(error, false);
    throw error;
  }
};

const generateTutorResponse = async ({ question, level, language, topic, board, grade, history = [], chapterContext, abortSignal }) => {
  const prompt = buildUserPrompt({ question, level, language, topic, board, grade, history, chapterContext });
  const provider = normalizeProvider();

  try {
    if (provider === "ollama") {
      const text = await generateWithOllama({ prompt, abortSignal });
      return {
        text,
        modelMeta: {
          provider: "ollama",
          model: process.env.OLLAMA_MODEL || "llama3.2"
        }
      };
    }

    // Default primary provider is Gemini
    const text = await generateWithGemini({ prompt, abortSignal });

    return {
      text,
      modelMeta: {
        provider: "gemini",
        model: process.env.GEMINI_MODEL || "gemini-2.0-flash"
      }
    };
  } catch (error) {
    logger.error("ai_inference_failure", {
      provider,
      question,
      level,
      language,
      message: error.message
    });

    const allowFallback = String(process.env.AI_FALLBACK_ENABLED || "true").toLowerCase() === "true";
    handleAIError(error, allowFallback);

    if (!allowFallback) {
      throw error;
    }

    return {
      text: getFallbackAnswer({ question, language }),
      modelMeta: {
        provider: "fallback",
        model: "local-template"
      }
    };
  }
};

const streamTutorResponse = async ({ question, level, language, topic, board, grade, history = [], chapterContext, onToken, abortSignal }) => {
  const prompt = buildUserPrompt({ question, level, language, topic, board, grade, history, chapterContext });
  const provider = normalizeProvider();
  let hasEmitted = false;

  const wrappedOnToken = (token) => {
    hasEmitted = true;
    onToken(token);
  };

  try {
    if (provider === "gemini") {
      const response = await callGemini({ prompt, stream: true, abortSignal });

      if (!response.ok) {
        const body = await response.text().catch(() => "");
        throw new Error(`Gemini stream error (${response.status}): ${body}`);
      }

      await consumeGeminiStream(response, wrappedOnToken, abortSignal);
      return;
    }

    if (provider === "ollama") {
      await streamWithOllama({ prompt, onToken: wrappedOnToken, abortSignal });
      return;
    }

    // Default fallback if not gemini/ollama
    const text = getFallbackAnswer({ question, language });
    wrappedOnToken(text);
  } catch (error) {
    logger.error("ai_stream_inference_failure", {
      provider,
      question,
      message: error.message
    });

    const allowFallback = String(process.env.AI_FALLBACK_ENABLED || "true").toLowerCase() === "true";
    handleAIError(error, allowFallback && !hasEmitted);

    // If we've already emitted tokens mid-stream, do not silently fallback!
    // Throw the error so the client's SSE session is terminated and gets notified.
    if (hasEmitted) {
      throw error;
    }

    if (!allowFallback) {
      throw error;
    }

    const text = getFallbackAnswer({ question, language });
    wrappedOnToken(text);
  }
};

module.exports = {
  generateTutorResponse: withConcurrencyControl(generateTutorResponse),
  streamTutorResponse: withConcurrencyControl(streamTutorResponse),
  getFallbackAnswer,
  generateJSONResponse: withConcurrencyControl(generateJSONResponse),
  generateTextResponse: withConcurrencyControl(generateTextResponse)
};
