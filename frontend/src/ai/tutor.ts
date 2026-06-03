import * as FileSystem from 'expo-file-system/legacy';
import { InferenceError } from '../utils/errors';
import { apiFetch, getAuthState } from '../services/api';
import { FILESYSTEM_PATHS, MODEL_FILENAMES, LanguageCode } from '../utils/constants';
import { buildTutorSystemPrompt, buildTutorUserPrompt, TutorPromptContext } from './promptBuilder';

export interface TutorMessage {
  role: 'student' | 'tutor';
  text: string;
  timestamp: string;
}

export interface TutorResponse {
  text: string;
  audioPath?: string;
}

interface LocalLlamaContext {
  completion: (
    params: Record<string, unknown>,
    onToken?: (data: { token?: string; content?: string; text?: string }) => void
  ) => Promise<{ text?: string; content?: string }>;
  stopCompletion?: () => Promise<void>;
}

let llamaContextPromise: Promise<LocalLlamaContext> | null = null;

const STOP_WORDS = [
  '</s>',
  '<|end|>',
  '<|eot_id|>',
  '<|end_of_text|>',
  '<|im_end|>',
  '<|EOT|>',
  '<|END_OF_TURN_TOKEN|>',
  '<|end_of_turn|>',
  '<|endoftext|>',
];

async function getModelPath(): Promise<string> {
  const modelPath = `${FILESYSTEM_PATHS.MODELS_DIR}${MODEL_FILENAMES.LLM}`;
  const info = await FileSystem.getInfoAsync(modelPath);

  if (!info.exists) {
    throw new InferenceError(`Local LLM model not found at ${modelPath}`, false);
  }

  return modelPath.startsWith('file://') ? modelPath : `file://${modelPath}`;
}

async function getLlamaContext(): Promise<LocalLlamaContext> {
  if (!llamaContextPromise) {
    llamaContextPromise = (async () => {
      const modelPath = await getModelPath();
      const { initLlama } = await import('llama.rn');

      return initLlama({
        model: modelPath,
        use_mlock: true,
        n_ctx: 2048,
        n_batch: 256,
        n_gpu_layers: 0,
      }) as Promise<LocalLlamaContext>;
    })();
  }

  return llamaContextPromise;
}

function toLlamaMessages(
  systemPrompt: string,
  userInput: string,
  chatHistory: TutorMessage[]
) {
  return [
    { role: 'system' as const, content: systemPrompt },
    ...chatHistory.slice(-8).map((message) => ({
      role: message.role === 'student' ? 'user' as const : 'assistant' as const,
      content: message.text,
    })),
    { role: 'user' as const, content: buildTutorUserPrompt(userInput) },
  ];
}

export async function generateTutorResponse(
  userInput: string,
  chatHistory: TutorMessage[],
  context: TutorPromptContext = {}
): Promise<TutorResponse> {
  try {
    const llama = await getLlamaContext();
    const systemPrompt = buildTutorSystemPrompt(context);
    const result = await llama.completion({
      messages: toLlamaMessages(systemPrompt, userInput, chatHistory),
      n_predict: 220,
      temperature: 0.45,
      top_k: 40,
      top_p: 0.9,
      stop: STOP_WORDS,
    });

    return {
      text: result.text || result.content || '',
    };
  } catch (error: any) {
    throw new InferenceError(
      `Failed to generate tutor response: ${error.message || error}`,
      true, // retryable
      error
    );
  }
}

interface StreamCallbacks {
  onToken: (token: string) => void;
  onDone: (data: { explanation: string; [key: string]: any }) => void;
  onError: (error: Error) => void;
}

export interface LocalTutorStreamOptions extends TutorPromptContext {
  abortSignal?: AbortSignal;
  chatHistory?: TutorMessage[];
  maxTokens?: number;
}

export async function streamTutorResponseLocal(
  userInput: string,
  options: LocalTutorStreamOptions,
  callbacks: StreamCallbacks
): Promise<void> {
  let abortListener: (() => void) | null = null;

  try {
    const llama = await getLlamaContext();
    const systemPrompt = buildTutorSystemPrompt(options);
    let streamedText = '';

    if (options.abortSignal) {
      abortListener = () => {
        llama.stopCompletion?.().catch(() => {});
      };
      options.abortSignal.addEventListener('abort', abortListener, { once: true });
    }

    const result = await llama.completion(
      {
        messages: toLlamaMessages(systemPrompt, userInput, options.chatHistory || []),
        n_predict: options.maxTokens || 220,
        temperature: 0.45,
        top_k: 40,
        top_p: 0.9,
        stop: STOP_WORDS,
      },
      (data) => {
        if (options.abortSignal?.aborted) return;

        const token = data.token || data.content || data.text || '';
        if (token) {
          streamedText += token;
          callbacks.onToken(token);
        }
      }
    );

    const explanation = streamedText || result.text || result.content || '';
    if (!options.abortSignal?.aborted) {
      callbacks.onDone({ explanation });
    }
  } catch (error: any) {
    if (error.name === 'AbortError' || options.abortSignal?.aborted) {
      return;
    }
    callbacks.onError(
      error instanceof Error
        ? error
        : new InferenceError(`Failed to stream tutor response: ${String(error)}`, true)
    );
  } finally {
    if (options.abortSignal && abortListener) {
      options.abortSignal.removeEventListener('abort', abortListener);
    }
  }
}

/**
 * Streams the tutor's response from the cloud using SSE (Server-Sent Events) over HTTP POST.
 * Uses a chunk decoder to yield tokens as they arrive, and supports AbortSignal cancellation.
 */
export async function streamTutorResponseSSE(
  question: string,
  options: {
    topic?: string;
    board?: 'ncert' | 'state';
    grade?: number;
    language?: string;
    outputType?: 'text' | 'voice' | 'sign-language';
    abortSignal?: AbortSignal;
  },
  callbacks: StreamCallbacks
): Promise<void> {
  const auth = getAuthState();
  if (!auth.isAuthenticated) {
    // Fall back to offline local response immediately
    try {
      await streamTutorResponseLocal(
        question,
        {
          topic: options.topic,
          grade: options.grade,
          language: options.language as LanguageCode | undefined,
          abortSignal: options.abortSignal,
        },
        callbacks
      );
    } catch (err: any) {
      callbacks.onError(err);
    }
    return;
  }

  const { topic, board = 'state', grade = 6, language = 'en', outputType = 'text' } = options;

  const requestBody = {
    question,
    language,
    outputType,
    topic,
    board,
    grade,
  };

  try {
    const response = await apiFetch('/api/v1/ask/stream', {
      method: 'POST',
      body: JSON.stringify(requestBody),
      signal: options.abortSignal,
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`Server returned error status ${response.status}: ${errText}`);
    }

    const reader = response.body?.getReader();
    if (!reader) {
      // Fallback: if environment doesn't support response.body.getReader (e.g. older JS engines)
      // Call the non-streaming REST endpoint instead
      console.warn('Streaming reader not available in this environment. Falling back to non-streaming endpoint.');
      const fallbackResponse = await apiFetch('/api/v1/ask', {
        method: 'POST',
        body: JSON.stringify(requestBody),
        signal: options.abortSignal,
      });

      if (!fallbackResponse.ok) {
        const errText = await fallbackResponse.text();
        throw new Error(`Fallback request failed: ${errText}`);
      }

      const resJson = await fallbackResponse.json();
      const explanation = resJson.data?.explanation || '';
      callbacks.onToken(explanation);
      callbacks.onDone(resJson.data);
      return;
    }

    // Decode stream chunks
    const decoder = new TextDecoder('utf-8');
    let buffer = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() || ''; // Hold onto incomplete last line

      let currentEventName = '';

      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed) continue;

        if (trimmed.startsWith('event:')) {
          currentEventName = trimmed.replace('event:', '').trim();
        } else if (trimmed.startsWith('data:')) {
          const dataContent = trimmed.replace('data:', '').trim();
          try {
            const parsed = JSON.parse(dataContent);
            if (currentEventName === 'token') {
              if (parsed.token) {
                callbacks.onToken(parsed.token);
              }
            } else if (currentEventName === 'done') {
              callbacks.onDone(parsed);
            } else if (currentEventName === 'error') {
              throw new Error(parsed.message || 'Stream generation error');
            }
          } catch (jsonErr) {
            console.warn('Failed to parse SSE data block:', jsonErr, dataContent);
          }
        }
      }
    }
  } catch (error: any) {
    if (error.name === 'AbortError') {
      console.log('Stream request aborted by user navigating away.');
      return;
    }
    callbacks.onError(error);
  }
}
