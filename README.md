# 🎓 LERNZY
### Offline AI Tutor for Middle School Students in India

> **Fully offline. Deeply personal. Built for Bharat.**
> An on-device AI tutoring app for grades 6–8 that teaches every subject by weaving lessons around each student's own interests — in English, Hindi, or Kannada — with zero internet required after first setup.

---

## Table of Contents

- [Overview](#overview)
- [Key Features](#key-features)
- [Tech Stack](#tech-stack)
- [Architecture](#architecture)
- [Database Schema](#database-schema)
- [Module Reference](#module-reference)
- [Getting Started](#getting-started)
- [Project Structure](#project-structure)
- [Content Format](#content-format)
- [Learning Modes](#learning-modes)
- [Offline Guarantee](#offline-guarantee)
- [Performance Targets](#performance-targets)
- [Roadmap](#roadmap)
- [Contributing](#contributing)
- [License](#license)

---

## Overview

LERNZY is an **Android-first, fully offline AI tutoring app** for middle school students (ages 11–14) in India. Every component — AI models, lesson content, voice models, and student data — lives entirely on the device. No network calls occur during normal use.

The app personalises every lesson around the student's individual interests (cricket, drawing, space, etc.) and delivers content in their preferred language. A student who loves cricket will learn fractions through cricket score averages; a student who loves drawing will learn geometry through art composition.

| Attribute | Value |
|-----------|-------|
| Target audience | Grades 6, 7, 8 (ages 11–14), India |
| Platform | Android (v1), iOS planned for v2 |
| Curriculum | Karnataka State Board (NCERT variant in v2) |
| Languages | English · Hindi · Kannada |
| Subjects | Mathematics · Science · Social Studies · English · Kannada |
| Internet required | Only for first-launch model download (~2.5 GB) |
| Student data leaves device | Never |

---

## Key Features

- **Interest-injected lessons** — Lessons use `{{PLACEHOLDER}}` tokens resolved at runtime to the student's real interests. A lesson on fractions reads differently for a cricket fan vs. a cooking enthusiast.
- **On-device LLM** — Phi-3 Mini 4K Instruct (INT4, ~2.2 GB) runs locally via `llama.rn` / `llama.cpp` JNI. No API keys. No data sent to any server.
- **Voice Q&A** — Whisper Tiny (multilingual STT) understands Hindi, Kannada, and English. Piper TTS responds in the student's language.
- **Spaced repetition flashcards** — SM-2 algorithm schedules card reviews optimally. Audit log preserved for future FSRS upgrade.
- **Adaptive MCQ quizzes** — Difficulty steps up after 2 consecutive correct answers and down after 2 wrong. Never repeats a question within a session.
- **Achievements & badges** — Milestones like `first_quiz`, `week_streak_3`, and subject mastery badges earned locally.
- **No account required** — No login, no cloud sync, no ads. All student data stays on the device and is deleted on app uninstall.

---

## Tech Stack

| Layer | Technology | Why |
|-------|-----------|-----|
| App framework | React Native (Expo, bare workflow) | Mature `llama.rn` bridge; fast JS iteration; Expo asset bundling |
| Navigation | Expo Router (file-based) | Convention over configuration; deep link ready |
| LLM inference | `llama.rn` → `llama.cpp` (JNI) | Zero network; streaming-ready; no background service complexity |
| Primary model | Phi-3 Mini 4K Instruct — GGUF INT4, ~2.2 GB | Best multilingual quality/size ratio for 2–3 GB RAM devices |
| Fallback model | Gemma 2B — GGUF INT4, ~1.5 GB | Used on ≤ 2 GB RAM devices where Phi-3 fails to load |
| STT | Whisper Tiny (multilingual, on-device) | Auto-detects Hindi / Kannada / English; runs offline |
| TTS | Piper TTS (`.onnx`, one model per language) | Offline; natural voice; 22050 Hz WAV output |
| Local database | SQLite via `expo-sqlite` | Relational queries for SM-2 scheduling and quiz history |
| Spaced repetition | SM-2 (pure TypeScript) | Correct in ~50 lines; FSRS upgrade tracked for v2 |
| Diagrams | SVG assets via `react-native-svg` | Resolution-independent; theme-aware |
| i18n | Static JSON bundles (`en.json`, `hi.json`, `kn.json`) | No runtime translation; guaranteed offline |
| Fonts | Noto Sans / Noto Sans Devanagari / Noto Sans Kannada (bundled) | Full script coverage across all target devices |
| Lightweight KV | AsyncStorage | App-state flags only (`models_ready`, `onboarding_complete`) |

> Full rationale for each choice is documented as ADRs in [`Architecture/DECISIONS.md`](Architecture/DECISIONS.md).

---

## Architecture

```
┌──────────────────────────────────────────────────────────┐
│                     React Native App                      │
│                                                          │
│  ┌────────────┐  ┌──────────────┐  ┌──────────────────┐ │
│  │   Screens  │  │  Components  │  │   Navigation     │ │
│  │(Expo Router)│ │(TutorBubble, │  │ (Expo Router     │ │
│  │            │  │ QuizOption…) │  │  file-based)     │ │
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

### Lesson Data Flow

```
Student taps topic
  → sessionRepository.startSession()
  → contentLoader.loadLesson()          (reads bundled JSON, cached after first load)
  → interestInjector.injectInterests()  (resolves {{PLACEHOLDER}} tokens)
  → promptBuilder.buildSystemPrompt()   (fills all SYSTEM_PROMPT.md tokens)
  → inferenceClient.runInference()      (llama.rn → Phi-3 Mini INT4)
  → TutorBubble renders response
  → ttsClient.synthesise()              (Piper TTS → WAV → playback)
  → [student speaks] → sttClient.transcribe() → next user message
  → sessionRepository.endSession()
```

---

## Database Schema

All student data lives exclusively on the device in a local SQLite database (`lernzy.db`). Nothing is synced to any server.

```
┌─────────────────────────────────────────────────────────────────┐
│  students                                                        │
│  id · name · grade · language · interests_json · learning_style  │
│  state_board · onboarding_done · created_at · updated_at         │
└──────┬────────────────────────────────┬───────────────┬──────────┘
       │ 1:N                            │ 1:N           │ 1:N
       ▼                                ▼               ▼
┌─────────────────┐  ┌──────────────────────┐  ┌──────────────────┐
│  sessions        │  │  quiz_results         │  │  achievements    │
│  subject         │  │  topic_id             │  │  badge_key       │
│  chapter_id      │  │  score / total        │  │  earned_at       │
│  topic_id · mode │  │  difficulty_level     │  │  (unique per     │
│  started_at      │  │  attempted_at         │  │   student+badge) │
│  ended_at        │  └──────────────────────┘  └──────────────────┘
└─────────────────┘

       │ 1:N (also from students)
       ▼
┌──────────────────────────────────────────────────────────────────┐
│  flashcards                                                       │
│  student_id · topic_id · source (bundled|ai_generated)           │
│  front_text · back_text · memory_hook                            │
│  ease_factor · interval_days · repetitions · next_review_at      │ ← SM-2 fields
└──────────────────────────────────────┬───────────────────────────┘
                                       │ 1:N
                                       ▼
                       ┌───────────────────────────────┐
                       │  flashcard_reviews             │
                       │  flashcard_id · student_id     │
                       │  rating (easy|good|hard)       │
                       │  new_interval_days             │
                       │  new_ease_factor               │
                       └───────────────────────────────┘
```

Migrations run in order on every app launch and are idempotent:

| Migration | Tables |
|-----------|--------|
| `001_initial.sql` | `students`, `sessions`, `quiz_results`, `achievements` |
| `002_flashcards.sql` | `flashcards`, `flashcard_reviews` |

---

## Module Reference

### AI Layer (`src/ai/`)

| Module | Key Export | Description |
|--------|-----------|-------------|
| `promptBuilder.ts` | `buildSystemPrompt(profile, session)` | Builds fully-substituted system prompt for llama.cpp |
| `inferenceClient.ts` | `runInference(systemPrompt, messages, options?)` | Sends chat request to local llama.cpp JNI; retries once with halved `maxTokens` on failure |
| `ttsClient.ts` | `synthesise(text, language)` | Piper TTS → local WAV file; `pregenerate()` warms up lesson key points |
| `sttClient.ts` | `transcribe(audioUri)` | Whisper Tiny on-device; 16 kHz mono WAV; ≤ 30s max |
| `quizGenerator.ts` | `getNextQuestion()` · `evaluateAnswer()` | Adaptive difficulty quiz engine |
| `flashcardScheduler.ts` | `getNextCard()` · `recordReview()` | SM-2 spaced repetition scheduler |

### Database Layer (`src/db/`)

| Repository | Purpose |
|-----------|---------|
| `studentRepository.ts` | `getStudent`, `upsertStudent`, `updateInterests`, `updateLanguage` |
| `sessionRepository.ts` | `startSession`, `endSession`, `getRecentSessions` |
| `quizRepository.ts` | `saveQuizResult`, `getQuizHistory`, `getTopicMastery` |
| `flashcardRepository.ts` | `getNextCard`, `recordReview` (SM-2 scheduling) |

### Content Layer (`src/content/`)

| Module | Purpose |
|--------|---------|
| `contentLoader.ts` | Loads `lesson.json`, `quiz_bank.json`, `flashcards.json` from bundled assets; in-memory cache per `(grade, subject, chapterId)` |
| `interestInjector.ts` | Resolves `{{PLACEHOLDER}}` tokens in lesson templates using student interests |
| `syllabusIndex.ts` | Static grade → subject → chapter → topic map |

---

## Getting Started

### Prerequisites

- Node.js ≥ 18
- Android Studio with Android SDK
- A physical Android device or emulator with ≥ 2 GB RAM (emulators cannot run LLM inference efficiently — a real device is strongly recommended)
- `expo-cli` or `npx expo`

### Installation

```bash
# Clone the repository
git clone https://github.com/your-org/lernzy.git
cd lernzy

# Install dependencies
npm install

# Start the development build (bare workflow — Expo Go won't work)
npx expo run:android
```

> **First launch:** The app will prompt you to download models (~2.5 GB). Connect to Wi-Fi before proceeding. Model files are stored in the app's internal storage and are never re-downloaded unless the model version changes.

### Model Download (First Launch)

```
App opens → checks AsyncStorage: models_ready === true?
  No  → ModelDownloadScreen
         ├─ fetches models_manifest.json from CDN
         ├─ downloads each model with progress bar
         ├─ verifies SHA-256 checksum per model
         └─ sets models_ready = true → OnboardingWizard
  Yes → checks onboarding_complete
         No  → OnboardingWizard
         Yes → HomeScreen
```

Model files are stored at: `/data/data/com.lernzy.app/files/models/`

### Onboarding

The 7-step wizard collects:
1. Student name
2. Grade (6, 7, or 8)
3. Preferred language (English / Hindi / Kannada)
4. Interests (multi-select: cricket, drawing, cooking, space, etc.)
5. Learning style (stories / diagrams / mixed)
6. State board (Karnataka — only option in v1)
7. Confirmation

---

## Project Structure

```
lernzy/
├── app/                          # Expo Router screens
│   ├── (onboarding)/             # welcome → name → grade → language → interests → style → done
│   └── (home)/
│       ├── index.tsx             # Subject dashboard
│       ├── subject/[id].tsx      # Chapter list
│       ├── lesson/[topicId].tsx  # Lesson screen (story + voice + diagrams)
│       ├── quiz/[topicId].tsx    # MCQ quiz with adaptive difficulty
│       ├── flashcards/[topicId].tsx  # Spaced repetition review
│       ├── progress.tsx          # Student progress overview
│       └── settings.tsx          # Language switch, profile edit
├── src/
│   ├── ai/                       # AI inference layer
│   ├── content/                  # Content loading and interest injection
│   ├── db/                       # SQLite repositories and migrations
│   ├── i18n/                     # UI string bundles (en/hi/kn)
│   └── components/               # TutorBubble, QuizOption, DiagramViewer, etc.
├── assets/
│   ├── content/
│   │   └── grade_{6,7,8}/
│   │       └── {subject}/
│   │           └── {chapter_id}/
│   │               ├── lesson.json         # Trilingual lesson content
│   │               ├── quiz_bank.json      # 10+ questions per topic
│   │               ├── flashcards.json     # 5+ cards per topic
│   │               └── diagram_{topic}.svg # One diagram per topic
│   ├── models/                   # Downloaded on first launch (not bundled)
│   └── fonts/                    # Noto Sans (en/hi/kn)
├── Architecture/
│   ├── ARCHITECTURE.md
│   ├── API_CONTRACTS.md
│   ├── SCHEMA.md
│   ├── DECISIONS.md
│   ├── STYLE_GUIDE.md
│   ├── TESTING.md
│   └── PERFORMANCE_BUDGET.md
└── TASKS.md
```

---

## Content Format

Lesson content lives in `assets/content/grade_{N}/{subject}/{chapter_id}/lesson.json`. All fields are present in all three languages.

```json
{
  "en": {
    "base_story_template": "{{STUDENT_NAME}} was at a cricket match when...",
    "concept_explanation": "Fractions represent parts of a whole...",
    "worked_example": "If Virat scored 3/4 of the team's runs...",
    "key_points": ["Numerator is the top number", "Denominator is the bottom number"],
    "interest_placeholders": {
      "INTEREST_PLACE": { "cricket": "cricket stadium", "drawing": "art studio" }
    }
  },
  "hi": { ... },
  "kn": { ... },
  "quiz_bank": [...],
  "flashcards": [...]
}
```

Run `validate_content.py` before committing content — partial translations are rejected.

---

## Learning Modes

| Mode | Description |
|------|-------------|
| `lesson` | AI-narrated story lesson with interest injection and optional voice Q&A |
| `quiz` | Adaptive MCQ quiz — difficulty steps up/down based on consecutive results |
| `flashcard` | SM-2 spaced repetition review with `easy / good / hard` rating |
| `revision` | Quick summary of a previously completed topic |
| `freeask` | Open-ended Q&A with the AI tutor on any topic |

---

## Offline Guarantee

LERNZY enforces strict offline operation as an architectural constraint (ADR-008), not a preference.

**Permitted network paths:**
1. First-launch model download (explicit user action, progress bar shown)
2. Model update check (Wi-Fi only, explicit user consent, post-onboarding)

**Enforced offline everywhere else:**
- `inferenceClient.ts` connects only via JNI (no real socket)
- `contentLoader.ts` reads from `assets/` only
- No analytics SDK, no Sentry, no Firebase, no remote logging
- `logger.ts` writes to local files only

> ⚠️ Any pull request that adds a network call in a non-download code path **must be rejected** during review. Document the decision in `DECISIONS.md` first if architecture needs to change.

---

## Performance Targets

| Operation | Budget | Device target |
|-----------|--------|---------------|
| First inference token | ≤ 8 s | Snapdragon 680, 2 GB RAM |
| TTS synthesis ≤ 200 chars | ≤ 2 s | Same |
| TTS synthesis ≤ 1000 chars | ≤ 8 s | Same |
| STT transcription (5 s audio) | ≤ 6 s | Same |
| SQLite quiz history query | ≤ 50 ms | Any |
| App cold start to home screen | ≤ 3 s | Same |
| APK size | ≤ 50 MB | — |

See [`Architecture/PERFORMANCE_BUDGET.md`](Architecture/PERFORMANCE_BUDGET.md) for the full breakdown.

---

## Roadmap

### v1 (Current — In Progress)

- [x] Offline-first architecture (ADR-008)
- [x] Multilingual UI and content structure (en / hi / kn)
- [x] SM-2 spaced repetition schema
- [x] Adaptive MCQ quiz engine
- [x] Interest-injected lesson personalisation
- [x] 7-step onboarding wizard
- [x] Achievements / badges
- [x] SQLite schema with migrations
- [ ] Wire up llama.rn inference (`tutor.ts` currently returns placeholder)
- [ ] `ModelDownloadScreen` with SHA-256 verification and resume support
- [ ] `sttClient.ts` — Whisper Tiny on-device
- [ ] `ttsClient.ts` — Piper TTS on-device
- [ ] Lesson content for at least one chapter per subject per grade
- [ ] `progress.tsx` screen
- [ ] `DiagramViewer` component

### v2 (Planned)

- Multi-student profiles per device
- Streaming token output ("typing" effect) in TutorBubble
- FSRS spaced repetition upgrade (replaces SM-2)
- NCERT curriculum variant
- Local progress PDF export (parent/teacher view)
- iOS support
- Teacher/parent dashboard (read-only, local)

---

## Contributing

See [`Architecture/CONTRIBUTING.md`](Architecture/CONTRIBUTING.md) for the full contribution guide.

**Quick rules:**
- No network calls in non-download paths (ADR-008 is non-negotiable)
- All AI module changes must honour the contracts in `API_CONTRACTS.md` — update the contracts doc first if signatures must change
- Content PRs must pass `validate_content.py` (no partial translations)
- All three languages (`en`, `hi`, `kn`) must be present in every lesson JSON
- Style tokens from `STYLE_GUIDE.md` must be used for all UI; no hardcoded colours
- Wrong answers use `--color-warning`; never `--color-error` — mistakes are learning opportunities

---

## License

[MIT](LICENSE) © 2026 LERNZY Contributors