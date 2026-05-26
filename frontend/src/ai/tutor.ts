import { InferenceError } from '../utils/errors';

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
