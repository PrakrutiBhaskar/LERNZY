const fs = require('fs');
const path = require('path');

// Read GEMINI_API_KEY from backend/.env
const envPath = path.resolve(__dirname, '../../backend/.env');
let GEMINI_API_KEY = '';
let GEMINI_MODEL = 'gemini-2.0-flash';

if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf-8');
  const matchKey = envContent.match(/^GEMINI_API_KEY\s*=\s*(.+)$/m);
  if (matchKey) {
    GEMINI_API_KEY = matchKey[1].trim();
  }
  const matchModel = envContent.match(/^GEMINI_MODEL\s*=\s*(.+)$/m);
  if (matchModel) {
    GEMINI_MODEL = matchModel[1].trim();
  }
}

if (!GEMINI_API_KEY) {
  console.error("Error: GEMINI_API_KEY not found in backend/.env");
  process.exit(1);
}

const BASE_CONTENT_DIR = path.resolve(__dirname, '../assets/content');

function getLessonDirs(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    if (stat && stat.isDirectory()) {
      results = results.concat(getLessonDirs(filePath));
    } else if (file === 'lesson.json') {
      results.push(dir);
    }
  });
  return results;
}

async function callGemini(prompt) {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${GEMINI_API_KEY}`;
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: {
        responseMimeType: "application/json"
      }
    })
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Gemini API error: ${response.status} - ${errText}`);
  }

  const result = await response.json();
  const text = result.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) {
    throw new Error("Empty response from Gemini API");
  }
  return JSON.parse(text);
}

async function processDirectory(dir) {
  const lessonPath = path.join(dir, 'lesson.json');
  const quizPath = path.join(dir, 'quiz_bank.json');
  const flashcardsPath = path.join(dir, 'flashcards.json');

  const lessonData = JSON.parse(fs.readFileSync(lessonPath, 'utf-8'));
  const conceptExplanation = lessonData.topics?.[0]?.concept_explanation?.en || '';
  const hasPlaceholder = conceptExplanation.includes("In this chapter, we explore") || conceptExplanation.includes("Concept explanation fallback");

  if (!hasPlaceholder) {
    console.log(`[Skipping] Already has actual content: ${dir}`);
    return;
  }

  const chapterId = lessonData.chapter_id;
  const grade = lessonData.grade;
  const subject = lessonData.subject;
  const titleEn = lessonData.chapter_title.en;
  const titleHi = lessonData.chapter_title.hi || '';
  const titleKn = lessonData.chapter_title.kn || '';

  console.log(`[Processing] Grade ${grade} - ${subject} - ${titleEn} (${chapterId})`);

  const prompt = `You are an expert curriculum developer for middle school students (Grades 6-8) in India, following the Karnataka State Board (NCERT syllabus).
Please generate real, high-quality educational content for the chapter/topic:
- Grade: ${grade}
- Subject: ${subject}
- Chapter ID: ${chapterId}
- Chapter Title: ${titleEn} (Hindi: ${titleHi}, Kannada: ${titleKn})

Requirements:
1. "learning_objectives": Provide 3 clear, student-friendly learning objectives in English.
2. "concept_explanation": Provide a comprehensive trilingual (English, Hindi, Kannada) explanation of the main concept in this chapter. The Hindi and Kannada translations must be natural and grammatically correct.
3. "worked_example": Provide a trilingual worked problem.
   - "problem": In English.
   - "steps": An array of 3 steps, each containing "en", "hi", and "kn" strings.
   - "answer": The final answer in English.
4. "key_points": 3 key points of summary, trilingual (an array of strings under "en", "hi", "kn").
5. "quiz_bank": Exactly 10 multiple choice questions.
   - 3 easy (IDs q01-q03), 4 medium (IDs q04-q07), 3 hard (IDs q08-q10).
   - Each question has "en", "hi", "kn" text.
   - Options must have exactly 4 items under "en", "hi", and "kn".
   - "correct_index": 0-indexed number indicating the correct option.
   - "explanation": Trilingual description of why that option is correct.
6. "flashcards": Exactly 5 flashcards (IDs fc01-fc05).
   - Each has trilingual "front" (question/prompt), "back" (answer), and "memory_hook" (a memorable trick to remember the fact).

You MUST output ONLY a valid JSON object with the following structure:
{
  "learning_objectives": ["Objective 1", "Objective 2", "Objective 3"],
  "concept_explanation": { "en": "...", "hi": "...", "kn": "..." },
  "worked_example": {
    "problem": "...",
    "steps": [
      { "en": "...", "hi": "...", "kn": "..." },
      { "en": "...", "hi": "...", "kn": "..." },
      { "en": "...", "hi": "...", "kn": "..." }
    ],
    "answer": "..."
  },
  "key_points": {
    "en": ["...", "...", "..."],
    "hi": ["...", "...", "..."],
    "kn": ["...", "...", "..."]
  },
  "quiz_bank": [
    {
      "id": "q01",
      "difficulty": "easy",
      "question": { "en": "...", "hi": "...", "kn": "..." },
      "options": {
        "en": ["A", "B", "C", "D"],
        "hi": ["A", "B", "C", "D"],
        "kn": ["A", "B", "C", "D"]
      },
      "correct_index": 0,
      "explanation": { "en": "...", "hi": "...", "kn": "..." }
    }
    // ... exactly 10 questions
  ],
  "flashcards": [
    {
      "id": "fc01",
      "front": { "en": "...", "hi": "...", "kn": "..." },
      "back": { "en": "...", "hi": "...", "kn": "..." },
      "memory_hook": { "en": "...", "hi": "...", "kn": "..." }
    }
    // ... exactly 5 flashcards
  ]
}`;

  let attempts = 3;
  let success = false;
  let data;
  while (attempts > 0 && !success) {
    try {
      data = await callGemini(prompt);
      success = true;
    } catch (e) {
      attempts--;
      console.warn(`Error processing ${titleEn}, attempts left: ${attempts}. Error: ${e.message}`);
      if (attempts === 0) throw e;
      await new Promise(r => setTimeout(r, 2000));
    }
  }

  // Update lesson.json
  const updatedLesson = {
    ...lessonData,
    topics: lessonData.topics.map(t => ({
      ...t,
      learning_objectives: data.learning_objectives,
      concept_explanation: data.concept_explanation,
      worked_example: data.worked_example,
      key_points: data.key_points
    }))
  };
  fs.writeFileSync(lessonPath, JSON.stringify(updatedLesson, null, 2), 'utf-8');

  // Update quiz_bank.json
  const topicId = lessonData.topics[0].topic_id;
  const updatedQuiz = {
    version: "1.0",
    topic_id: topicId,
    questions: data.quiz_bank
  };
  fs.writeFileSync(quizPath, JSON.stringify(updatedQuiz, null, 2), 'utf-8');

  // Update flashcards.json
  const updatedFlashcards = {
    version: "1.0",
    topic_id: topicId,
    cards: data.flashcards
  };
  fs.writeFileSync(flashcardsPath, JSON.stringify(updatedFlashcards, null, 2), 'utf-8');

  console.log(`[Success] Updated Grade ${grade} - ${subject} - ${titleEn}`);
}

async function run() {
  const dirs = getLessonDirs(BASE_CONTENT_DIR);
  console.log(`Found ${dirs.length} total lesson folders.`);

  // Filter directories to process only placeholders
  const placeholderDirs = [];
  for (const dir of dirs) {
    const lessonPath = path.join(dir, 'lesson.json');
    if (fs.existsSync(lessonPath)) {
      const lessonData = JSON.parse(fs.readFileSync(lessonPath, 'utf-8'));
      const conceptExplanation = lessonData.topics?.[0]?.concept_explanation?.en || '';
      if (conceptExplanation.includes("In this chapter, we explore") || conceptExplanation.includes("Concept explanation fallback")) {
        placeholderDirs.push(dir);
      }
    }
  }

  console.log(`Found ${placeholderDirs.length} placeholder folders to update.`);

  // Process sequentially to respect rate limits and keep it reliable
  for (let i = 0; i < placeholderDirs.length; i++) {
    const dir = placeholderDirs[i];
    console.log(`\n--- Progress: ${i + 1}/${placeholderDirs.length} ---`);
    try {
      await processDirectory(dir);
      // Wait 1.5 seconds between requests to avoid hitting rate limits
      await new Promise(r => setTimeout(r, 1500));
    } catch (e) {
      console.error(`Fatal error processing ${dir}:`, e.message);
    }
  }

  console.log("\nPlaceholder replacement completed!");
}

run();
