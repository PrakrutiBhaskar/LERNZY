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
    const fractionsQuizQuestions = [
      {
        id: "q001",
        question: {
          en: "What is 1/2 + 1/4?",
          hi: "1/2 + 1/4 क्या है?",
          kn: "1/2 + 1/4 ಎಷ್ಟು?"
        },
        options: {
          en: ["2/6", "3/4", "2/4", "3/8"],
          hi: ["2/6", "3/4", "2/4", "3/8"],
          kn: ["2/6", "3/4", "2/4", "3/8"]
        },
        correct_index: 1,
        explanation: {
          en: "The LCM of 2 and 4 is 4. We rewrite 1/2 as 2/4. Then we add: 2/4 + 1/4 = 3/4.",
          hi: "2 और 4 का LCM 4 है। हम 1/2 को 2/4 के रूप में लिखते हैं। फिर जोड़ें: 2/4 + 1/4 = 3/4।",
          kn: "2 ಮತ್ತು 4 ರ ಲಸಾಅ 4 ಆಗಿದೆ. ನಾವು 1/2 ಅನ್ನು 2/4 ಎಂದು ಬರೆಯಬಹುದು. ನಂತರ ಕೂಡಿರಿ: 2/4 + 1/4 = 3/4."
        }
      },
      {
        id: "q002",
        question: {
          en: "What is 1/3 + 1/6?",
          hi: "1/3 + 1/6 क्या है?",
          kn: "1/3 + 1/6 ಎಷ್ಟು?"
        },
        options: {
          en: ["2/9", "3/6", "1/2", "2/6"],
          hi: ["2/9", "3/6", "1/2", "2/6"],
          kn: ["2/9", "3/6", "1/2", "2/6"]
        },
        correct_index: 2,
        explanation: {
          en: "The LCM of 3 and 6 is 6. Convert 1/3 to 2/6. Then 2/6 + 1/6 = 3/6, which simplifies to 1/2.",
          hi: "3 और 6 का LCM 6 है। 1/3 को 2/6 में बदलें। फिर 2/6 + 1/6 = 3/6, जो सरल होकर 1/2 हो जाता है।",
          kn: "3 ಮತ್ತು 6 ರ ಲಸಾಅ 6 ಆಗಿದೆ. 1/3 ಅನ್ನು 2/6 ಆಗಿ ಪರಿವರ್ತಿಸಿ. ನಂತರ 2/6 + 1/6 = 3/6, ಇದನ್ನು ಸುಲಭ ರೂಪಕ್ಕೆ ತಂದಾಗ 1/2 ಆಗುತ್ತದೆ."
        }
      },
      {
        id: "q003",
        question: {
          en: "What is 2/5 + 1/10?",
          hi: "2/5 + 1/10 क्या है?",
          kn: "2/5 + 1/10 ಎಷ್ಟು?"
        },
        options: {
          en: ["3/15", "1/2", "3/10", "4/10"],
          hi: ["3/15", "1/2", "3/10", "4/10"],
          kn: ["3/15", "1/2", "3/10", "4/10"]
        },
        correct_index: 1,
        explanation: {
          en: "The LCM of 5 and 10 is 10. Convert 2/5 to 4/10. Add: 4/10 + 1/10 = 5/10, which reduces to 1/2.",
          hi: "5 और 10 का LCM 10 है। 2/5 को 4/10 में बदलें। जोड़ें: 4/10 + 1/10 = 5/10, जो घटकर 1/2 हो जाता है।",
          kn: "5 ಮತ್ತು 10 ರ ಲಸಾಅ 10 ಆಗಿದೆ. 2/5 ಅನ್ನು 4/10 ಆಗಿ ಪರಿವರ್ತಿಸಿ. ಕೂಡಿರಿ: 4/10 + 1/10 = 5/10, ಇದನ್ನು ಸಣ್ಣದಾಗಿಸಿದಾಗ 1/2 ಆಗುತ್ತದೆ."
        }
      }
    ];

    if (!fractionsTopic) {
      fractionsTopic = await CurriculumNode.create({
        name: "Fractions",
        nodeType: "topic",
        parent: mathConcept._id,
        tags: ["fractions", "numeracy"],
        metadata: {
          difficulty: "medium",
          keyPoints: ["numerator", "denominator"],
          quizQuestions: fractionsQuizQuestions
        }
      });
      // eslint-disable-next-line no-console
      console.log("Seeded: Fractions Topic Node");
    } else {
      fractionsTopic.metadata = {
        ...fractionsTopic.metadata,
        quizQuestions: fractionsQuizQuestions
      };
      fractionsTopic.markModified("metadata");
      await fractionsTopic.save();
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

    // Example / Lesson Node: Addition of Unlike Fractions (under Fractions Topic)
    let unlikeFractionsLesson = await CurriculumNode.findOne({ name: "Addition of Unlike Fractions", nodeType: "example", parent: fractionsTopic._id });
    const unlikeFractionsMetadata = {
      topic_id: "addition_unlike_fractions",
      title: {
        en: "Addition of Unlike Fractions",
        hi: "असमान भिन्नों का योग",
        kn: "ಅಸಮಾನ ಭಿನ್ನರಾಶಿಗಳ ಸೇರ್ಪಡೆ"
      },
      learning_objectives: [
        "Understand unlike fractions (different denominators)",
        "Find Least Common Multiple (LCM) of denominators",
        "Convert and add the numerators"
      ],
      estimated_minutes: 10,
      base_story_template: {
        en: "{{STUDENT_NAME}} was sitting at the {{INTEREST_PLACE}} sharing a pizza. One friend ate 1/3 of the pizza, and another ate 1/4. How much did they eat together? That is exactly what adding unlike fractions helps us find out!",
        hi: "{{STUDENT_NAME}} {{INTEREST_PLACE}} में बैठा था और पिज्जा खा रहा था। एक दोस्त ने पिज्जा का 1/3 हिस्सा खाया, और दूसरे ने 1/4 खाया। उन्होंने मिलकर कुल कितना खाया? यही असमान भिन्नों का जोड़ हमें सिखाता है!",
        kn: "{{STUDENT_NAME}} {{INTEREST_PLACE}} ನಲ್ಲಿ ಪಿಜ್ಜಾ ತಿನ್ನುತ್ತಿದ್ದ. ಒಬ್ಬ ಗೆಳೆಯ 1/3 ಭಾಗ ಪಿಜ್ಜಾ تಿಂದರೆ, ಮತ್ತೊಬ್ಬ 1/4 ತಿಂದನು. ಇಬ್ಬರೂ ಸೇರಿ ಎಷ್ಟು ತಿಂದರು? ಇಂತಹ ಲೆಕ್ಕವನ್ನು ಅಸಮಾನ ಭಿನ್ನರಾಶಿಗಳ ಕೂಡುವಿಕೆ ನಮಗೆ ತಿಳಿಸಿಕೊಡುತ್ತದೆ!"
      },
      concept_explanation: {
        en: "Unlike fractions have different denominators (bottom numbers). To add them, we find a common denominator by calculating the LCM of both bottom numbers. We convert each fraction, then add the top numbers (numerators) while keeping the bottom number the same.",
        hi: "असमान भिन्नों के हर (नीचे की संख्याएँ) अलग-अलग होते हैं। उन्हें जोड़ने के लिए, हम दोनों हरों का LCM (लघुत्तम समापवर्त्य) निकालकर एक समान हर प्राप्त करते हैं। फिर अंशों को जोड़ते हैं!",
        kn: "ಅಸಮಾನ ಭಿನ್ನರಾಶಿಗಳು ಬೇರೆ ಬೇರೆ ಛೇದಗಳನ್ನು ಹೊಂದಿರುತ್ತವೆ. ಇವುಗಳನ್ನು ಕೂಡಲು ಮೊದಲು ಛೇದಗಳ ಲಸಾಅ (LCM) ಕಂಡುಹಿಡಿಯಬೇಕು. ನಂತರ ಭಿನ್ನರಾಶಿಗಳನ್ನು ಸಮಾನ ರೂಪಕ್ಕೆ ತಂದು ಅಂಶಗಳನ್ನು ಕೂಡಬೇಕು!"
      },
      worked_example: {
        problem: "1/3 + 1/4 = ?",
        steps: {
          en: [
            "Step 1: Find the LCM of 3 and 4. The LCM is 12.",
            "Step 2: Convert: Multiply 1/3 by 4/4 to get 4/12. Multiply 1/4 by 3/3 to get 3/12.",
            "Step 3: Add: 4/12 + 3/12 = 7/12."
          ],
          hi: [
            "चरण 1: 3 और 4 का LCM ज्ञात करें। LCM 12 है।",
            "चरण 2: बदलें: 1/3 को 4/12 में बदलें, 1/4 को 3/12 में बदलें।",
            "चरण 3: जोड़ें: 4/12 + 3/12 = 7/12।"
          ],
          kn: [
            "ಹಂತ 1: 3 ಮತ್ತು 4 ರ ಲಸಾಅ (LCM) ಕಂಡುಹಿಡಿಯಿರಿ. ಲಸಾಅ 12 ಆಗಿದೆ.",
            "ಹಂತ 2: ಪರಿವರ್ತಿಸಿ: 1/3 ಇದು 4/12 ಆಗುತ್ತದೆ, 1/4 ಇದು 3/12 ಆಗುತ್ತದೆ.",
            "ಹಂತ 3: ಕೂಡಿರಿ: 4/12 + 3/12 = 7/12."
          ]
        },
        answer: "7/12"
      },
      key_points: {
        en: [
          "Denominators (bottom numbers) must be matching before adding.",
          "Use LCM to rewrite fractions safely.",
          "Add numerators only; never add denominators together!"
        ],
        hi: [
          "जोड़ने से पहले हर (नीचे की संख्या) समान होना आवश्यक है।",
          "भिन्नों को सुरक्षित रूप से बदलने के लिए LCM का उपयोग करें।",
          "केवल अंशों को जोड़ें; हरों को आपस में कभी न जोड़ें!"
        ],
        kn: [
          "ಕೂಡುವ ಮೊದಲು ಛೇದಗಳು (ಕೆಳಗಿನ ಸಂಖ್ಯೆಗಳು) ಒಂದೇ ಇರಬೇಕು.",
          "ಭಿನ್ನರಾಶಿಗಳನ್ನು ಬದಲಾಯಿಸಲು ಲಸಾಅ (LCM) ಬಳಸಿ.",
          "ಅಂಶಗಳನ್ನು ಮಾತ್ರ ಕೂಡಿ; ಛೇದಗಳನ್ನು ಒಟ್ಟಿಗೆ ಕೂಡಬೇಡಿ!"
        ]
      },
      interest_placeholders: {
        INTEREST_PLACE: {
          space: { en: "space shuttle command desk", hi: "अंतरिक्ष यान कमांड डेस्क", kn: "ಬಾಹ್ಯಾಕಾಶ ನೌಕೆಯ ನಿಯಂತ್ರಣ ಕೊಠಡಿ" },
          nature: { en: "green forest camp", hi: "हरे-भरे जंगल के शिविर", kn: "ಹಸಿರು ಕಾಡಿನ ಕ್ಯಾಂಪ್" },
          robots: { en: "robotics programming desk", hi: "रोबोटिक्स लैब की मेज", kn: "ರೋಬೋಟಿಕ್ಸ್ ಲ್ಯಾಬ್ ಡೆಸ್ಕ್" },
          history: { en: "ancient museum library", hi: "प्राचीन संग्रहालय पुस्तकालय", kn: "ಪುರಾತನ ವಸ್ತುಸಂಗ್ರಹಾಲಯದ ಗ್ರಂಥಾಲಯ" },
          sports: { en: "cricket ground stadium", hi: "क्रिकेट स्टेडियम", kn: "ಕ್ರಿಕೆಟ್ ಸ್ಟೇಡಿಯಂ" },
          stories: { en: "fairytale treehouse study room", hi: "परियों के ट्रीहाउस स्टडी रूम", kn: "ಕಾಲ್ಪನಿಕ ಮರದ ಮನೆಯ ಓದುವ ಕೋಣೆ" },
          default: { en: "school classroom canteen", hi: "स्कूल कैंटीन", kn: "ಶಾಲೆಯ ಕ್ಯಾಂಟೀನ್" }
        }
      }
    };

    if (!unlikeFractionsLesson) {
      await CurriculumNode.create({
        name: "Addition of Unlike Fractions",
        nodeType: "example",
        parent: fractionsTopic._id,
        tags: ["fractions", "unlike", "addition"],
        metadata: unlikeFractionsMetadata
      });
      // eslint-disable-next-line no-console
      console.log("Seeded: Addition of Unlike Fractions Lesson Node");
    } else {
      unlikeFractionsLesson.metadata = unlikeFractionsMetadata;
      unlikeFractionsLesson.markModified("metadata");
      await unlikeFractionsLesson.save();
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
