import { InferenceError } from '../utils/errors';
import { apiFetch, getAuthState } from '../services/api';

export interface TutorMessage {
  role: 'student' | 'tutor';
  text: string;
  timestamp: string;
}

export interface TutorResponse {
  text: string;
  audioPath?: string;
}

/**
 * Offline AI Tutor Inference scaffold.
 * In Phase 2, this will load the Phi-3 LLM weights from the models directory,
 * manage system prompts, format the conversation history, and return text/audio.
 */
export async function generateTutorResponse(
  userInput: string,
  chatHistory: TutorMessage[]
): Promise<TutorResponse> {
  try {
    // Placeholder response for architectural scaffolding
    return {
      text: "Hello! I am lernzy, your offline learning companion. Once my local models are initialized, I will guide you through this lesson.",
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
      const localResult = await generateTutorResponse(question, []);
      callbacks.onToken(localResult.text);
      callbacks.onDone({ explanation: localResult.text });
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
