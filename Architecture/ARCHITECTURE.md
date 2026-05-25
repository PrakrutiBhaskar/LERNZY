# ARCHITECTURE.md — Lernzy (Offline AI Tutor)
> System architecture overview for the Lernzy offline-first AI tutoring app.
> Read alongside `API_CONTRACTS.md`, `SCHEMA.md`, and `AI_MODEL_GUIDE.md`.

---

## 1. System Overview

Lernzy is a **fully offline, Android-first AI tutoring app** for middle school students (grades 6–8) in India. Every component — AI models, lesson content, voice models, and student data — lives entirely on the device. No network calls occur during normal use.

```
┌──────────────────────────────────────────────────────────┐
│                     React Native App                      │
│                                                          │
│  ┌────────────┐  ┌──────────────┐  ┌──────────────────┐ │
│  │   Screens  │  │  Components  │  │   Navigation     │ │
│  │ (Expo Router)│ │(TutorBubble, │  │ (Expo Router     │ │
│  │            │  │QuizOption…)  │  │  file-based)     │ │
│  └─────┬──────┘  └──────┬───────┘  └──────────────────┘ │
│        │                │                                 │
│  ┌─────▼────────────────▼──────────────────────────────┐ │
│  │                   Service Layer                      │ │
│  │  promptBuilder  inferenceClient  quizGenerator       │ │
│  │  ttsClient      sttClient        flashcardScheduler  │ │
│  │  contentLoader  interestInjector syllabusIndex       │ │
│  └──────┬──────────────────────────┬────────────────────┘ │
│         │                          │                       │
│  ┌──────▼───────┐        ┌────────▼──────────────────┐   │
│  │  SQLite DB   │        │     Bundled Assets         │   │
│  │(expo-sqlite) │        │  content/ models/ fonts/   │   │
│  └──────────────┘        └───────────────────────────┘   │
└──────────────────────────────────────────────────────────┘
         │
         ▼
┌─────────────────────────────┐
│  llama.cpp (via llama.rn)   │  ← Native JNI — no network
│  Whisper Tiny (STT)         │
│  Piper TTS (per language)   │
└─────────────────────────────┘
```

---

## 2. Tech Stack (Frozen for v1)

| Layer | Choice | Rationale |
|---|---|---|
| **App framework** | React Native (Expo, bare workflow) | Largest native bridge ecosystem; `llama.rn` maturity; JS iteration speed |
| **Navigation** | Expo Router (file-based) | Convention over configuration; deep link support for future use |
| **LLM inference** | `llama.rn` (JNI bridge to llama.cpp) | No HTTP round-trip; streaming-ready for v2; avoids background service complexity |
| **Primary model** | Phi-3 Mini 4K Instruct (GGUF INT4, ~2.2 GB) | Best multilingual quality/size ratio for 2–3 GB RAM devices |
| **Fallback model** | Gemma 2B (GGUF INT4, ~1.5 GB) | Used on ≤2 GB RAM devices where Phi-3 fails to load |
| **STT** | Whisper Tiny (multilingual) | On-device; auto-detects Hindi/Kannada/English |
| **TTS** | Piper TTS (.onnx, one per language) | Offline; natural voice; 22050 Hz WAV output |
| **Local database** | SQLite via `expo-sqlite` | Relational queries required for SM-2 scheduling and quiz history |
| **Spaced repetition** | SM-2 algorithm (pure TypeScript) | Well-understood; correct in ~50 lines; FSRS upgrade tracked for v2 |
| **Diagrams** | SVG assets via `react-native-svg` | Resolution-independent; theme-aware via CSS variables |
| **Icons** | Lucide React Native | Consistent; already a dependency |
| **i18n** | Static JSON bundles (`en.json`, `hi.json`, `kn.json`) | No runtime translation; guaranteed offline |
| **Fonts** | Noto Sans / Noto Sans Devanagari / Noto Sans Kannada (bundled) | Full script coverage; consistent across devices |
| **Lightweight KV store** | AsyncStorage | App-state flags only (`models_ready`, `onboarding_complete`) |

> See `DECISIONS.md` for the full rationale behind each choice (ADR-001 through ADR-010).

---

## 3. Module Map

### 3.1 AI Layer (`src/ai/`)

```
promptBuilder.ts       buildSystemPrompt(profile, session) → string
inferenceClient.ts     runInference(systemPrompt, messages, options?) → Promise<string>
ttsClient.ts           synthesise(text, language) → Promise<TTSResult>
                       pregenerate(texts, language) → Promise<Map<string,string>>
sttClient.ts           transcribe(audioUri) → Promise<STTResult>
quizGenerator.ts       getNextQuestion(topicId, studentId, history) → Promise<QuizQuestion>
                       evaluateAnswer(question, selectedIndex) → AnswerResult
flashcardScheduler.ts  getNextCard(studentId, topicId?) → Promise<Flashcard | null>
                       recordReview(cardId, rating) → Promise<void>
```

All contracts are fully specified in `API_CONTRACTS.md`. No module may be modified in a way that breaks these signatures without updating `API_CONTRACTS.md` first.

### 3.2 Database Layer (`src/db/`)

```
database.ts            initDatabase() — runs migrations on startup
studentRepository.ts   getStudent, upsertStudent, updateInterests, updateLanguage
sessionRepository.ts   startSession, endSession, getRecentSessions
quizRepository.ts      saveQuizResult, getQuizHistory, getTopicMastery
flashcardRepository.ts getNextCard, recordReview (SM-2 scheduling)
migrations/
  001_initial.sql      students, sessions, quiz_results, achievements
  002_flashcards.sql   flashcards, flashcard_reviews
```

Full schema in `SCHEMA.md`. Migrations run in order on every app launch and are idempotent.

### 3.3 Content Layer (`src/content/`)

```
contentLoader.ts       loadLesson, loadQuizBank, loadFlashcards
                       → reads from assets/content/grade_{N}/{subject}/{chapterId}/
                       → in-memory cache per (grade, subject, chapterId)
interestInjector.ts    injectInterests(template, interests, language) → string
                       → resolves {{PLACEHOLDER}} tokens from lesson.json lookup table
syllabusIndex.ts       grade → subject → chapter → topic map (static, bundled)
```

### 3.4 i18n Layer (`src/i18n/`)

UI strings only. Lesson content is multilingual inside `lesson.json` (all three languages stored per file — see `ADR-007`).

### 3.5 Screen Routing (`app/`)

```
(onboarding)/          welcome → name → grade → language → interests → learning-style → done
(home)/
  index.tsx            Subject dashboard (home)
  subject/[id].tsx     Chapter list
  lesson/[topicId].tsx Lesson screen (story + voice + diagrams)
  quiz/[topicId].tsx   MCQ quiz with adaptive difficulty
  flashcards/[topicId].tsx  Spaced repetition review
  progress.tsx         Student progress overview
  settings.tsx         Language switch, profile edit
```

---

## 4. Data Flow — Lesson Session

```
1. Student taps a topic
   └─ sessionRepository.startSession(studentId, subject, topicId)

2. contentLoader.loadLesson(grade, subject, chapterId)
   └─ returns LessonData from bundled JSON (cached in memory after first load)

3. interestInjector.injectInterests(template, student.interests, language)
   └─ {{STUDENT_NAME}}, {{INTEREST_PLACE}}, etc. resolved from lesson.json lookup

4. promptBuilder.buildSystemPrompt(profile, sessionContext)
   └─ fills SYSTEM_PROMPT.md template; all tokens substituted; no raw tokens in output

5. inferenceClient.runInference(systemPrompt, messages, options)
   └─ llama.rn → llama.cpp JNI → Phi-3 Mini (INT4) → raw assistant text

6. TutorBubble renders AI response
   └─ ttsClient.synthesise(text, language) → WAV → react-native-sound

7. Student may speak → VoiceInput records → sttClient.transcribe(uri) → text
   └─ goes back to step 5 as next user message (chat history maintained in component state)

8. Session end → sessionRepository.endSession(sessionId)
```

---

## 5. Data Flow — Quiz Session

```
1. quizGenerator.getNextQuestion(topicId, studentId, history)
   └─ reads quiz_bank.json via contentLoader
   └─ applies difficulty adaptation: 2 consecutive correct → step up; 2 wrong → step down
   └─ never repeats a question within a session

2. Student selects answer → quizGenerator.evaluateAnswer(question, index)
   └─ returns AnswerResult with correct flag + LocalisedString explanation

3. quizRepository.saveQuizResult(studentId, topicId, score, total)

4. Achievement check → if first quiz: achievements INSERT badge_key='first_quiz'
```

---

## 6. Offline Enforcement

All modules are designed assuming zero network access. Enforcement points:

- `inferenceClient.ts` connects only to `localhost` (llama.cpp JNI — no real socket)
- `logger.ts` writes to local files only — no remote log endpoints
- `contentLoader.ts` reads from `assets/` only
- No analytics SDK, no Sentry, no Firebase anywhere in the codebase
- `ADR-008` is an **architectural constraint**, not a preference — any PR adding a network call in a non-download path must be rejected during review

The only permitted network paths are:
1. First-launch model download (`download_models.sh` / initial setup screen)
2. Model update check (Wi-Fi only, with explicit user consent, post-onboarding)

---

## 7. Model Download Architecture

Models are not bundled in the APK. On first launch:

```
App open
  └─ Check AsyncStorage: models_ready === true?
       No → ModelDownloadScreen
              ├─ fetch models_manifest.json from CDN
              ├─ download each model with progress bar
              ├─ verify SHA-256 checksum (see AI_MODEL_GUIDE.md §3)
              └─ set AsyncStorage models_ready = true → proceed to onboarding
       Yes → check onboarding_complete
              No → OnboardingWizard
              Yes → HomeScreen
```

Model storage path: `/data/data/com.vidyatutor.app/files/models/`

---

## 8. Key Constraints (Non-Negotiable)

1. **Fully offline** — no network during normal use
2. **Low-end Android** — target 2 GB RAM, Snapdragon 680-class; no heavy animations; inference async with loading indicator
3. **Child-safe** — system prompt enforces age-appropriate output (11–14); no external links; no social features
4. **Multilingual consistency** — UI + voice + AI response always in the same language
5. **No account required** — student data never leaves device; no login; no cloud sync
6. **Encouraging tone** — wrong answers use `--color-warning`; never `--color-error`; mistakes framed as learning opportunities

---

## 9. v1 Scope Boundary (Frozen)

**In scope:**
- Android only
- Single student profile per device
- Grades 6, 7, 8
- Karnataka State Board curriculum
- Subjects: Mathematics, Science, Social Studies, English, Kannada
- Languages: English, Hindi, Kannada
- Teaching modes: story lesson, voice Q&A, diagrams, flashcards (SM-2), MCQ quiz
- Badges/achievements (no gamification beyond this)

**Out of scope (v2+):**
- Multi-student profiles
- Teacher/parent dashboard
- Cloud sync or backup
- NCERT curriculum variant
- Additional languages
- iOS
- Gamification beyond badges
- FSRS upgrade for spaced repetition
- Streaming token output (UI "typing" effect)

---

## 10. File Ownership

| Area | Owner module | Source of truth |
|---|---|---|
| AI contracts | `src/ai/*` | `API_CONTRACTS.md` |
| DB schema | `src/db/*` | `SCHEMA.md` |
| Visual tokens | All components | `STYLE_GUIDE.md` |
| Content format | `assets/content/**` | `CONTENT_SPEC.md` |
| Model config | `src/ai/inferenceClient.ts` | `AI_MODEL_GUIDE.md` |
| Folder layout | Entire repo | `FOLDER_STRUCTURE.md` |
| Tech choices | — | `DECISIONS.md` (ADR log) |
