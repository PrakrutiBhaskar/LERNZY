# Content Specification — Lessons, Quizzes & Flashcards
> Defines the JSON schema for all bundled educational content.
> Every AI model or content author adding lessons must follow this spec exactly.

---

## Content Tree

```
assets/content/
  grade_{6|7|8}/
    {subject}/
      {chapter_id}/
        lesson.json
        quiz_bank.json
        flashcards.json        (optional — can be auto-generated)
        diagrams/
          *.svg
```

**Subject slugs:** `mathematics`, `science`, `social_studies`, `english`, `kannada`

**Chapter ID format:** `ch{NN}_{snake_case_title}` — e.g. `ch03_fractions_decimals`

---

## 1. `lesson.json` Schema

```json
{
  "version": "1.0",
  "grade": 7,
  "subject": "mathematics",
  "chapter_id": "ch03_fractions_decimals",
  "chapter_title": {
    "en": "Fractions and Decimals",
    "hi": "भिन्न और दशमलव",
    "kn": "ಭಿನ್ನರಾಶಿಗಳು ಮತ್ತು ದಶಮಾಂಶಗಳು"
  },
  "topics": [
    {
      "topic_id": "addition_unlike_fractions",
      "title": {
        "en": "Addition of Unlike Fractions",
        "hi": "असमान भिन्नों का योग",
        "kn": "ಅಸಮಾನ ಭಿನ್ನರಾಶಿಗಳ ಸೇರ್ಪಡೆ"
      },
      "learning_objectives": [
        "Understand what unlike fractions are",
        "Find the LCM of denominators",
        "Convert to like fractions and add"
      ],
      "prerequisite_topic_ids": ["equivalent_fractions"],
      "estimated_minutes": 10,
      "diagram_refs": ["unlike_fractions_visual.svg"],

      "base_story_template": {
        "en": "{{STUDENT_NAME}} was at a {{INTEREST_PLACE}} eating pizza. One friend ate 1/3 of a pizza, another ate 1/4. How much did they eat together? That's exactly what adding unlike fractions helps us find out!",
        "hi": "{{STUDENT_NAME}} {{INTEREST_PLACE}} में था और पिज्जा खा रहा था...",
        "kn": "{{STUDENT_NAME}} {{INTEREST_PLACE}} ನಲ್ಲಿ ಪಿಜ್ಜಾ ತಿನ್ನುತ್ತಿದ್ದ..."
      },

      "concept_explanation": {
        "en": "Unlike fractions have different denominators. To add them, find the LCM of the denominators, convert both fractions, then add the numerators.",
        "hi": "...",
        "kn": "..."
      },

      "worked_example": {
        "problem": "1/3 + 1/4 = ?",
        "steps": [
          { "en": "Find LCM of 3 and 4 → LCM = 12", "hi": "...", "kn": "..." },
          { "en": "Convert: 1/3 = 4/12, 1/4 = 3/12", "hi": "...", "kn": "..." },
          { "en": "Add: 4/12 + 3/12 = 7/12", "hi": "...", "kn": "..." }
        ],
        "answer": "7/12"
      },

      "key_points": {
        "en": [
          "Unlike fractions have different denominators.",
          "Always find LCM before adding.",
          "Only add numerators — denominators stay the same after conversion."
        ],
        "hi": ["...", "...", "..."],
        "kn": ["...", "...", "..."]
      },

      "interest_placeholders": {
        "INTEREST_PLACE": {
          "cricket":  { "en": "cricket ground canteen", "hi": "...", "kn": "..." },
          "cooking":  { "en": "kitchen", "hi": "...", "kn": "..." },
          "gaming":   { "en": "gaming café", "hi": "...", "kn": "..." },
          "drawing":  { "en": "art class", "hi": "...", "kn": "..." },
          "default":  { "en": "school canteen", "hi": "...", "kn": "..." }
        }
      }
    }
  ]
}
```

---

## 2. `quiz_bank.json` Schema

```json
{
  "version": "1.0",
  "topic_id": "addition_unlike_fractions",
  "questions": [
    {
      "id": "q001",
      "difficulty": "easy",
      "question": {
        "en": "What is 1/2 + 1/4?",
        "hi": "1/2 + 1/4 क्या है?",
        "kn": "1/2 + 1/4 ಎಷ್ಟು?"
      },
      "options": {
        "en": ["2/6", "3/4", "2/4", "1/6"],
        "hi": ["2/6", "3/4", "2/4", "1/6"],
        "kn": ["2/6", "3/4", "2/4", "1/6"]
      },
      "correct_index": 1,
      "explanation": {
        "en": "LCM of 2 and 4 is 4. Convert 1/2 to 2/4. Then 2/4 + 1/4 = 3/4.",
        "hi": "...",
        "kn": "..."
      },
      "diagram_ref": null
    },
    {
      "id": "q002",
      "difficulty": "medium",
      "question": {
        "en": "What is 2/3 + 3/5?",
        "hi": "...",
        "kn": "..."
      },
      "options": {
        "en": ["5/8", "19/15", "5/15", "10/9"],
        "hi": ["..."],
        "kn": ["..."]
      },
      "correct_index": 1,
      "explanation": {
        "en": "LCM of 3 and 5 is 15. 2/3 = 10/15, 3/5 = 9/15. Sum = 19/15.",
        "hi": "...",
        "kn": "..."
      },
      "diagram_ref": null
    }
  ]
}
```

### Difficulty Distribution (per topic)
| Difficulty | Count |
|---|---|
| easy | min 3 questions |
| medium | min 4 questions |
| hard | min 3 questions |
| **Total** | **min 10 questions per topic** |

---

## 3. `flashcards.json` Schema

```json
{
  "version": "1.0",
  "topic_id": "addition_unlike_fractions",
  "cards": [
    {
      "id": "fc001",
      "front": {
        "en": "What are unlike fractions?",
        "hi": "असमान भिन्न क्या होती हैं?",
        "kn": "ಅಸಮಾನ ಭಿನ್ನರಾಶಿಗಳು ಯಾವುವು?"
      },
      "back": {
        "en": "Fractions with different denominators. E.g., 1/3 and 1/4.",
        "hi": "अलग-अलग हरों वाली भिन्नें। जैसे 1/3 और 1/4।",
        "kn": "ಬೇರೆ ಬೇರೆ ಛೇದಗಳನ್ನು ಹೊಂದಿರುವ ಭಿನ್ನರಾಶಿಗಳು. ಉದಾ: 1/3 ಮತ್ತು 1/4."
      },
      "memory_hook": {
        "en": "Unlike → Different → Different denominators",
        "hi": "असमान → अलग → अलग हर",
        "kn": "ಅಸಮಾನ → ಬೇರೆ → ಬೇರೆ ಛೇದ"
      }
    }
  ]
}
```

---

## 4. SVG Diagram Guidelines

- ViewBox: `0 0 360 240` (mobile-first portrait)
- Fonts: `Noto Sans` only (bundled)
- Colours: use CSS variables — `var(--color-primary)`, `var(--color-accent)`, `var(--color-bg)`
- No external image refs
- All text in English (translated by app i18n layer using `data-i18n-key` attributes)
- Max file size: 50 KB per SVG

---

## 5. Interest Placeholder Reference

These tokens may appear in `base_story_template` and are resolved at runtime:

| Token | Meaning | Resolved by |
|---|---|---|
| `{{STUDENT_NAME}}` | Student's name | `interestInjector.ts` |
| `{{INTEREST_PLACE}}` | A place related to their interest | `lesson.json` lookup table |
| `{{INTEREST_OBJECT}}` | An object related to their interest | `lesson.json` lookup table |
| `{{INTEREST_ACTION}}` | An action related to their interest | `lesson.json` lookup table |
| `{{GRADE}}` | Student's grade string | Student profile |

If an interest is not in the lookup table, always fall back to `"default"`.

---

## 6. Content Validation Rules (`validate_content.py`)

All content files must pass these checks before merge:

- [ ] `lesson.json` has all required top-level keys
- [ ] All three languages (`en`, `hi`, `kn`) present in every localised string
- [ ] Every `topic_id` in `lesson.json` has a matching `quiz_bank.json`
- [ ] Each `quiz_bank.json` has ≥ 10 questions with correct difficulty distribution
- [ ] `correct_index` is between 0 and 3
- [ ] All `diagram_refs` point to existing SVG files
- [ ] No `{{placeholder}}` tokens left un-defined in `interest_placeholders`
- [ ] No question appears more than once (deduplicated by question text)
