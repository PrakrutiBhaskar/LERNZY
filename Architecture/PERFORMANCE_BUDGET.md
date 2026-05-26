# PERFORMANCE_BUDGET.md — Lernzy Performance Constraints
> Hard limits and measurement guidance for a low-end Android target.
> Every performance-sensitive code path must stay within these budgets.

---

## 1. Target Device Baseline

All budgets are measured on or calibrated against:

| Spec | Target |
|---|---|
| RAM | 2 GB (absolute minimum); 3 GB (primary target) |
| SoC class | Snapdragon 680 / MediaTek Helio G85 (or equivalent 2020–2022 mid-low) |
| Storage | 32 GB eMMC (5.1, ~100 MB/s read) |
| Android version | Android 10+ |
| Screen | 720p, ~6 inch |
| Network (during use) | None (fully offline) |

---

## 2. Startup & Launch

| Metric | Budget | Notes |
|---|---|---|
| Cold start to Home screen | ≤ 4 seconds | After models are downloaded and onboarding is complete |
| Cold start to Onboarding screen | ≤ 3 seconds | First-ever launch (models not yet downloaded) |
| DB migration (all migrations) | ≤ 200 ms | Measured on cold SQLite open |
| Syllabus index load | ≤ 100 ms | `syllabusIndex.ts` — static JSON, cached after first read |

`initDatabase()` must complete before any repository function is called. Run it at the top of the root layout, not lazily.

---

## 3. AI Inference (LLM)

| Metric | Budget | Notes |
|---|---|---|
| First token latency | ≤ 8 seconds | Snapdragon 680 @ Phi-3 Mini INT4; acceptable for a "thinking" state |
| Full lesson response (≤ 512 tokens) | ≤ 40 seconds | ~3–8 tok/s typical; show `LoadingDots` throughout |
| Full quiz explanation (≤ 150 tokens) | ≤ 12 seconds | |
| Context prune overhead | ≤ 5 ms | `inferenceClient.ts` history slice — negligible |
| Retry (halved max_tokens) | triggers at first failure | Not a time budget — a correctness rule |

**Rule:** Never call `runInference` on the main thread. Always await in a non-blocking context. The UI must remain responsive (scrollable, tappable) while inference runs.

**Loading state:** `LoadingDots` component must appear within 100 ms of the inference call being dispatched.

---

## 4. Text-to-Speech (Piper TTS)

| Metric | Budget | Notes |
|---|---|---|
| Synthesis latency (≤ 200 chars) | ≤ 2 seconds | Key points, short feedback |
| Synthesis latency (≤ 1 000 chars) | ≤ 8 seconds | Full lesson paragraphs |
| Pre-generation batch (lesson key_points, all 3 bullets) | ≤ 5 seconds total | Run after lesson loads, before student reads |
| WAV file size (1 000 chars) | ≤ 2 MB | 22 050 Hz mono WAV |

Pre-generate TTS for lesson `key_points` in the background immediately after `contentLoader.loadLesson` resolves, so audio is ready by the time the student finishes reading. Do not block lesson render on TTS completion.

Caller must delete WAV files after playback — do not accumulate audio files in cache.

---

## 5. Speech-to-Text (Whisper Tiny)

| Metric | Budget | Notes |
|---|---|---|
| Transcription latency (5-second recording) | ≤ 6 seconds | Whisper Tiny on CPU |
| Transcription latency (15-second recording) | ≤ 15 seconds | Acceptable; show spinner |
| Max recording length | 30 seconds | Enforce in `VoiceInput.tsx`; auto-stop beyond this |

Input must be 16 kHz mono WAV. If the recording API produces a different format, convert before passing to `sttClient.transcribe`.

---

## 6. Content Loading

| Metric | Budget | Notes |
|---|---|---|
| `loadLesson` (first call, cold) | ≤ 150 ms | eMMC read + JSON parse |
| `loadLesson` (subsequent, cached) | ≤ 2 ms | In-memory cache |
| `loadQuizBank` (first call) | ≤ 100 ms | |
| `injectInterests` | ≤ 5 ms | Pure string replacement |
| `buildSystemPrompt` | ≤ 2 ms | Pure string operations |

The in-memory cache in `contentLoader.ts` is keyed by `(grade, subject, chapterId)`. Once loaded, a lesson is never re-read from disk in the same app session.

---

## 7. Database Queries

| Query | Budget | Notes |
|---|---|---|
| `getStudent(id)` | ≤ 5 ms | Primary key lookup |
| `getNextCard(studentId)` | ≤ 20 ms | Index on `(student_id, next_review_at)` |
| `getTopicMastery(studentId, topicId)` | ≤ 15 ms | Subquery over last 5 results |
| `saveQuizResult` | ≤ 10 ms | Simple insert |
| `getRecentSessions(studentId, 5)` | ≤ 15 ms | Index on `student_id` |
| `recordReview(cardId, rating)` | ≤ 20 ms | Update + insert audit row |

All DB calls are async (`execAsync`, `getFirstAsync`). Never block the JS thread with synchronous SQLite reads.

---

## 8. UI & Rendering

| Metric | Budget | Notes |
|---|---|---|
| Screen transition | ≤ 250 ms | Expo Router navigation |
| Flashcard flip animation | ≤ 300 ms | See `STYLE_GUIDE.md §9` |
| FlatList scroll (subject list) | 60 fps target | Low-end devices may achieve 30 fps — do not add layout effects to list items |
| Bottom sheet open | ≤ 280 ms | Spring animation, damping 18 |
| Button press feedback | ≤ 100 ms | Visual; haptic not required |
| SVG diagram render | ≤ 200 ms | `react-native-svg`; SVGs ≤ 50 KB each |
| Reduce motion | 0 ms (instant) | Honour `AccessibilityInfo.isReduceMotionEnabled()` — skip all animations |

**Rule:** Never use `useEffect` with expensive computation on every render. Memoize derived values with `useMemo`. Avoid re-renders caused by inline object/function creation in JSX.

---

## 9. APK & Asset Sizes

| Asset | Budget | Notes |
|---|---|---|
| APK size (Play Store) | ≤ 50 MB | Models not bundled (see ADR-003) |
| Content bundle (all grades, all subjects) | ≤ 30 MB | JSON + SVGs |
| Single SVG diagram | ≤ 50 KB | Enforced by `validate_content.py` |
| Fonts (all three Noto variants) | ≤ 12 MB total | Bundled in app |
| i18n JSON (all three languages) | ≤ 500 KB total | UI strings only |
| Model weights (post-download total) | ~2.5 GB | On internal storage; not in APK |

---

## 10. Memory Usage

| Component | Budget | Notes |
|---|---|---|
| App JS heap (idle, home screen) | ≤ 80 MB | No active inference |
| App JS heap (during lesson) | ≤ 120 MB | Lesson content + chat history in state |
| llama.cpp RSS (Phi-3 Mini INT4) | ≤ 1.8 GB | Including KV cache at n_ctx=2048 |
| Piper TTS WAV cache | ≤ 20 MB | Pre-generated audio; clear after lesson ends |
| SQLite in-memory | ≤ 10 MB | Expected data volume for one student |
| Content loader in-memory cache | ≤ 15 MB | One lesson + quiz bank per loaded chapter |

**Rule:** On low-memory callbacks (`onTrimMemory` / React Native memory warning), flush the TTS WAV cache and clear the content loader in-memory cache. The SQLite cache managed by `expo-sqlite` handles its own memory.

---

## 11. First-Launch Model Download

| Metric | Budget / Target |
|---|---|
| Estimated download size | ~2.5 GB (all models) |
| Download time on 4G (~5 Mbps) | ~60–70 minutes |
| Download time on Wi-Fi (~20 Mbps) | ~15–20 minutes |
| Checksum verification (per model) | ≤ 30 seconds |
| Resume on interrupted download | Required — do not restart from zero |
| Progress indication | Required — show per-model progress bar |

The onboarding screen must prompt the student to connect to Wi-Fi before starting the download. Downloads must be resumable. If a checksum fails, re-download that model file only (not all models).

---

## 12. Measurement Approach

These budgets are targets, not CI-enforced gates (except APK size). Measure manually:

- **Inference timing:** log `Date.now()` before and after `runInference` during development builds; remove logs from production builds
- **DB query timing:** wrap critical queries in `console.time` / `console.timeEnd` during profiling sessions
- **Startup time:** use Android `adb shell am start -W` and React Native's `Performance.now()` in the root layout
- **Memory:** Android Studio Profiler or `adb shell dumpsys meminfo com.lernzytutor.app`
- **APK size:** `eas build --platform android` output + `bundlesize` in CI for JS bundle

Performance is reviewed before every release milestone. Any budget exceeded by > 20% requires a documented decision in `DECISIONS.md`.
