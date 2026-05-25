# API Contracts — Internal Module Interfaces
> Defines the TypeScript function signatures, input/output shapes, and behaviour contracts
> between all major modules in the Vidya Tutor app. Every developer and AI assistant
> working on this project must honour these contracts when implementing or modifying modules.

---

## 1. `promptBuilder.ts`

### `buildSystemPrompt(profile, session): string`

Constructs the fully-substituted system prompt string ready for injection into llama.cpp.

```typescript
interface StudentProfile {
  id: number;
  name: string;                          // e.g. "Arjun"
  grade: 6 | 7 | 8;                     // numeric grade
  language: 'en' | 'hi' | 'kn';
  interests: string[];                   // e.g. ["cricket", "drawing"]
  learningStyle: 'stories' | 'diagrams' | 'mixed';
}

interface SessionContext {
  subject: string;                       // e.g. "Mathematics"
  chapterName: string;                   // e.g. "Fractions and Decimals"
  topicName: string;                     // e.g. "Addition of Unlike Fractions"
  mode: 'lesson' | 'quiz' | 'flashcard' | 'revision' | 'freeask';
}

function buildSystemPrompt(profile: StudentProfile, session: SessionContext): string;
```

**Contract:**
- All `{{VARIABLE}}` tokens in `SYSTEM_PROMPT.md` must be substituted; no token may remain in the output.
- `interests` array is joined as a comma-separated string: `"cricket, drawing, space"`.
- Grade is formatted as `"Grade 7"` (string with capital G).
- Language codes map to display names: `en → "English"`, `hi → "Hindi"`, `kn → "Kannada"`.
- Must not throw — if a field is missing, use a safe default (e.g. `"a student"` for missing name).
- Result is passed verbatim as the `system` field of every inference request.

---

## 2. `inferenceClient.ts`

### `runInference(systemPrompt, messages, options?): Promise<string>`

Sends a chat completion request to the local llama.cpp server and returns the assistant reply.

```typescript
interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

interface InferenceOptions {
  maxTokens?: number;          // default: 512
  temperature?: number;        // default: 0.7
  topP?: number;               // default: 0.9
  repeatPenalty?: number;      // default: 1.1
}

function runInference(
  systemPrompt: string,
  messages: ChatMessage[],
  options?: InferenceOptions
): Promise<string>;
```

**Contract:**
- Prunes `messages` to the last `MAX_HISTORY_TURNS * 2` entries before sending (see `AI_MODEL_GUIDE.md §7`).
- Applies the correct chat template for the active model (Phi-3 or Llama 3.x).
- Throws `InferenceError` with a `retryable: boolean` field on failure.
- On first failure: retries once with `maxTokens` halved.
- Resolves to the raw assistant text string (no streaming in v1).
- Never returns an empty string — throws instead.

```typescript
class InferenceError extends Error {
  retryable: boolean;
  cause?: Error;
}
```

---

## 3. `ttsClient.ts`

### `synthesise(text, language): Promise<TTSResult>`

Converts text to audio using the appropriate Piper voice model.

```typescript
interface TTSResult {
  uri: string;         // local file:// path to the generated WAV
  durationMs: number;  // approximate playback duration
}

function synthesise(text: string, language: 'en' | 'hi' | 'kn'): Promise<TTSResult>;
```

**Contract:**
- Selects model from `VOICE_MAP` based on `language`.
- Output is a 22 050 Hz mono WAV written to the app's cache directory.
- Caller is responsible for deleting the WAV after playback.
- Throws `TTSError` if the model file is missing or synthesis fails.
- Max input text length: 1 000 characters. Longer inputs must be chunked by the caller.

### `pregenerate(texts, language): Promise<Map<string, string>>`

Batch pre-generates TTS for a list of strings (e.g. lesson key points) and returns a map of `text → uri`.

```typescript
function pregenerate(
  texts: string[],
  language: 'en' | 'hi' | 'kn'
): Promise<Map<string, string>>;
```

---

## 4. `sttClient.ts`

### `transcribe(audioUri): Promise<STTResult>`

Transcribes a recorded audio file using the on-device Whisper Tiny model.

```typescript
interface STTResult {
  text: string;              // raw transcript
  detectedLanguage: string;  // ISO 639-1 code detected by Whisper
  confidence: number;        // 0.0 – 1.0 (Whisper probability estimate)
}

function transcribe(audioUri: string): Promise<STTResult>;
```

**Contract:**
- Input must be a 16 kHz mono WAV file (caller must convert if needed).
- Uses `language: "auto"` — does not require the caller to specify language.
- Returns empty `text: ""` (never throws) if no speech is detected (`no_speech_threshold`).
- Throws `STTError` only on model load failure or corrupt audio file.

---

## 5. `quizGenerator.ts`

### `getNextQuestion(topicId, studentId, history): Promise<QuizQuestion>`

Returns the next quiz question, adapting difficulty based on recent performance.

```typescript
interface QuizQuestion {
  id: string;
  difficulty: 'easy' | 'medium' | 'hard';
  question: LocalisedString;
  options: LocalisedString[];    // always 4 options
  correctIndex: number;          // 0-based
  explanation: LocalisedString;
  diagramRef: string | null;
}

interface LocalisedString {
  en: string;
  hi: string;
  kn: string;
}

interface QuizAttempt {
  questionId: string;
  correct: boolean;
  difficulty: 'easy' | 'medium' | 'hard';
}

function getNextQuestion(
  topicId: string,
  studentId: number,
  history: QuizAttempt[]   // last N attempts for this topic
): Promise<QuizQuestion>;
```

**Contract:**
- Reads the topic's `quiz_bank.json` from bundled assets via `contentLoader`.
- Difficulty adaptation rule: 2 consecutive correct → step up; 2 consecutive wrong → step down.
- Never returns the same question twice in one session.
- Falls back to a random question of any difficulty if the topic bank has fewer than 10 questions.
- Throws `QuizError` if the topic ID is not found.

### `evaluateAnswer(question, selectedIndex): AnswerResult`

```typescript
interface AnswerResult {
  correct: boolean;
  correctIndex: number;
  explanation: LocalisedString;
}

function evaluateAnswer(question: QuizQuestion, selectedIndex: number): AnswerResult;
```

---

## 6. `flashcardScheduler.ts`

### `getNextCard(studentId, topicId?): Promise<Flashcard | null>`

Returns the highest-priority due flashcard for the student using SM-2 scheduling.

```typescript
interface Flashcard {
  id: number;
  front: LocalisedString;
  back: LocalisedString;
  memoryHook: LocalisedString;
  nextReview: Date;
  easeFactor: number;
  interval: number;          // days until next review
  repetitions: number;
}

function getNextCard(studentId: number, topicId?: string): Promise<Flashcard | null>;
// Returns null if no cards are due.
```

### `recordReview(cardId, rating): Promise<void>`

Updates the SM-2 parameters for a card after the student rates it.

```typescript
type ReviewRating = 'easy' | 'good' | 'hard';

function recordReview(cardId: number, rating: ReviewRating): Promise<void>;
```

**SM-2 mapping:**

| Rating | Quality (q) |
|--------|------------|
| easy   | 5          |
| good   | 4          |
| hard   | 2          |

- If `q < 3`, reset `repetitions` to 0 and set `interval` to 1 day.
- New `easeFactor = max(1.3, oldEaseFactor + 0.1 − (5 − q) × (0.08 + (5 − q) × 0.02))`.

---

## 7. `contentLoader.ts`

### `loadLesson(grade, subject, chapterId): Promise<LessonData>`

```typescript
function loadLesson(
  grade: 6 | 7 | 8,
  subject: 'mathematics' | 'science' | 'social_studies' | 'english' | 'kannada',
  chapterId: string
): Promise<LessonData>;
// LessonData mirrors lesson.json schema (see CONTENT_SPEC.md §1)
```

### `loadQuizBank(grade, subject, chapterId): Promise<QuizBank>`

```typescript
function loadQuizBank(
  grade: 6 | 7 | 8,
  subject: string,
  chapterId: string
): Promise<QuizBank>;
// QuizBank mirrors quiz_bank.json schema (see CONTENT_SPEC.md §2)
```

### `loadFlashcards(grade, subject, chapterId): Promise<FlashcardSet>`

```typescript
function loadFlashcards(
  grade: 6 | 7 | 8,
  subject: string,
  chapterId: string
): Promise<FlashcardSet>;
```

**Contract (all loaders):**
- Reads from `assets/content/grade_{N}/{subject}/{chapterId}/`.
- Throws `ContentNotFoundError` if the path does not exist.
- Returns a deep-cloned object (do not mutate the cached result).
- Results are cached in memory per `(grade, subject, chapterId)` key after first load.

---

## 8. `interestInjector.ts`

### `injectInterests(template, interests, language): string`

Replaces all `{{PLACEHOLDER}}` tokens in a story template with interest-appropriate values.

```typescript
function injectInterests(
  template: string,
  interests: string[],       // student's interests, e.g. ["cricket", "drawing"]
  language: 'en' | 'hi' | 'kn'
): string;
```

**Contract:**
- Tokens resolved: `{{STUDENT_NAME}}`, `{{INTEREST_PLACE}}`, `{{INTEREST_OBJECT}}`, `{{INTEREST_ACTION}}`.
- Uses the first matching interest from the `interest_placeholders` lookup in `lesson.json`.
- Falls back to `"default"` if no interest matches.
- All `{{GRADE}}` tokens are replaced with the grade string from the caller's context.
- Returns the template unchanged if `interests` is empty (no throw).
- Never leaves an unresolved `{{TOKEN}}` in the output — replace with the default value.

---

## 9. `studentRepository.ts`

```typescript
function getStudent(id: number): Promise<StudentProfile | null>;
function upsertStudent(profile: Omit<StudentProfile, 'id'>): Promise<number>; // returns id
function updateInterests(id: number, interests: string[]): Promise<void>;
function updateLanguage(id: number, language: 'en' | 'hi' | 'kn'): Promise<void>;
```

---

## 10. `sessionRepository.ts`

```typescript
interface Session {
  id: number;
  studentId: number;
  subject: string;
  topicId: string;
  startedAt: Date;
  endedAt: Date | null;
}

function startSession(studentId: number, subject: string, topicId: string): Promise<number>; // returns session id
function endSession(sessionId: number): Promise<void>;
function getRecentSessions(studentId: number, limit?: number): Promise<Session[]>;
```

---

## 11. `quizRepository.ts`

```typescript
interface QuizResult {
  id: number;
  studentId: number;
  topicId: string;
  score: number;
  total: number;
  attemptedAt: Date;
}

function saveQuizResult(studentId: number, topicId: string, score: number, total: number): Promise<void>;
function getQuizHistory(studentId: number, topicId: string): Promise<QuizResult[]>;
function getTopicMastery(studentId: number, topicId: string): Promise<number>; // 0.0–1.0
```

---

## 12. Error Types (shared, `src/utils/errors.ts`)

```typescript
export class InferenceError extends Error { retryable: boolean; }
export class TTSError extends Error { }
export class STTError extends Error { }
export class QuizError extends Error { }
export class ContentNotFoundError extends Error { path: string; }
export class DBError extends Error { query?: string; }
```

All errors include a human-readable `message` and, where available, a `cause` (the underlying error). Callers must catch these at the UI layer and show a friendly message — never let raw errors surface to students.

---

## 13. Backend HTTP REST + SSE APIs (for Mobile Integration)

The backend provides versioned endpoints mounted at `/api` and `/api/v1`.

### 13.1 Authentication
- **`POST /api/auth/signup`**
  - **Request Payload:**
    ```json
    {
      "name": "Arjun",
      "email": "arjun@example.com",
      "password": "Password123!",
      "preferredLanguage": "en",
      "educationLevel": "beginner"
    }
    ```
  - **Response Payload (201 Created):**
    ```json
    {
      "success": true,
      "message": "Signup successful",
      "data": {
        "accessToken": "...",
        "refreshToken": "...",
        "token": "...",
        "user": {
          "id": "...",
          "name": "Arjun",
          "email": "arjun@example.com",
          "preferredLanguage": "en",
          "educationLevel": "beginner",
          "points": 0
        }
      },
      "error": null
    }
    ```
  - **Error Response (409 Conflict):**
    ```json
    {
      "success": false,
      "message": "Email already exists",
      "data": null,
      "error": { "code": "EMAIL_EXISTS" }
    }
    ```

- **`POST /api/auth/login`**
  - **Request Payload:**
    ```json
    {
      "email": "arjun@example.com",
      "password": "Password123!"
    }
    ```
  - **Response Payload (200 OK):** Same payload structure as Signup.
  - **Error Response (401 Unauthorized):**
    ```json
    {
      "success": false,
      "message": "Invalid email or password",
      "data": null,
      "error": { "code": "AUTH_INVALID" }
    }
    ```

### 13.2 AI Tutor Q&A
- **`POST /api/ask`**
  - **Headers:** `Authorization: Bearer <accessToken>`
  - **Request Payload:**
    ```json
    {
      "question": "What is a fraction?",
      "language": "en",
      "outputType": "text",
      "topic": "fractions",
      "board": "state",
      "grade": 6
    }
    ```
  - **Response Payload (200 OK):**
    ```json
    {
      "success": true,
      "message": "Answer generated",
      "data": {
        "question": "What is a fraction?",
        "language": "en",
        "outputType": "text",
        "explanation": "A fraction represents a part of a whole...",
        "isVerified": false,
        "modelMeta": {
          "provider": "gemini",
          "model": "gemini-2.0-flash"
        },
        "sse": {
          "streamUrl": "/api/ask/stream",
          "hint": "Use POST /api/ask/stream for token streaming (SSE fetch)."
        }
      },
      "error": null
    }
    ```

- **`POST /api/ask/stream`**
  - Streams back server-sent events with Content-Type `text/event-stream`.
  - **Events:**
    - **`token`**: progressive response tokens.
      ```
      event: token
      data: {"token": " A"}
      ```
    - **`done`**: final assembled and translated explanation text payload.
      ```
      event: done
      data: {"explanationStream": "...", "explanation": "...", "language": "en", "outputType": "text", "isVerified": false}
      ```
    - **`error`**: stream failure notification.
      ```
      event: error
      data: {"message": "Stream failed"}
      ```

### 13.3 Chat History
- **`GET /api/history`**
  - **Headers:** `Authorization: Bearer <accessToken>`
  - **Query Params:**
    - `page` (optional): Offset pagination page index (default: `1`).
    - `limit` (optional): Page sizes (default: `20`, max: `100`).
    - `cursor` (optional): Cursor ID (Mongo ObjectId) for cursor-based pagination.
  - **Response Payload (200 OK):**
    ```json
    {
      "success": true,
      "message": "History fetched",
      "data": {
        "history": [...],
        "pagination": {
          "page": 1,
          "limit": 20,
          "total": 5,
          "totalPages": 1,
          "hasNextPage": false,
          "hasPrevPage": false
        }
      },
      "error": null
    }
    ```

### 13.4 Curriculum
- **`GET /api/curriculum`**
  - **Headers:** `Authorization: Bearer <accessToken>`
  - **Response Payload (200 OK):**
    ```json
    {
      "success": true,
      "message": "Curriculum nodes fetched successfully",
      "data": [
        {
          "_id": "...",
          "name": "Grade 6",
          "nodeType": "grade",
          "parent": null,
          "tags": [],
          "metadata": {},
          "createdAt": "...",
          "updatedAt": "..."
        },
        {
          "_id": "...",
          "name": "Mathematics",
          "nodeType": "concept",
          "parent": { "_id": "..." },
          "tags": [],
          "metadata": {},
          "createdAt": "...",
          "updatedAt": "..."
        }
      ],
      "error": null
    }
    ```

---

## 14. Contract Versioning

This file is the source of truth. When any contract changes:
1. Update this file first.
2. Update the implementation.
3. Update relevant tests.
4. Note the change in `DECISIONS.md` with a rationale.

