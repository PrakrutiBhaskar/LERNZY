/**
 * Custom error class for LLM local inference issues.
 */
export class InferenceError extends Error {
  retryable: boolean;
  cause?: Error;

  constructor(message: string, retryable: boolean = false, cause?: Error) {
    super(message);
    this.name = 'InferenceError';
    this.retryable = retryable;
    this.cause = cause;
    Object.setPrototypeOf(this, InferenceError.prototype);
  }
}

/**
 * Custom error class for Text-to-Speech synthesis issues.
 */
export class TTSError extends Error {
  cause?: Error;

  constructor(message: string, cause?: Error) {
    super(message);
    this.name = 'TTSError';
    this.cause = cause;
    Object.setPrototypeOf(this, TTSError.prototype);
  }
}

/**
 * Custom error class for Speech-to-Text transcription issues.
 */
export class STTError extends Error {
  cause?: Error;

  constructor(message: string, cause?: Error) {
    super(message);
    this.name = 'STTError';
    this.cause = cause;
    Object.setPrototypeOf(this, STTError.prototype);
  }
}

/**
 * Custom error class for Quiz adaptation and generation issues.
 */
export class QuizError extends Error {
  cause?: Error;

  constructor(message: string, cause?: Error) {
    super(message);
    this.name = 'QuizError';
    this.cause = cause;
    Object.setPrototypeOf(this, QuizError.prototype);
  }
}

/**
 * Custom error class for missing syllabus or lesson content assets.
 */
export class ContentNotFoundError extends Error {
  path: string;
  cause?: Error;

  constructor(message: string, path: string, cause?: Error) {
    super(message);
    this.name = 'ContentNotFoundError';
    this.path = path;
    this.cause = cause;
    Object.setPrototypeOf(this, ContentNotFoundError.prototype);
  }
}

/**
 * Custom error class for SQLite operations and queries.
 */
export class DBError extends Error {
  query?: string;
  cause?: Error;

  constructor(message: string, cause?: Error, query?: string) {
    super(message);
    this.name = 'DBError';
    this.cause = cause;
    this.query = query;
    Object.setPrototypeOf(this, DBError.prototype);
  }
}
