# CONTRIBUTING.md — Lernzy Contributor Guide
> How to set up the project, add code, add content, and get a PR merged.

---

## 1. Before You Start

Read these files first — in this order. They are the source of truth for every decision in this codebase.

1. `context/PROJECT_CONTEXT.md` — what the app is and who it is for
2. `Architecture/SCHEMA.md` — database schema
3. `Architecture/API_CONTRACTS.md` — module interfaces (do not break these)
4. `Architecture/STYLE_GUIDE.md` — design tokens (do not hardcode values)
5. `context/CONTENT_SPEC.md` — lesson/quiz JSON format
6. `Architecture/DECISIONS.md` — why things are the way they are

If a decision you want to make contradicts something in these files, open a discussion or ADR proposal before writing code.

---

## 2. Environment Setup

### Prerequisites

- Node.js 20 LTS or newer
- Python 3.10+ (for content validation scripts)
- Android Studio with SDK Platform 33+ and a physical device or emulator (API 30+)
- Java 17 (required for Android build tools)

### Install

```bash
git clone https://github.com/your-org/lernzy.git
cd lernzy
npm install
```

### Development Build (required — Expo Go is not supported)

The app uses native modules (`llama.rn`, `expo-sqlite`, audio). Expo Go cannot load these.

```bash
# Build and install on a connected Android device
npx expo run:android

# Or build a development APK
eas build --platform android --profile development
```

### Environment Variables

Copy `.env.example` to `.env` and fill in values:

```bash
cp .env.example .env
```

The only required variable for local development is `MODEL_CDN_BASE_URL` (the HTTPS URL from which models are downloaded on first launch). Ask the project lead for the CDN URL.

### Running Tests

```bash
# All tests
npx jest

# Watch mode
npx jest --watch

# TypeScript check
npx tsc --noEmit

# Content validation (requires assets/content/ to exist)
python scripts/validate_content.py assets/content/
```

---

## 3. Coding Conventions

### Language & Tooling

- **TypeScript everywhere.** No plain `.js` files in `src/` or `app/`.
- Strict mode is enabled in `tsconfig.json`. Do not weaken it.
- ESLint and Prettier are pre-configured. Run `npm run lint` before committing.
- `npm run format` applies Prettier to all files.

### File Naming

| What | Convention | Example |
|---|---|---|
| React components | PascalCase | `TutorBubble.tsx` |
| Non-component TS modules | camelCase | `promptBuilder.ts` |
| Test files | Same name + `.test.ts(x)` | `promptBuilder.test.ts` |
| Content folders | snake_case | `ch03_fractions_decimals/` |
| Migration files | `NNN_description.sql` | `003_badges_extended.sql` |
| i18n keys | dot.notation | `home.welcome_back` |

### TypeScript Conventions

- Prefer `interface` over `type` for object shapes that may be extended.
- Prefer `type` for unions, intersections, and aliases.
- All exported functions must have explicit return types.
- No `any`. Use `unknown` when the type is genuinely unknown, then narrow it.
- Error types live in `src/utils/errors.ts` — add new error classes there, not inline.

### Module Contracts

The signatures in `API_CONTRACTS.md` are **frozen for v1**. You may:
- Add a new optional field to an options interface (with a documented default)
- Add a new overload to an existing function

You must **not**:
- Change a required parameter type or name
- Change a return type
- Remove a function
- Add a required parameter

If a contract change is genuinely necessary, update `API_CONTRACTS.md` first, note it in `DECISIONS.md`, and update all tests before changing the implementation.

### Design Tokens

Never hardcode a colour, font size, spacing value, or border radius. Always use the token from `STYLE_GUIDE.md`.

```typescript
// ❌ Wrong
<Text style={{ color: '#5B4FCF', fontSize: 16 }}>Hello</Text>

// ✅ Correct
<Text style={[styles.body, { color: tokens.colorPrimary }]}>Hello</Text>
```

Tokens are exported from `src/utils/tokens.ts` (mirrors `STYLE_GUIDE.md` values).

### Offline Rule

Do not add any network call in a non-download code path. This is `ADR-008` and is an architectural constraint. If you think you need a network call, open a discussion — do not submit a PR with one.

### Child Safety

All AI output paths (system prompts, quiz generation, feedback strings) must enforce age-appropriate output (11–14). Do not remove or weaken the age-safety constraint in `context/SYSTEM_PROMPT.md`. Do not add external links anywhere in the app.

### Wrong-Answer UX

Incorrect quiz answers must use `--color-warning` (never `--color-error`). Error messaging must be encouraging. See `STYLE_GUIDE.md §8 QuizOption` and the project philosophy in `PROJECT_CONTEXT.md §10`.

---

## 4. Git Workflow

### Branching Model

We use a **trunk-based development** model with short-lived feature branches.

```
main           ← production-ready; protected; requires PR + 1 review
  └── feature/your-feature-name     ← feature work
  └── fix/short-description         ← bug fixes
  └── content/grade-7-science-ch02  ← content additions
  └── chore/dependency-update       ← tooling/dependency changes
```

**Branch naming conventions:**

| Prefix | When to use | Example |
|---|---|---|
| `feature/` | New functionality | `feature/flashcard-flip-animation` |
| `fix/` | Bug fixes | `fix/sm2-ease-factor-floor` |
| `content/` | Adding or editing lesson content | `content/grade6-math-ch01-integers` |
| `chore/` | Dependency updates, CI config, tooling | `chore/upgrade-expo-51` |
| `refactor/` | Internal restructuring, no behaviour change | `refactor/split-inferenceClient` |
| `docs/` | Documentation only | `docs/update-architecture` |

**Rules:**
- Branch names are lowercase, hyphen-separated.
- No ticket numbers in branch names (we don't have an issue tracker yet).
- Delete your branch after it is merged.
- Never commit directly to `main`.

### Commit Messages

Use the Conventional Commits format:

```
<type>(<scope>): <short description>

[optional body]

[optional footer]
```

**Types:**

| Type | When |
|---|---|
| `feat` | New feature |
| `fix` | Bug fix |
| `content` | Adding or editing lesson/quiz/flashcard content |
| `test` | Adding or fixing tests |
| `refactor` | Refactoring with no behaviour change |
| `chore` | Dependencies, CI, build config |
| `docs` | Documentation only |
| `perf` | Performance improvement |

**Examples:**

```
feat(quiz): add difficulty step-up after 2 consecutive correct answers

fix(sm2): clamp ease factor to minimum 1.3 (was allowing negative values)

content(grade7-math): add chapter 3 fractions and decimals in all 3 languages

test(promptBuilder): add case for missing student name safe default

chore: upgrade expo-sqlite to 14.0.1
```

Keep the subject line under 72 characters. Use the body for *why*, not *what* (the diff shows what).

---

## 5. Pull Request Process

### Before Opening a PR

- [ ] Tests pass: `npx jest --ci`
- [ ] TypeScript compiles: `npx tsc --noEmit`
- [ ] Linting passes: `npm run lint`
- [ ] If content was added: `python scripts/validate_content.py assets/content/` passes
- [ ] If a contract changed: `API_CONTRACTS.md` is updated
- [ ] If a tech decision was made: `DECISIONS.md` has a new ADR

### PR Description Template

```markdown
## What
Brief description of what this PR does.

## Why
Why this change is needed.

## Testing
How you tested this. What test cases were added.

## Checklist
- [ ] Tests added / updated
- [ ] API_CONTRACTS.md updated (if applicable)
- [ ] DECISIONS.md updated (if applicable)
- [ ] No network calls added in non-download paths
- [ ] No hardcoded colours / sizes (tokens used)
- [ ] Content validation passes (if content changed)
```

### Review Requirements

- 1 approval required before merge
- CI must be green (all checks passing)
- PRs adding a network call in a non-download path will be rejected automatically — no exceptions

### Merge Strategy

Squash and merge for all PRs. The squash commit message must follow the Conventional Commits format. Delete the branch after merge.

---

## 6. Adding New Lesson Content

Content lives in `assets/content/grade_{6|7|8}/{subject}/{chapter_id}/`. The full format is specified in `CONTENT_SPEC.md`.

### Quickstart

1. Run the scaffolding script to create the folder structure and skeleton files:
   ```bash
   python scripts/generate_content.py \
     --grade 7 \
     --subject mathematics \
     --chapter_id ch04_data_handling \
     --chapter_title_en "Data Handling"
   ```
   This creates `lesson.json`, `quiz_bank.json`, and `flashcards.json` with all required fields and `"..."` placeholders for translators.

2. Fill in all `"..."` placeholders in all three languages (`en`, `hi`, `kn`).

3. Add SVG diagrams to the `diagrams/` subfolder. Follow the constraints in `CONTENT_SPEC.md §4`:
   - ViewBox `0 0 360 240`
   - Noto Sans font only
   - Max 50 KB per file
   - CSS variables for colours

4. Run validation:
   ```bash
   python scripts/validate_content.py assets/content/grade_7/mathematics/ch04_data_handling/
   ```

5. Open a PR with the `content/` branch prefix.

### Content Quality Checklist

- [ ] All three languages present in every localised string
- [ ] Quiz bank has ≥ 10 questions (≥3 easy, ≥4 medium, ≥3 hard)
- [ ] Interest placeholders cover at least: cricket, cooking, gaming, drawing, and default
- [ ] Story template is age-appropriate for 11–14 year olds
- [ ] Language is simple; no jargon without explanation
- [ ] Worked examples are accurate against the State Board syllabus

---

## 7. Adding a New Language (Future)

This is out of scope for v1 but the codebase is prepared for it. When the time comes:

1. Add `src/i18n/{langCode}.json` with all keys from `en.json`
2. Add a Piper TTS `.onnx` model to `assets/models/`
3. Update `VOICE_MAP` in `ttsClient.ts`
4. Update the `language` CHECK constraint in `SCHEMA.md` migration
5. Update `StudentProfile.language` type in `API_CONTRACTS.md`
6. Add the new language to the onboarding language picker
7. Update `validate_content.py` to check for the new language key in all content files

---

## 8. Questions & Help

- For architecture questions: check `DECISIONS.md` first. If your question isn't answered, open a GitHub Discussion.
- For content questions: check `CONTENT_SPEC.md`.
- For performance concerns: check `PERFORMANCE_BUDGET.md` — if a budget needs changing, that requires a documented decision.
- For AI/model questions: check `AI_MODEL_GUIDE.md`.
