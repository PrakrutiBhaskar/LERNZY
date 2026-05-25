const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, "../../.env"), override: true });

const connectDatabase = require("../config/database");
const User = require("../models/User.model");
const CurriculumNode = require("../models/CurriculumNode.model");

const run = async () => {
  try {
    await connectDatabase();

    // 1. Seed Demo User
    const email = "demo@aitutor.com";
    const existingUser = await User.findOne({ email });
    if (!existingUser) {
      await User.create({
        name: "Demo User",
        email,
        password: "Password123!",
        preferredLanguage: "en",
        educationLevel: "beginner"
      });
      // eslint-disable-next-line no-console
      console.log("Demo user created: demo@aitutor.com / Password123!");
    } else {
      // eslint-disable-next-line no-console
      console.log("Demo user already exists.");
    }

    // 2. Seed Curriculum Nodes (Idempotent Hierarchy)
    // Grade 6 Root Node
    let grade6 = await CurriculumNode.findOne({ name: "Grade 6", nodeType: "grade" });
    if (!grade6) {
      grade6 = await CurriculumNode.create({
        name: "Grade 6",
        nodeType: "grade",
        parent: null,
        tags: ["middle-school"],
        metadata: { description: "Class 6 curriculum" }
      });
      // eslint-disable-next-line no-console
      console.log("Seeded: Grade 6 Node");
    }

    // Mathematics Concept (under Grade 6)
    let mathConcept = await CurriculumNode.findOne({ name: "Mathematics", nodeType: "concept", parent: grade6._id });
    if (!mathConcept) {
      mathConcept = await CurriculumNode.create({
        name: "Mathematics",
        nodeType: "concept",
        parent: grade6._id,
        tags: ["math", "core"],
        metadata: { standard: "State / NCERT" }
      });
      // eslint-disable-next-line no-console
      console.log("Seeded: Mathematics Concept Node");
    }

    // Fractions Topic (under Mathematics Concept)
    let fractionsTopic = await CurriculumNode.findOne({ name: "Fractions", nodeType: "topic", parent: mathConcept._id });
    if (!fractionsTopic) {
      fractionsTopic = await CurriculumNode.create({
        name: "Fractions",
        nodeType: "topic",
        parent: mathConcept._id,
        tags: ["fractions", "numeracy"],
        metadata: { difficulty: "medium", keyPoints: ["numerator", "denominator"] }
      });
      // eslint-disable-next-line no-console
      console.log("Seeded: Fractions Topic Node");
    }

    // Decimals Topic (under Mathematics Concept)
    let decimalsTopic = await CurriculumNode.findOne({ name: "Decimals", nodeType: "topic", parent: mathConcept._id });
    if (!decimalsTopic) {
      decimalsTopic = await CurriculumNode.create({
        name: "Decimals",
        nodeType: "topic",
        parent: mathConcept._id,
        tags: ["decimals", "numeracy"],
        metadata: { difficulty: "medium" }
      });
      // eslint-disable-next-line no-console
      console.log("Seeded: Decimals Topic Node");
    }

    // eslint-disable-next-line no-console
    console.log("All seeding finished successfully.");
    process.exit(0);
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error("Seeding failed: ", error);
    process.exit(1);
  }
};

run();
