# LERNZY — Task Tracker
> Derived from goal-alignment analysis of the v1 codebase against `ARCHITECTURE.md`, `DECISIONS.md`, `SCHEMA.md`, and `PERFORMANCE_BUDGET.md`.
> Status key: `[ ]` = open · `[x]` = done · `[~]` = partial / scaffolded only

---

## 🔴 Critical Fixes — Must resolve before any feature work

- [ ] **Resolve DB name merge conflict in `database.ts`**
  - Unresolved `<<<<<<< HEAD` marker between `lernzytutor.db` and `lernzy.db`
  - App crashes on device until this is fixed
  - Pick one name, remove all conflict markers

- [ ] **Remove or gate `sync.ts` behind an explicit opt-in**
  - Currently silently uploads progress events to the backend on login
  - Directly violates ADR-008 ("no network calls during normal use") and the privacy promise
  - For v1: either delete the file or guard every network call behind an opt-in toggle that defaults **off**

- [ ] **Reconcile the offline-vs-backend architecture conflict**
  - `ARCHITECTURE.md` mandates zero network during use; the `backend/` folder contains a full Node/Mongo/Redis API
  - Decision required: is the backend a future optional cloud tier, or a mistake?
  - Document the decision in `DECISIONS.md` as ADR-011 before any further backend work

---

## 🟠 Must Have — Required for a working v1

### AI Inference
- [~] **Wire up llama.rn inference in `tutor.ts`**
  - Current state: returns a hardcoded placeholder string
  - Load Phi-3 Mini GGUF from internal storage via `llama.rn`
  - Build system prompt using `promptBuilder.buildSystemPrompt(profile, session)`
  - Stream tokens into `TutorBubble` component (llama.rn supports streaming)
  - Implement Gemma 2B fallback for devices with ≤ 2 GB RAM
  - Keep inference off the main thread (see `PERFORMANCE_BUDGET.md §3`)

### Model Download
- [ ] **Build `ModelDownloadScreen`**
  - Fetch `models_manifest.json` from CDN
  - Download each model with per-model progress bar
  - Verify SHA-256 checksum per model (see `ADR-003`)
  - Resume interrupted downloads — do **not** restart from zero
  - On checksum failure, re-download only the failed model
  - Set `AsyncStorage: models_ready = true` on success
  - Prompt user to connect to Wi-Fi before starting

### Voice (STT / TTS)
- [ ] **Implement `sttClient.ts` using Whisper Tiny (on-device)**
  - Input: 16 kHz mono WAV from `VoiceInput.tsx`
  - Max recording length: 30 seconds (enforce in `VoiceInput`)
  - Budget: ≤ 6 s for a 5-second recording (see `PERFORMANCE_BUDGET.md §5`)
  - Must not use any network endpoint — Whisper runs locally

- [ ] **Implement `ttsClient.ts` using Piper TTS (on-device)**
  - One `.onnx` model per language (en / hi / kn)
  - Output: 22050 Hz WAV
  - Pre-generate audio for lesson `key_points` after `contentLoader.loadLesson` resolves
  - Delete WAV files after playback — do not accumulate
  - Budget: ≤ 2 s for ≤ 200 chars; ≤ 8 s for ≤ 1000 chars
  - **Do not use AWS Polly or ElevenLabs** — both require network (violates ADR-008)

### Curriculum Content
- [ ] **Author real lesson JSON for at least one complete chapter per subject per grade**
  - Subjects: Mathematics, Science, Social Studies, English, Kannada
  - Grades: 6, 7, 8
  - Each file must include: `base_story_template`, `concept_explanation`, `worked_example`, `key_points`, `interest_placeholders`, `quiz_bank` (5 questions), `flashcards` (5 cards)
  - All fields in three languages: `en`, `hi`, `kn`
  - Run `validate_content.py` before committing — no partial translations allowed
  - File path: `assets/content/grade_<N>/<subject>/<chapter_id>/lesson.json`

- [ ] **Create `quiz_bank.json` for each authored chapter**
  - Minimum 10 questions per topic across easy / medium / hard difficulty
  - Required by `quizGenerator.getNextQuestion()`

- [ ] **Create `flashcards.json` for each authored chapter**
  - Minimum 5 cards per topic
  - Include `memory_hook` field for each card
  - Required by `flashcardScheduler.getNextCard()`

### Screens (missing from `src/`)
- [ ] **Build `progress.tsx` screen**
  - Listed in `ARCHITECTURE.md` screen map but file is absent
  - Query local SQLite for: subject mastery per topic, daily streak, total session time, badges earned
  - Use streak query from `SCHEMA.md §Helper Queries`
  - Backend `progress.controller.js` logic can be referenced for XP calculation

- [ ] **Build `DiagramViewer` component**
  - Render bundled SVG assets via `react-native-svg`
  - ViewBox standard: `0 0 360 240` (mobile-first, per `ADR-010`)
  - Fonts: Noto Sans only; max file size: 50 KB per SVG
  - Wire into lesson screen alongside `TutorBubble`

- [ ] **Create SVG diagram assets for authored chapters**
  - One diagram per topic
  - Path: `assets/content/grade_<N>/<subject>/<chapter_id>/diagram_<topic_slug>.svg`
  - No external image references inside SVG

### Performance & Stability
- [ ] **Add `onTrimMemory` / React Native memory warning handler**
  - On low-memory callback: flush Piper TTS WAV cache
  - Clear `contentLoader` in-memory cache
  - Document in `PERFORMANCE_BUDGET.md §10`

- [ ] **Enforce `AccessibilityInfo.isReduceMotionEnabled()`**
  - Skip all animations when reduce-motion is enabled (instant transitions)
  - Required for child-safe compliance
  - Applies to: flashcard flip, bottom sheet open, screen transitions

---

## 🟡 Nice to Have — Improve the product after v1 is stable

### AI / Learning Quality
- [ ] **Streaming token output ("typing" effect) in `TutorBubble`**
  - `llama.rn` supports streaming tokens natively
  - Reduces perceived latency on first-token wait (≤ 8 s on Snapdragon 680)
  - Marked v2 in scope doc but low implementation cost once inference is wired
  - Implement after `tutor.ts` basic inference is working

- [ ] **Upgrade spaced repetition from SM-2 to FSRS**
  - ADR-006 defers this to v2 pending 6 months of usage data
  - Schema already supports it — no migration needed, only `flashcardScheduler.ts` changes
  - Revisit after sufficient `flashcard_reviews` data is accumulated

### Multi-User & Social
- [ ] **Multi-student profiles per device**
  - ADR-009 defers to v2
  - DB already uses `student_id` FKs everywhere — only UI changes needed
  - Add a profile-selection screen on app open
  - High value for households where siblings share one Android device

### Accessibility & Inclusion
- [ ] **Local progress PDF export (parent / teacher view)**
  - No cloud dependency — generate PDF from local SQLite data
  - Satisfies parent visibility need without violating ADR-008
  - Use `react-native-pdf` or a server-side PDF skill once available

- [ ] **Coding subject lessons**
  - `learningContent.ts` already lists a `coding` subject
  - Not in `ARCHITECTURE.md` v1 scope (only 5 subjects listed)
  - Consider for v1.1 — high engagement potential for 11–14 age group

### Curriculum Expansion
- [ ] **NCERT curriculum variant**
  - Scoped out of v1 (Karnataka State Board only)
  - `syllabusIndex.ts` can hold multiple board keys — no architecture change needed
  - Requires separate content authoring effort and `state_board` field toggle in student profile

### Infrastructure
- [ ] **Add CI enforcement for APK size budget (≤ 50 MB)**
  - `PERFORMANCE_BUDGET.md §12` notes this is the only budget worth CI-enforcing
  - Add `bundlesize` check in GitHub Actions on every PR

- [ ] **Add performance profiling hooks for inference and DB queries**
  - Wrap `runInference` with `Date.now()` timing in dev builds only
  - Wrap critical DB queries with `console.time` / `console.timeEnd`
  - Remove all timing logs from production builds via env flag

---

## ✅ Already Built — No action needed

- [x] Offline-first architecture (ADR-008 enforced, no network during use)
- [x] Multilingual UI and content structure (en / hi / kn, ADR-007)
- [x] SM-2 spaced repetition schema (migration 002, review audit log)
- [x] Adaptive MCQ quiz engine (difficulty stepping, history tracking)
- [x] Interest-injected lesson personalisation (`interestInjector`, `{{PLACEHOLDER}}` resolution)
- [x] 7-step onboarding wizard (name / grade / language / interests / learning style)
- [x] Achievements / badges (unique constraint, `first_quiz` trigger)
- [x] SQLite schema with migrations (idempotent, all FK constraints correct)
- [x] SSE streaming support in `askStream.controller.js` and `tutor.ts` (cloud path)
- [x] JWT auth with refresh token (15 min access / 7 day refresh)
- [x] Input validation, rate limiting, NoSQL sanitisation middleware
- [x] Content type definitions (`LessonContent`, `Question`, `FlashcardItem`)
- [x] Theme system (colors, typography, spacing, shadows — all CSS-variable-based)
- [x] i18n context with language switching

---

## Architecture Decisions Pending Documentation

- [ ] **ADR-011**: Define official stance on `backend/` — optional cloud tier vs. removed for v1
- [ ] **ADR-012**: Confirm Piper TTS ONNX bridge library choice (llama.rn companion vs. custom JNI)
- [ ] **ADR-013**: Confirm whether `coding` subject is in v1 or v1.1 scope
