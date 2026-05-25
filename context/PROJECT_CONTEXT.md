# PROJECT CONTEXT — Offline AI Tutor App
> This file provides full project context for any AI model, collaborator, or developer working on this project.
> Last updated: May 2026

---

## 1. Project Overview

An **offline-first AI tutor** for middle school students (ages 11–14) in India. The app teaches all standard subjects by personalising lessons around each student's individual interests and delivers content in their preferred language. It runs entirely on low-end Android phones with no internet dependency, making it accessible to students in rural and underserved communities.

---

## 2. Target Users

| Attribute | Detail |
|---|---|
| Primary user | Middle school students, ages 11–14 |
| Deployment model | Individual students (self-managed, no institutional setup required) |
| Device | Low-end Android smartphones (≤3 GB RAM, older SoCs) |
| Connectivity | Fully offline — no internet required after initial install |
| Geography | India (initially Karnataka and Hindi-speaking states) |

---

## 3. Language Support

The app supports **three languages** at launch:

- **Kannada** — primary regional language (Karnataka)
- **Hindi** — primary regional language (North India / national)
- **English** — medium of instruction fallback and bilingual support

All UI text, lesson content, voice interaction, and feedback must be available in all three languages. Students select their preferred language during onboarding and can switch at any time.

---

## 4. Curriculum Alignment

- Follows **Indian State Board curriculum** (not NCERT, though overlap is significant)
- Covers all core middle school subjects: Mathematics, Science, Social Studies, English Language, and the regional language (Kannada/Hindi)
- Content is structured by **grade (6, 7, 8)** and **subject**
- Lesson topics map to state board syllabus chapters; the AI adapts *how* they are taught, not *what* is taught

---

## 5. Core Teaching Philosophy

### Interest-Based Personalisation
Every concept is taught through the lens of the student's declared interests (e.g., cricket, cooking, drawing, gaming). If a student loves cricket, fractions are taught using batting averages; photosynthesis is explained through the grass on a cricket pitch. Interests are captured at onboarding and can be updated anytime.

### Teaching Methods (all five must be supported)
| Method | Description |
|---|---|
| **Story-based lessons** | Core concepts wrapped in short narratives featuring the student's interests and optionally their name |
| **Voice interaction** | Student can speak questions and hear answers; useful for low-literacy or hands-free contexts |
| **Visual / diagram-based explanations** | Diagrams, illustrated concept maps, and visual analogies rendered on-device |
| **Flashcards & spaced repetition** | Review cards scheduled using a spaced repetition algorithm (e.g., SM-2) for long-term retention |
| **Quizzes & MCQs** | Auto-generated quizzes per topic, adaptive difficulty based on past performance |

---

## 6. Student Onboarding (Self-Onboarding Wizard)

The onboarding wizard collects the student profile in a friendly, conversational flow:

1. **Name** — used to personalise lesson narratives
2. **Grade** — 6, 7, or 8
3. **Preferred language** — Kannada, Hindi, or English
4. **State / board** — to confirm syllabus variant
5. **Interests** — student picks from a visual grid (sports, cooking, art, music, animals, gaming, travel, science, etc.) and can add custom ones
6. **Learning style preference** — stories, diagrams, or a mix (used to weight teaching methods)

All profile data is stored locally on-device (no account or cloud sync required).

---

## 7. AI & Model Strategy

### Guiding Principle
Use **whichever model architecture best fits the constraint** — prioritise low RAM usage, fast inference on CPU, and multilingual capability. No single model is mandated; the right tool for the right task.

### Recommended Model Tiers (based on device capability)

| Device RAM | Recommended Model | Quantisation |
|---|---|---|
| 2–3 GB | Phi-3 Mini / Gemma 2B | INT4 (GGUF via llama.cpp) |
| 4–6 GB | Gemma 7B / Llama 3.2 3B | INT4/INT8 |
| 6 GB+ | Mistral 7B / Llama 3.1 8B | INT8 |

### Inference Runtime
- **llama.cpp** (via React Native bridge or a local HTTP server) for text generation
- **Whisper (tiny/small)** quantised for offline voice-to-text in Hindi, Kannada, English
- **TTS**: Coqui TTS or Piper TTS with pre-built voice models for all three languages

### AI Responsibilities
- Generate interest-personalised lesson narratives for each topic
- Answer student follow-up questions in context
- Generate quiz questions and evaluate answers
- Provide encouraging, age-appropriate feedback
- Adapt difficulty based on quiz performance history (stored locally)

### Prompt Engineering Notes
- Always include the student's name, grade, subject, topic, and interest list in the system prompt
- Enforce language output strictly (model must respond in the student's chosen language)
- Keep responses concise — mobile screen, young reader
- Use simple vocabulary appropriate for ages 11–14
- Never use jargon without explaining it in plain language first

---

## 8. Tech Stack

| Layer | Technology |
|---|---|
| Mobile app | **React Native** (Android-first) |
| Local AI inference | llama.cpp via a native module or local REST server |
| Voice input (STT) | Whisper (tiny) — on-device |
| Voice output (TTS) | Piper TTS — on-device, multilingual |
| Local storage | SQLite (student profile, progress, flashcard schedules) |
| Diagrams / visuals | SVG assets + React Native SVG library |
| Spaced repetition | SM-2 algorithm implemented in JS |
| Offline packaging | All model weights, voice models, and content bundled in app or downloaded once on first launch |

---

## 9. Content Architecture

```
/content
  /grade_6
    /mathematics
      /chapter_01_integers
        lesson.json        ← topic metadata + syllabus mapping
        base_story.txt     ← template narrative (interest placeholders)
        diagrams/          ← SVG visual assets
        quiz_bank.json     ← question pool
    /science
    /social_studies
    ...
  /grade_7
  /grade_8
/voices
  /kannada
  /hindi
  /english
/models
  phi3_mini_int4.gguf
  whisper_tiny.bin
  piper_kn.onnx
  piper_hi.onnx
  piper_en.onnx
```

Lesson templates use **placeholder tokens** like `{{STUDENT_NAME}}`, `{{INTEREST_1}}`, `{{INTEREST_OBJECT}}` that are filled at runtime by the AI or by simple string substitution for lighter tasks.

---

## 10. Key Constraints & Design Rules

1. **Fully offline** — zero network calls during normal use. All assets, models, and content ship with the app or are downloaded once.
2. **Low-end Android** — UI must be smooth on 2 GB RAM devices. Avoid heavy animations. Keep model inference asynchronous with a loading indicator.
3. **Child-safe** — all AI outputs must be age-appropriate (11–14). The system prompt must enforce this. No external links, no social features.
4. **Multilingual consistency** — UI, voice, and AI responses must all be in the same selected language. Do not mix languages unless the student explicitly asks.
5. **No account required** — student data never leaves the device. No login, no cloud sync, no analytics sent externally.
6. **Encouraging tone** — AI feedback should always be positive and motivating. Never shame incorrect answers. Frame mistakes as learning opportunities.
7. **State board accuracy** — lesson content must accurately reflect the state board syllabus for the student's declared grade. Do not teach out-of-syllabus content unprompted.

---

## 11. Student Progress & Data Model (Local SQLite)

```sql
-- Core tables (simplified)
students       (id, name, grade, language, interests_json, created_at)
sessions       (id, student_id, subject, topic, started_at, ended_at)
quiz_results   (id, student_id, topic, score, total, attempted_at)
flashcards     (id, student_id, topic, front, back, ease_factor, next_review)
achievements   (id, student_id, badge_key, earned_at)
```

---

## 12. Out of Scope (v1)

- Multi-student profiles on one device (future)
- Teacher / parent dashboard (future)
- Cloud sync or backup (future)
- NCERT curriculum variant (future)
- Languages beyond Kannada, Hindi, English (future)
- iOS support (future)
- Gamification beyond badges (future)

---

## 13. Success Metrics (qualitative for v1)

- Student can complete a full lesson on any syllabus topic in their preferred language without internet
- Lesson content visibly reflects the student's stated interests
- Voice input and output works reliably in all three languages on a ≤3 GB RAM device
- Quiz difficulty adapts after 3+ attempts on a topic
- Onboarding completes in under 3 minutes

---

*This context file should be included at the top of any AI assistant session, design document, or developer briefing related to this project.*
