# Architecture Decisions Log
> A chronological record of significant technical and design decisions.
> Every non-trivial choice that future developers might question should be recorded here.
> Format: ADR (Architecture Decision Record) — lightweight version.

---

## ADR-001 — React Native as the App Framework

**Date:** 2026-01  
**Status:** Accepted

**Context:** The app needs to run on Android with native performance for audio (STT/TTS) and local file access (model weights). Options considered: Flutter, native Android (Kotlin), React Native.

**Decision:** React Native (with Expo managed workflow where possible, bare workflow for native modules).

**Rationale:**
- Largest ecosystem for community-built native bridges (llama.cpp, audio, SQLite).
- JavaScript/TypeScript allows faster iteration on UI and content logic.
- Existing expertise in the team.
- Expo's asset bundling simplifies the large content folder management.
- Flutter was seriously considered but the llama.cpp React Native bridge (`llama.rn`) is more mature than Flutter equivalents.

**Trade-offs accepted:** Slightly heavier APK vs. native Kotlin. JS bridge overhead (~1–2ms) is negligible relative to inference time (~300–3000ms).

---

## ADR-002 — llama.cpp via `llama.rn` (Not a Bundled HTTP Server)

**Date:** 2026-01  
**Status:** Accepted

**Context:** llama.cpp can be used as (a) a JNI native module called directly from JS, (b) a local HTTP server running as a background service, or (c) via a third-party bridge like `llama.rn`.

**Decision:** Use `llama.rn` as the primary bridge. Fall back to a local HTTP server only as a last resort.

**Rationale:**
- `llama.rn` calls llama.cpp directly via JNI — no network round-trip, lower latency.
- Avoids the complexity of managing a background service lifetime on Android.
- `llama.rn` supports streaming tokens, which enables future "typing" effect in the tutor bubble.
- HTTP server fallback documented in `AI_MODEL_GUIDE.md` for cases where the native build fails.

**Trade-offs accepted:** Requires a custom native build; cannot use Expo Go for testing. Team must use development builds.

---

## ADR-003 — Models Downloaded on First Launch (Not Bundled in APK)

**Date:** 2026-01  
**Status:** Accepted

**Context:** The primary LLM (Phi-3 Mini INT4) is ~2.2 GB. Including it in the APK would make the Play Store submission size prohibitive (Play Store limit: 150 MB for APK + 2 GB for OBB).

**Decision:** Models are not bundled. On first launch, the app downloads all required models from a CDN over HTTPS, verifies SHA-256 checksums, and stores them in the app's internal storage.

**Rationale:**
- Keeps APK under 50 MB for smooth Play Store distribution.
- Allows model updates without a full app update.
- Users are on Wi-Fi during initial setup (the onboarding screen prompts for this).

**Trade-offs accepted:** First-launch experience requires ~2.5 GB download and ~5–10 minutes on a slow connection. Mitigated by: showing a friendly progress bar, allowing background download, and caching models permanently (no re-download on app update unless model version bumps).

**Follow-up:** Model checksums must be updated in `AI_MODEL_GUIDE.md` on every model version bump.

---

## ADR-004 — SQLite for All Local Persistence (No AsyncStorage for Student Data)

**Date:** 2026-01  
**Status:** Accepted

**Context:** React Native offers AsyncStorage (key-value), SQLite (relational), MMKV (fast key-value), and file system storage. Student profiles, quiz history, and flashcard schedules need querying and joining.

**Decision:** SQLite (via `expo-sqlite`) for all structured data. AsyncStorage only for lightweight app-state flags (e.g. `models_ready`, `onboarding_complete`).

**Rationale:**
- Quiz history and flashcard SM-2 scheduling require SQL queries (GROUP BY, date comparisons).
- SQLite is battle-tested on Android, handles concurrent reads, and supports migrations.
- AsyncStorage is not designed for relational data and gets slow above ~1 MB.
- MMKV is faster but lacks SQL — overkill for key-value only, insufficient for our queries.

---

## ADR-005 — Phi-3 Mini INT4 as Primary Model (Not Gemma or Mistral)

**Date:** 2026-01  
**Status:** Accepted; revisit every 6 months as new models are released.

**Context:** Multiple small LLMs are viable for on-device inference. Candidates: Phi-3 Mini, Gemma 2B, Llama 3.2 3B, Mistral 7B (larger devices only).

**Decision:** Phi-3 Mini 4K Instruct (GGUF INT4) as the primary model. Gemma 2B as the RAM-constrained fallback.

**Rationale:**
- Phi-3 Mini has the best quality/size ratio in benchmarks for instruction-following tasks in the 2–4B parameter range.
- Strong multilingual capability — Hindi and Kannada outputs are noticeably better than Gemma 2B.
- 2.2 GB footprint fits in 3 GB RAM devices with headroom for the app.
- Gemma 2B (1.5 GB) is used as fallback on ≤2 GB RAM devices where Phi-3 fails to load.

**Trade-offs accepted:** Phi-3 is slower than Gemma 2B on very low-end SoCs. Accepted — quality of multilingual output is more important than raw speed for this use case.

---

## ADR-006 — SM-2 Algorithm for Spaced Repetition (Not Custom)

**Date:** 2026-01  
**Status:** Accepted

**Context:** Flashcard scheduling requires a spaced repetition algorithm. Options: SM-2 (1987, open), SM-18 (Anki's variant, complex), FSRS (modern, more accurate), custom heuristic.

**Decision:** SM-2 as originally described by Piotr Wozniak.

**Rationale:**
- Well-understood, widely implemented, easy to debug.
- FSRS is more accurate but requires a calibration corpus — we have no prior data for v1.
- SM-2 is good enough for a first version; can be upgraded to FSRS in v2 once we have review data.
- Simple enough to implement correctly in ~50 lines of TypeScript.

**Follow-up:** Revisit after 6 months of usage data. FSRS upgrade tracked as a future issue.

---

## ADR-007 — All Three Languages in Every Content File (Not Lazy Loading)

**Date:** 2026-01  
**Status:** Accepted

**Context:** Lesson content can be stored as (a) one file per language, (b) a single multilingual file, or (c) English only with AI-generated translation at runtime.

**Decision:** A single multilingual JSON file with `en`, `hi`, and `kn` keys for every localised string.

**Rationale:**
- Option (a) triples the number of files to maintain and adds complexity to content loaders.
- Option (c) (AI translation at runtime) would be slow, unpredictable in quality, and inconsistent across sessions. Curriculum accuracy is too important to leave to runtime translation.
- Single multilingual files are easier to review, validate, and keep in sync.
- The validator (`validate_content.py`) enforces that all three languages are present — no partial translations can merge.

**Trade-offs accepted:** Content authors must write all three language versions. Mitigated by tooling: `generate_content.py` scaffolds skeleton files with `"..."` placeholders for translators to fill.

---

## ADR-008 — No External Network Calls During Normal App Use

**Date:** 2026-01  
**Status:** Accepted; architectural constraint, not revisitable.

**Context:** The app targets students in areas with unreliable or expensive mobile data. There is also a strong privacy requirement — student learning data should never leave the device.

**Decision:** Zero network calls during normal app use. The only exceptions are (a) first-launch model download and (b) model update checks (on Wi-Fi, with user consent).

**Rationale:**
- Non-negotiable for the target demographic — rural students on prepaid data plans.
- Eliminates all privacy and data protection concerns — DPDP Act (India) compliance is trivial when no data leaves the device.
- Forces cleaner architecture: all content, models, and logic must be self-contained.

**Enforcement:** `logger.ts` logs to local files only. No Sentry, no analytics SDK, no Firebase. Any PR introducing a network call in a non-download code path must be rejected.

---

## ADR-009 — Single Student Profile per Device (v1)

**Date:** 2026-01  
**Status:** Accepted for v1; explicitly planned for removal in v2.

**Context:** Multiple children in one household may share a device. Supporting multiple profiles adds complexity to the DB schema, UI navigation, and session management.

**Decision:** v1 supports exactly one student profile per device. The `students` table can hold multiple rows but the app only reads/writes the first created row.

**Rationale:**
- Simplifies onboarding (no "who are you?" step on every launch).
- Reduces development scope for v1.
- The DB schema is already structured to support multiple students (all tables have `student_id` foreign keys) — adding multi-profile UI in v2 will not require a schema migration.

**Trade-offs accepted:** Siblings sharing a device have a poor experience. Mitigated by: keeping the "edit profile" option accessible in Settings so a student can update their name and grade.

---

## ADR-010 — SVG for All Diagrams (Not Raster PNG/JPEG)

**Date:** 2026-01  
**Status:** Accepted

**Context:** Lesson diagrams need to render sharply on a wide range of screen densities (mdpi to xxxhdpi) and must be theme-aware (colour tokens for future dark mode).

**Decision:** All diagrams are SVG assets rendered via `react-native-svg`.

**Rationale:**
- Resolution-independent — looks sharp on any screen density.
- CSS variable–based colours (`var(--color-primary)`) allow future dark mode without re-exporting assets.
- Smaller file sizes than equivalent PNG at high resolution.
- `react-native-svg` is stable and well-maintained.

**Constraints (from CONTENT_SPEC.md):**
- ViewBox: `0 0 360 240` (mobile-first).
- Font: Noto Sans only.
- Max size: 50 KB per SVG.
- No external image references inside SVG.
