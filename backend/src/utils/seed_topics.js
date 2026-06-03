/**
 * seed_topics.js
 * Dynamically reads all offline curriculum content from the frontend assets folder
 * and seeds/saves them into the MongoDB database under Grade 6, 7, and 8.
 */

const fs = require("fs");
const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, "../../.env"), override: true });

const mongoose = require("mongoose");
const connectDatabase = require("../config/database");
const CurriculumNode = require("../models/CurriculumNode.model");

const BASE_CONTENT_DIR = path.resolve(__dirname, "../../../frontend/assets/content");

const SUBJECT_NAME_MAP = {
  "math": "Mathematics",
  "science": "Science",
  "social": "Social Studies",
  "english": "English",
  "kannada": "Kannada"
};

async function findOrCreateNode(filter, doc) {
  const existing = await CurriculumNode.findOne(filter);
  if (existing) {
    return existing;
  }
  return await CurriculumNode.create(doc);
}

const run = async () => {
  try {
    await connectDatabase();
    console.log("\n[DB Seeder] Scanning content directory:", BASE_CONTENT_DIR);

    if (!fs.existsSync(BASE_CONTENT_DIR)) {
      throw new Error(`Content directory not found at ${BASE_CONTENT_DIR}`);
    }

    let topicsCreated = 0;
    let topicsUpdated = 0;

    // Scan grades (grade_6, grade_7, grade_8)
    const gradeDirs = fs.readdirSync(BASE_CONTENT_DIR).filter(f => f.startsWith("grade_"));

    for (const gradeDir of gradeDirs) {
      const gradeNum = gradeDir.split("_")[1];
      const gradeLabel = `Grade ${gradeNum}`;
      
      console.log(`\nProcessing ${gradeLabel}...`);
      
      // Find or create Grade Root Node
      const gradeNode = await findOrCreateNode(
        { name: gradeLabel, nodeType: "grade" },
        { name: gradeLabel, nodeType: "grade", parent: null, tags: ["middle-school"], metadata: { description: `Class ${gradeNum} curriculum` } }
      );

      const gradePath = path.join(BASE_CONTENT_DIR, gradeDir);
      const subjectDirs = fs.readdirSync(gradePath);

      for (const subjectDir of subjectDirs) {
        const subjectName = SUBJECT_NAME_MAP[subjectDir] || subjectDir;
        
        // Find or create Subject/Concept Node
        const conceptNode = await findOrCreateNode(
          { name: subjectName, nodeType: "concept", parent: gradeNode._id },
          { name: subjectName, nodeType: "concept", parent: gradeNode._id, tags: [subjectDir], metadata: { standard: "State / NCERT" } }
        );

        const subjectPath = path.join(gradePath, subjectDir);
        const chapterDirs = fs.readdirSync(subjectPath);

        for (const chapterDir of chapterDirs) {
          const chapterPath = path.join(subjectPath, chapterDir);
          
          const lessonFile = path.join(chapterPath, "lesson.json");
          const quizFile = path.join(chapterPath, "quiz_bank.json");
          const flashcardFile = path.join(chapterPath, "flashcards.json");

          if (!fs.existsSync(lessonFile)) continue;

          // Parse the generated JSON files
          const lessonData = JSON.parse(fs.readFileSync(lessonFile, "utf-8"));
          const quizData = fs.existsSync(quizFile) ? JSON.parse(fs.readFileSync(quizFile, "utf-8")) : null;
          const flashcardData = fs.existsSync(flashcardFile) ? JSON.parse(fs.readFileSync(flashcardFile, "utf-8")) : null;

          const topicInfo = lessonData.topics && lessonData.topics[0];
          if (!topicInfo) continue;

          // Build topic metadata structure
          const metadata = {
            difficulty: "medium",
            topic_id: topicInfo.topic_id,
            title: topicInfo.title,
            learning_objectives: topicInfo.learning_objectives,
            estimated_minutes: topicInfo.estimated_minutes || 15,
            concept_explanation: topicInfo.concept_explanation,
            base_story_template: topicInfo.base_story_template,
            worked_example: topicInfo.worked_example,
            key_points: topicInfo.key_points,
            interest_placeholders: topicInfo.interest_placeholders,
            quizQuestions: quizData ? quizData.questions : [],
            flashcards: flashcardData ? flashcardData.cards : []
          };

          const topicName = lessonData.chapter_title.en;

          // Find or create Topic Node
          const existingTopic = await CurriculumNode.findOne({ name: topicName, nodeType: "topic", parent: conceptNode._id });

          if (existingTopic) {
            existingTopic.metadata = metadata;
            existingTopic.markModified("metadata");
            await existingTopic.save();
            topicsUpdated++;
          } else {
            await CurriculumNode.create({
              name: topicName,
              nodeType: "topic",
              parent: conceptNode._id,
              tags: [subjectDir, chapterDir],
              metadata: metadata
            });
            topicsCreated++;
          }
        }
      }
    }

    console.log(`\n[DB Seeder] Seeding finished successfully.`);
    console.log(`Created: ${topicsCreated} topics, Updated: ${topicsUpdated} topics.`);
    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error("\n[DB Seeder] Seeding failed:", err.message);
    await mongoose.disconnect();
    process.exit(1);
  }
};

run();
