# TESTING.md — Lernzy Testing Strategy
> Testing approach, conventions, and how to run tests for the Lernzy offline AI tutoring app.

---

## 1. Philosophy

Testing for Lernzy follows three priorities, in order:

1. **Correctness of offline logic** — SM-2 scheduling, quiz difficulty adaptation, interest placeholder injection, and prompt construction must be deterministic and fully unit-tested. These run millions of times and have no network fallback.
2. **Contract stability** — Every function in `API_CONTRACTS.md` is the boundary between modules. Tests must guard these signatures so a module can be safely replaced or refactored.
3. **No regressions in multilingual output** — Content validators and snapshot tests catch missing translations before they reach a student.

We do **not** aim for line-coverage targets. We aim for confidence in the paths that affect a student's learning experience.

---

## 2. Test Stack

| Layer | Tool | Why |
|---|---|---|
| Unit + integration | **Jest** with `ts-jest` | Standard in the RN/Expo ecosystem; fast; no device needed |
| React Native components | **React Native Testing Library (RNTL)** | Tests components as users interact with them |
| SQLite (in tests) | `expo-sqlite` with in-memory DB (`':memory:'`) | Real SQL, no file I/O, fast |
| Content validation | `validate_content.py` (Python, CI-only) | Validates all `lesson.json` and `quiz_bank.json` before merge |
| E2E (optional, v2) | Detox | Not in v1 scope — Android JNI builds are slow; defer until the app is stable |

---

## 3. Test Structure

```
__tests__/
  unit/
    ai/
      promptBuilder.test.ts
      inferenceClient.test.ts      ← mock llama.rn
      quizGenerator.test.ts
      flashcardScheduler.test.ts
      interestInjector.test.ts
    db/
      studentRepository.test.ts   ← uses in-memory SQLite
      quizRepository.test.ts
      flashcardRepository.test.ts
    content/
      contentLoader.test.ts       ← mock asset reads
      syllabusIndex.test.ts
  components/
    TutorBubble.test.tsx
    QuizOption.test.tsx
    FlashCard.test.tsx
    VoiceInput.test.tsx
  integration/
    lessonFlow.test.ts            ← prompt → inference (mocked) → TTS trigger
    quizFlow.test.ts              ← question → evaluate → save result
    flashcardFlow.test.ts         ← getNextCard → recordReview → SM-2 update
scripts/
  validate_content.py             ← run in CI; validates all JSON content files
```

---

## 4. Unit Test Coverage Requirements

These modules are **required** to have unit tests. PRs that modify them without updating tests will be rejected.

### 4.1 `flashcardScheduler.ts` — SM-2 Algorithm

SM-2 is pure math with no side effects. Every case must be tested.

```typescript
describe('SM-2 scheduling', () => {
  it('sets interval to 1 day and resets repetitions when rating is hard (q=2)', ...)
  it('increases interval on "good" rating after several correct reviews', ...)
  it('ease factor never falls below 1.3', ...)
  it('ease factor increases on "easy" rating', ...)
  it('calculates new interval correctly for repetitions=0,1,2+', ...)
  it('returns null when no cards are due', ...)
  it('returns the card with the earliest next_review_at when multiple are due', ...)
})
```

### 4.2 `quizGenerator.ts` — Difficulty Adaptation

```typescript
describe('quizGenerator', () => {
  it('steps difficulty UP after 2 consecutive correct answers', ...)
  it('steps difficulty DOWN after 2 consecutive wrong answers', ...)
  it('does not repeat a question within the same session', ...)
  it('falls back to random question when bank has fewer than 10 questions', ...)
  it('throws QuizError when topicId is not found', ...)
  it('evaluateAnswer returns correct: true when selectedIndex matches correctIndex', ...)
  it('evaluateAnswer returns correct: false with correct explanation on wrong answer', ...)
})
```

### 4.3 `promptBuilder.ts` — Token Substitution

```typescript
describe('buildSystemPrompt', () => {
  it('substitutes all {{VARIABLE}} tokens — no raw token remains in output', ...)
  it('maps language code "kn" to display name "Kannada"', ...)
  it('formats grade as "Grade 7" (capital G, space)', ...)
  it('joins interests array as comma-separated string', ...)
  it('uses safe default "a student" when name is missing', ...)
  it('does not throw on any missing optional field', ...)
})
```

### 4.4 `interestInjector.ts` — Placeholder Resolution

```typescript
describe('injectInterests', () => {
  it('resolves {{INTEREST_PLACE}} using first matching student interest', ...)
  it('falls back to "default" when no student interest matches the lookup', ...)
  it('replaces all {{GRADE}} tokens', ...)
  it('never leaves an unresolved {{TOKEN}} in the output', ...)
  it('returns template unchanged (no throw) when interests array is empty', ...)
})
```

### 4.5 `inferenceClient.ts` — Error Handling

```typescript
describe('inferenceClient', () => {
  it('retries once with maxTokens halved on first failure', ...)
  it('prunes chat history to last MAX_HISTORY_TURNS * 2 messages', ...)
  it('throws InferenceError with retryable: false on unrecoverable failure', ...)
  it('never resolves to an empty string — throws instead', ...)
})
```

---

## 5. Repository Tests (SQLite)

Use `expo-sqlite`'s in-memory mode for all DB tests. Each test file opens a fresh DB, runs migrations, then tears down.

```typescript
// test helper: testDb.ts
import * as SQLite from 'expo-sqlite';
import { initDatabase } from '../../src/db/database';

export async function openTestDb() {
  const db = SQLite.openDatabaseSync(':memory:');
  await initDatabase(db);
  return db;
}
```

Mandatory test cases for each repository:

**`studentRepository`:** upsert creates a new row; upsert with same id updates; updateInterests persists correct JSON; getStudent returns null for unknown id.

**`quizRepository`:** saveQuizResult stores all fields; getTopicMastery averages last 5 results (not all); returns 0 when no results exist.

**`flashcardRepository`:** only returns cards where `next_review_at <= today`; SM-2 fields update correctly after recordReview; audit row inserted in `flashcard_reviews` on every review.

---

## 6. Component Tests

Use React Native Testing Library. Do not test implementation details (internal state, private methods). Test what a student sees and taps.

```typescript
// Example: QuizOption
it('shows warning colour after wrong answer is submitted', async () => {
  render(<QuizOption label="Wrong answer" state="incorrect" onPress={noop} />);
  expect(screen.getByText('Wrong answer')).toHaveStyle({
    color: tokens.colorWarning,   // never colorError
  });
});

it('is accessible — has an accessible role of "button"', () => {
  render(<QuizOption label="Option A" state="default" onPress={noop} />);
  expect(screen.getByRole('button', { name: 'Option A' })).toBeTruthy();
});
```

Every interactive component must have:
- A test for its default render state
- A test for its primary interaction (press, flip, etc.)
- A test for its disabled/loading state (where applicable)
- An accessibility role/label test

---

## 7. Content Validation (`validate_content.py`)

Run automatically in CI on every PR that touches `assets/content/`.

```bash
python scripts/validate_content.py assets/content/
```

Checks enforced (from `CONTENT_SPEC.md §6`):

- `lesson.json` has all required top-level keys
- All three languages (`en`, `hi`, `kn`) present in every localised string field
- Every `topic_id` in `lesson.json` has a matching `quiz_bank.json`
- Each `quiz_bank.json` has ≥ 10 questions with correct difficulty distribution (≥3 easy, ≥4 medium, ≥3 hard)
- `correct_index` is 0–3
- All `diagram_refs` point to existing SVG files in the `diagrams/` folder
- No `{{placeholder}}` tokens left undefined in `interest_placeholders`
- No duplicate question text within a topic bank

Exit code 0 = all clear. Non-zero = list of failures. CI must pass before merge.

---

## 8. Running Tests

```bash
# All unit and component tests
npx jest

# Watch mode (during development)
npx jest --watch

# Single file
npx jest __tests__/unit/ai/flashcardScheduler.test.ts

# Coverage report
npx jest --coverage

# Content validation (requires Python 3.10+)
python scripts/validate_content.py assets/content/
```

---

## 9. Mocking Strategy

| Dependency | Mock approach |
|---|---|
| `llama.rn` (LLM) | Jest manual mock in `__mocks__/llama.rn.ts` — returns preset strings |
| `expo-sqlite` | Real in-memory DB (`:memory:`) — not mocked |
| `react-native-sound` | Jest manual mock — no-op play/stop |
| `expo-av` (audio recording) | Jest manual mock — returns fixture WAV path |
| Asset reads (`contentLoader`) | `jest.mock` with fixture JSON |
| `AsyncStorage` | `@react-native-async-storage/async-storage/jest/async-storage-mock` |

Do not mock `expo-sqlite`. Real SQL in tests is the only reliable way to catch schema mismatches and migration errors.

---

## 10. What We Do Not Test

- llama.cpp model output quality — non-deterministic; validated manually during model version bumps
- Piper TTS audio quality — validated manually during voice model selection
- Whisper transcription accuracy — validated manually with recorded audio samples
- Full E2E on a physical device — deferred to v2 (Detox); too slow for CI on JNI builds
- Play Store distribution or APK size — checked manually before release

---

## 11. CI Integration

Every PR runs:

1. `npx jest --ci` — all unit + component tests
2. `python scripts/validate_content.py assets/content/` — only if `assets/content/**` changed
3. TypeScript compile check: `npx tsc --noEmit`

PRs that fail any check are blocked from merge. No exceptions.
