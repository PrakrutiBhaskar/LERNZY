# Project Folder Structure
> Complete directory tree for the Offline AI Tutor — React Native app.
> Every folder and file is explained. Use this as the source of truth for scaffolding.

---

```
lernzy/
│
├── PROJECT_CONTEXT.md              ← Full project context (for AI models)
├── SYSTEM_PROMPT.md                ← Master AI system prompt with variable reference
├── FOLDER_STRUCTURE.md             ← This file
├── SCHEMA.md                       ← SQLite database schema
├── CONTENT_SPEC.md                 ← Lesson/quiz content format specification
├── AI_MODEL_GUIDE.md               ← Model selection, quantisation, inference setup
├── API_CONTRACTS.md                ← Internal JS API contracts between modules
├── ONBOARDING_FLOW.md              ← Onboarding wizard UX flow and logic
├── STYLE_GUIDE.md                  ← UI design tokens, colours, typography
├── DECISIONS.md                    ← Architecture decision log
│
├── app/                            ← React Native source (Expo or bare RN)
│   ├── index.tsx                   ← App entry point
│   ├── _layout.tsx                 ← Root layout / navigation shell
│   │
│   ├── (onboarding)/               ← Onboarding wizard screens (shown once)
│   │   ├── welcome.tsx
│   │   ├── name.tsx
│   │   ├── grade.tsx
│   │   ├── language.tsx
│   │   ├── interests.tsx
│   │   ├── learning-style.tsx
│   │   └── done.tsx
│   │
│   ├── (home)/                     ← Main app screens (post-onboarding)
│   │   ├── index.tsx               ← Home / subject dashboard
│   │   ├── subject/[id].tsx        ← Subject chapter list
│   │   ├── lesson/[topicId].tsx    ← Lesson screen
│   │   ├── quiz/[topicId].tsx      ← Quiz screen
│   │   ├── flashcards/[topicId].tsx← Flashcard review screen
│   │   ├── progress.tsx            ← Student progress overview
│   │   └── settings.tsx            ← Language switch, profile edit
│   │
│   └── components/                 ← Reusable UI components
│       ├── TutorBubble.tsx         ← AI response display (text + TTS trigger)
│       ├── VoiceInput.tsx          ← Microphone button + Whisper STT
│       ├── FlashCard.tsx           ← Flip card component
│       ├── QuizOption.tsx          ← MCQ option button
│       ├── DiagramViewer.tsx       ← SVG diagram renderer
│       ├── ProgressBar.tsx         ← Topic completion bar
│       ├── InterestGrid.tsx        ← Interest picker (onboarding)
│       └── LoadingDots.tsx         ← Inference in-progress indicator
│
├── src/
│   ├── ai/
│   │   ├── promptBuilder.ts        ← buildSystemPrompt(profile, session) function
│   │   ├── inferenceClient.ts      ← llama.cpp local HTTP client wrapper
│   │   ├── ttsClient.ts            ← Piper TTS wrapper (text → audio)
│   │   ├── sttClient.ts            ← Whisper STT wrapper (audio → text)
│   │   ├── quizGenerator.ts        ← Quiz Q generation + difficulty adaptation
│   │   └── flashcardScheduler.ts   ← SM-2 spaced repetition algorithm
│   │
│   ├── db/
│   │   ├── database.ts             ← SQLite init + migration runner
│   │   ├── studentRepository.ts    ← CRUD for student profile
│   │   ├── sessionRepository.ts    ← CRUD for learning sessions
│   │   ├── quizRepository.ts       ← CRUD for quiz results
│   │   ├── flashcardRepository.ts  ← CRUD + SM-2 scheduling queries
│   │   └── migrations/
│   │       ├── 001_initial.sql
│   │       └── 002_flashcards.sql
│   │
│   ├── content/
│   │   ├── contentLoader.ts        ← Load lesson JSON from bundled assets
│   │   ├── interestInjector.ts     ← Replace {{placeholders}} with student interests
│   │   └── syllabusIndex.ts        ← Grade → Subject → Chapter → Topic map
│   │
│   ├── i18n/
│   │   ├── index.ts                ← Language switcher
│   │   ├── en.json                 ← English UI strings
│   │   ├── hi.json                 ← Hindi UI strings
│   │   └── kn.json                 ← Kannada UI strings
│   │
│   └── utils/
│       ├── storage.ts              ← AsyncStorage helpers
│       ├── permissions.ts          ← Microphone permission handling
│       └── logger.ts               ← Local debug logger (no remote logging)
│
├── assets/
│   ├── content/                    ← Bundled lesson content
│   │   ├── grade_6/
│   │   │   ├── mathematics/
│   │   │   │   └── ch01_integers/
│   │   │   │       ├── lesson.json
│   │   │   │       ├── quiz_bank.json
│   │   │   │       └── diagrams/
│   │   │   │           └── number_line.svg
│   │   │   ├── science/
│   │   │   ├── social_studies/
│   │   │   ├── english/
│   │   │   └── kannada/
│   │   ├── grade_7/
│   │   └── grade_8/
│   │
│   ├── models/                     ← AI model weights (downloaded on first launch)
│   │   ├── phi3_mini_int4.gguf     ← Primary LLM (~2.2 GB)
│   │   ├── whisper_tiny.bin        ← STT model (~75 MB)
│   │   ├── piper_en.onnx           ← English TTS
│   │   ├── piper_hi.onnx           ← Hindi TTS
│   │   └── piper_kn.onnx           ← Kannada TTS
│   │
│   ├── images/
│   │   ├── interests/              ← Interest grid icons (SVG)
│   │   ├── subjects/               ← Subject icons
│   │   └── badges/                 ← Achievement badge images
│   │
│   └── fonts/
│       ├── NotoSansKannada/
│       ├── NotoSansDevanagari/
│       └── NotoSans/
│
├── scripts/
│   ├── download_models.sh          ← Download + verify model weights
│   ├── generate_content.py         ← Scaffold lesson JSON from syllabus CSV
│   └── validate_content.py         ← Lint all lesson.json + quiz_bank.json files
│
├── docs/
│   ├── ARCHITECTURE.md             ← System architecture diagram (text)
│   ├── CONTRIBUTING.md             ← How to add new content / languages
│   └── TESTING.md                  ← Testing strategy + how to run tests
│
├── package.json
├── tsconfig.json
├── app.json                        ← Expo config
├── babel.config.js
└── .env.example                    ← Environment variable template
```

---

## Key Naming Conventions

| Type | Convention | Example |
|---|---|---|
| React components | PascalCase | `TutorBubble.tsx` |
| Utility functions | camelCase | `promptBuilder.ts` |
| Content folders | snake_case | `ch01_integers/` |
| SQL migrations | `NNN_description.sql` | `001_initial.sql` |
| i18n keys | `dot.notation` | `home.greeting` |
| SQLite tables | snake_case plural | `quiz_results` |

---

## Files an AI Model Should Read First (in order)

1. `PROJECT_CONTEXT.md`
2. `SYSTEM_PROMPT.md`
3. `SCHEMA.md`
4. `CONTENT_SPEC.md`
5. `API_CONTRACTS.md`
6. `FOLDER_STRUCTURE.md` (this file)
