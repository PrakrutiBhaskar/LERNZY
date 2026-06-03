/**
 * seed_topics.js
 * Idempotent seed script. Safe to run multiple times.
 * Adds topic nodes with complete lesson metadata under Grade 6 concepts.
 */

const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, "../../.env"), override: true });

const connectDatabase = require("../config/database");
const CurriculumNode = require("../models/CurriculumNode.model");

async function findOrCreate(filter, doc) {
  const existing = await CurriculumNode.findOne(filter);
  if (existing) {
    console.log(`  - Already exists: ${filter.name}`);
    return existing;
  }

  const created = await CurriculumNode.create(doc);
  console.log(`  + Created concept: ${doc.name}`);
  return created;
}

const localText = (value) => ({ en: value, hi: value, kn: value });

function makeQuiz(topicId, q1, a1, wrong1, e1, q2, a2, wrong2, e2) {
  return [
    {
      id: `${topicId}-q001`,
      question: localText(q1),
      options: {
        en: [a1, ...wrong1],
        hi: [a1, ...wrong1],
        kn: [a1, ...wrong1]
      },
      correct_index: 0,
      explanation: localText(e1)
    },
    {
      id: `${topicId}-q002`,
      question: localText(q2),
      options: {
        en: [wrong2[0], a2, wrong2[1], wrong2[2]],
        hi: [wrong2[0], a2, wrong2[1], wrong2[2]],
        kn: [wrong2[0], a2, wrong2[1], wrong2[2]]
      },
      correct_index: 1,
      explanation: localText(e2)
    }
  ];
}

function topic(parent, data) {
  return {
    name: data.name,
    nodeType: "topic",
    parent,
    tags: data.tags,
    metadata: {
      difficulty: data.difficulty,
      topic_id: data.id,
      title: localText(data.name),
      learning_objectives: data.objectives,
      estimated_minutes: data.minutes,
      concept_explanation: localText(data.explanation),
      base_story_template: localText(data.story),
      worked_example: {
        problem: data.example.problem,
        steps: {
          en: data.example.steps,
          hi: data.example.steps,
          kn: data.example.steps
        },
        answer: data.example.answer
      },
      key_points: {
        en: data.keyPoints,
        hi: data.keyPoints,
        kn: data.keyPoints
      },
      quizQuestions: makeQuiz(data.id, ...data.quiz),
      interest_placeholders: {
        INTEREST_PLACE: {
          space: localText("space mission learning deck"),
          sports: localText("school sports arena"),
          nature: localText("nature discovery camp"),
          robots: localText("robotics lab"),
          stories: localText("story club room"),
          default: localText("classroom activity corner")
        }
      }
    }
  };
}

function getTopics(concepts) {
  const { math, science, social, english, kannada, coding } = concepts;

  const topicData = [
    {
      parent: math._id,
      name: "Ratio & Proportion",
      id: "ratio-proportion",
      difficulty: "medium",
      minutes: 12,
      tags: ["ratio", "proportion", "numeracy"],
      objectives: ["Compare two quantities using ratios", "Identify equivalent ratios", "Solve simple proportions"],
      explanation: "A ratio compares two quantities, such as 2 red balls for every 3 blue balls. A proportion says two ratios are equal. If 3 notebooks cost 45 rupees, the same rate can be used to find the cost of any number of notebooks.",
      story: "{{STUDENT_NAME}} is helping at the {{INTEREST_PLACE}} where 3 badges cost 45 rupees. To buy 8 badges, the same ratio helps find the total cost.",
      example: { problem: "3 notebooks cost 45 rupees. What do 8 notebooks cost?", steps: ["Find one notebook cost: 45 divided by 3 = 15.", "Multiply by 8: 15 x 8 = 120."], answer: "120 rupees" },
      keyPoints: ["Ratios compare quantities in the same order.", "Equivalent ratios have the same value.", "Unit rate is often the easiest way to solve."],
      quiz: ["Simplest form of 12:18?", "2:3", ["3:2", "6:9", "12:6"], "Divide both numbers by 6 to get 2:3.", "If 4 pens cost 40 rupees, what is the cost of 7 pens?", "70 rupees", ["40 rupees", "80 rupees", "100 rupees"], "One pen costs 10 rupees, so 7 pens cost 70 rupees."]
    },
    {
      parent: math._id,
      name: "Percentages",
      id: "percentages",
      difficulty: "medium",
      minutes: 10,
      tags: ["percentage", "fractions", "discount"],
      objectives: ["Understand percent as out of 100", "Find a percentage of a number", "Apply percentage to discounts"],
      explanation: "Percent means per hundred. To find 25% of a number, multiply the number by 25 and divide by 100. Percentages are useful for marks, discounts, increases, and comparisons.",
      story: "{{STUDENT_NAME}} sees a 20% discount at the {{INTEREST_PLACE}}. Percentages help calculate how much money is saved before buying.",
      example: { problem: "Find 20% of 350.", steps: ["20% means 20 out of 100.", "350 x 20 / 100 = 70."], answer: "70" },
      keyPoints: ["50% means half.", "25% means one fourth.", "Always divide by 100 when finding a percent."],
      quiz: ["What is 10% of 90?", "9", ["90", "10", "900"], "90 x 10 / 100 = 9.", "A 500 rupee bag has 20% off. How much is the discount?", "100 rupees", ["20 rupees", "200 rupees", "400 rupees"], "500 x 20 / 100 = 100."]
    },
    {
      parent: math._id,
      name: "Integers & Number Line",
      id: "integers-number-line",
      difficulty: "medium",
      minutes: 11,
      tags: ["integers", "number line", "negative numbers"],
      objectives: ["Identify positive and negative integers", "Place integers on a number line", "Add and subtract integers"],
      explanation: "Integers are whole numbers, zero, and negative whole numbers. On a number line, numbers to the right are greater and numbers to the left are smaller. Adding a positive moves right; adding a negative moves left.",
      story: "{{STUDENT_NAME}} checks the temperature at the {{INTEREST_PLACE}}. It was -3 degrees in the morning and rose by 8 degrees by noon.",
      example: { problem: "-3 + 8 = ?", steps: ["Start at -3 on the number line.", "Move 8 steps to the right.", "You land on 5."], answer: "5" },
      keyPoints: ["Zero is neither positive nor negative.", "Negative numbers are less than zero.", "Distance from zero is called absolute value."],
      quiz: ["Which integer is smaller: -7 or -2?", "-7", ["-2", "0", "7"], "-7 is farther left on the number line.", "-4 + 9 equals?", "5", ["-13", "-5", "13"], "Starting at -4 and moving 9 right lands on 5."]
    },
    {
      parent: math._id,
      name: "Mensuration Basics",
      id: "mensuration-basics",
      difficulty: "medium",
      minutes: 12,
      tags: ["area", "perimeter", "geometry"],
      objectives: ["Find perimeter of rectangles", "Find area of rectangles", "Choose correct units"],
      explanation: "Mensuration is measuring shapes. Perimeter is the distance around a shape. Area is the space inside a shape. For a rectangle, perimeter is 2 x (length + breadth), and area is length x breadth.",
      story: "{{STUDENT_NAME}} is designing a notice board for the {{INTEREST_PLACE}} and needs to know how much border tape and board surface are needed.",
      example: { problem: "A rectangle is 8 cm long and 5 cm wide. Find area and perimeter.", steps: ["Area = 8 x 5 = 40 square cm.", "Perimeter = 2 x (8 + 5) = 26 cm."], answer: "Area 40 square cm, perimeter 26 cm" },
      keyPoints: ["Perimeter uses length units.", "Area uses square units.", "Do not mix up area and perimeter."],
      quiz: ["Area of a 6 cm by 4 cm rectangle?", "24 square cm", ["10 cm", "20 square cm", "24 cm"], "Area = length x breadth = 6 x 4.", "Perimeter of a 7 m by 3 m rectangle?", "20 m", ["21 square m", "10 m", "14 m"], "Perimeter = 2 x (7 + 3) = 20 m."]
    },
    {
      parent: math._id,
      name: "Data Handling",
      id: "data-handling",
      difficulty: "easy",
      minutes: 10,
      tags: ["data", "charts", "tables"],
      objectives: ["Read data from tables", "Interpret bar graphs", "Find simple totals"],
      explanation: "Data handling means collecting, organizing, and reading information. Tables and bar graphs make data easy to compare. A taller bar usually means a larger value.",
      story: "{{STUDENT_NAME}} surveys favorite games at the {{INTEREST_PLACE}} and turns the answers into a bar graph.",
      example: { problem: "A class has 8 cricket votes, 5 football votes, and 7 chess votes. How many votes total?", steps: ["Add all votes: 8 + 5 + 7.", "The total is 20."], answer: "20 votes" },
      keyPoints: ["Labels tell what each row or bar means.", "Scales show how much each step represents.", "Check units before comparing data."],
      quiz: ["If a bar reaches 12, what value does it show?", "12", ["6", "24", "0"], "The bar height shows the value on the scale.", "Votes are 3, 9, and 8. What is the total?", "20", ["18", "21", "24"], "3 + 9 + 8 = 20."]
    },
    {
      parent: science._id,
      name: "The Human Body Systems",
      id: "human-body-systems",
      difficulty: "medium",
      minutes: 12,
      tags: ["biology", "body systems", "health"],
      objectives: ["Name major body systems", "Explain digestion and circulation", "Connect organs to functions"],
      explanation: "The human body has systems that work together. The digestive system breaks food into nutrients, the circulatory system moves blood, and the respiratory system brings oxygen into the body.",
      story: "{{STUDENT_NAME}} visits the {{INTEREST_PLACE}} and follows a bite of food from the mouth to the intestines.",
      example: { problem: "Trace food through digestion.", steps: ["Food is chewed in the mouth.", "It moves to the stomach.", "Nutrients are absorbed mostly in the small intestine."], answer: "Mouth, stomach, small intestine" },
      keyPoints: ["The heart pumps blood.", "The lungs exchange oxygen and carbon dioxide.", "The small intestine absorbs most nutrients."],
      quiz: ["Which organ pumps blood?", "Heart", ["Lungs", "Stomach", "Brain"], "The heart pumps blood through blood vessels.", "Where does most nutrient absorption happen?", "Small intestine", ["Mouth", "Large intestine", "Oesophagus"], "The small intestine has villi that absorb nutrients."]
    },
    {
      parent: science._id,
      name: "Force & Motion",
      id: "force-motion",
      difficulty: "medium",
      minutes: 11,
      tags: ["physics", "force", "motion"],
      objectives: ["Define force", "Describe motion", "Recognize friction and gravity"],
      explanation: "A force is a push or pull. Forces can start motion, stop motion, speed things up, slow things down, or change direction. Friction is a force that opposes motion, and gravity pulls objects toward Earth.",
      story: "{{STUDENT_NAME}} rolls a ball across the {{INTEREST_PLACE}} and notices it slows down because of friction.",
      example: { problem: "Why does a rolling ball stop on the ground?", steps: ["The ball moves forward.", "Friction from the ground acts backward.", "The ball slows and stops."], answer: "Friction slows it down" },
      keyPoints: ["Force is measured by its effect on motion.", "Friction acts opposite motion.", "Gravity pulls objects downward."],
      quiz: ["A force is a?", "Push or pull", ["Color", "Sound", "Shape"], "Force means a push or pull on an object.", "Which force pulls objects toward Earth?", "Gravity", ["Friction", "Magnetism", "Light"], "Gravity pulls objects toward Earth."]
    },
    {
      parent: science._id,
      name: "Light & Shadows",
      id: "light-shadows",
      difficulty: "easy",
      minutes: 10,
      tags: ["light", "shadow", "physics"],
      objectives: ["Identify sources of light", "Explain shadow formation", "Compare transparent and opaque objects"],
      explanation: "Light travels in straight lines. A shadow forms when an opaque object blocks light. Transparent objects let most light pass, translucent objects let some light pass, and opaque objects block light.",
      story: "{{STUDENT_NAME}} uses a torch at the {{INTEREST_PLACE}} to make shadow shapes on a wall.",
      example: { problem: "Why does a book make a shadow?", steps: ["Light travels from the torch.", "The book blocks the light.", "A dark shadow forms behind the book."], answer: "The book is opaque" },
      keyPoints: ["The Sun is a natural light source.", "Opaque objects form clear shadows.", "Shadow size changes with distance from the light."],
      quiz: ["Which object usually forms a clear shadow?", "Opaque object", ["Transparent glass", "Clean water", "Air"], "Opaque objects block light.", "Light usually travels in?", "Straight lines", ["Circles", "Random loops", "Zigzags only"], "Light travels in straight lines in a uniform medium."]
    },
    {
      parent: science._id,
      name: "Plants & Photosynthesis",
      id: "plants-photosynthesis",
      difficulty: "medium",
      minutes: 12,
      tags: ["plants", "photosynthesis", "biology"],
      objectives: ["Describe photosynthesis", "Name plant needs", "Explain the role of leaves"],
      explanation: "Plants make food in their leaves using sunlight, water, and carbon dioxide. This process is called photosynthesis. Chlorophyll in leaves helps capture sunlight.",
      story: "{{STUDENT_NAME}} grows a bean plant near the {{INTEREST_PLACE}} window and observes how sunlight changes its growth.",
      example: { problem: "What does a plant need to make food?", steps: ["Roots take in water.", "Leaves take in carbon dioxide.", "Sunlight provides energy."], answer: "Sunlight, water, and carbon dioxide" },
      keyPoints: ["Leaves are the main food-making parts.", "Chlorophyll gives leaves green color.", "Plants release oxygen during photosynthesis."],
      quiz: ["What process helps plants make food?", "Photosynthesis", ["Digestion", "Evaporation", "Rusting"], "Photosynthesis is how plants make food.", "Which gas do plants take in for photosynthesis?", "Carbon dioxide", ["Nitrogen", "Helium", "Smoke"], "Plants use carbon dioxide with water and sunlight."]
    },
    {
      parent: social._id,
      name: "Indian Constitution Basics",
      id: "constitution-basics",
      difficulty: "medium",
      minutes: 12,
      tags: ["civics", "constitution", "rights"],
      objectives: ["Define constitution", "Recognize rights and duties", "Explain equality before law"],
      explanation: "A constitution is a set of basic rules for running a country. It explains how government works and protects important rights such as equality, freedom, and justice.",
      story: "{{STUDENT_NAME}} joins a mock parliament at the {{INTEREST_PLACE}} and learns why rules must be fair for everyone.",
      example: { problem: "Why do schools and countries need rules?", steps: ["Rules guide behavior.", "Fair rules protect everyone.", "A constitution gives the highest rules for a country."], answer: "Rules create fairness and order" },
      keyPoints: ["The Constitution is the supreme law of India.", "Rights protect citizens.", "Duties remind citizens to act responsibly."],
      quiz: ["What is a constitution?", "Basic rules of a country", ["A story book", "A map", "A festival"], "A constitution gives the basic rules for governing.", "Equality before law means?", "Law applies fairly to everyone", ["Only leaders follow law", "No rules exist", "Only students follow law"], "Equality means the law should treat people fairly."]
    },
    {
      parent: social._id,
      name: "Maps & Directions",
      id: "maps-directions",
      difficulty: "easy",
      minutes: 10,
      tags: ["geography", "maps", "directions"],
      objectives: ["Use cardinal directions", "Read symbols on maps", "Understand scale"],
      explanation: "Maps show places from above using symbols, directions, and scale. The four main directions are north, south, east, and west. A map key explains what symbols mean.",
      story: "{{STUDENT_NAME}} uses a map at the {{INTEREST_PLACE}} to find the library, garden, and playground.",
      example: { problem: "A map says 1 cm equals 1 km. Two places are 4 cm apart. What is the real distance?", steps: ["Read the scale: 1 cm = 1 km.", "Multiply 4 cm by 1 km.", "Distance is 4 km."], answer: "4 km" },
      keyPoints: ["North is usually shown at the top of a map.", "A key explains symbols.", "Scale connects map distance to real distance."],
      quiz: ["Which direction is opposite north?", "South", ["East", "West", "Up"], "South is opposite north.", "What does a map key show?", "Meaning of symbols", ["Weather only", "Page number", "Book title"], "A key explains the map symbols."]
    },
    {
      parent: social._id,
      name: "Ancient Civilizations",
      id: "ancient-civilizations",
      difficulty: "medium",
      minutes: 12,
      tags: ["history", "civilization", "archaeology"],
      objectives: ["Explain civilization", "Identify features of ancient cities", "Understand evidence from archaeology"],
      explanation: "A civilization is a complex society with cities, jobs, trade, rules, and culture. Archaeologists study objects, buildings, and writings to learn how ancient people lived.",
      story: "{{STUDENT_NAME}} examines clay seals at the {{INTEREST_PLACE}} and learns how trade worked in an ancient city.",
      example: { problem: "What can a clay pot tell historians?", steps: ["Its shape shows how it was used.", "Its material shows local resources.", "Its decoration shows culture."], answer: "It gives clues about daily life" },
      keyPoints: ["Cities need planning and resources.", "Trade connects different regions.", "Artifacts are human-made objects from the past."],
      quiz: ["Who studies artifacts?", "Archaeologist", ["Astronaut", "Doctor", "Pilot"], "Archaeologists study objects from the past.", "A civilization usually has?", "Cities and organized life", ["Only forests", "No tools", "No rules"], "Civilizations have cities, work, trade, and rules."]
    },
    {
      parent: english._id,
      name: "Nouns, Pronouns & Verbs",
      id: "nouns-pronouns-verbs",
      difficulty: "easy",
      minutes: 10,
      tags: ["grammar", "parts of speech", "english"],
      objectives: ["Identify nouns", "Use pronouns", "Find verbs in sentences"],
      explanation: "Nouns name people, places, animals, or things. Pronouns replace nouns to avoid repetition. Verbs show action or state of being.",
      story: "{{STUDENT_NAME}} writes a short report about the {{INTEREST_PLACE}} and improves it by replacing repeated nouns with pronouns.",
      example: { problem: "Find the noun, pronoun, and verb: Riya said she runs fast.", steps: ["Riya is a noun.", "She is a pronoun.", "Said and runs are verbs."], answer: "Riya, she, said/runs" },
      keyPoints: ["A noun names something.", "A pronoun stands in for a noun.", "A verb tells what happens."],
      quiz: ["Which word is a noun: river, quickly, blue?", "river", ["quickly", "blue", "very"], "River names a thing/place, so it is a noun.", "In 'He plays', what is the verb?", "plays", ["He", "the", "none"], "Plays shows the action."]
    },
    {
      parent: english._id,
      name: "Reading Comprehension",
      id: "reading-comprehension",
      difficulty: "medium",
      minutes: 12,
      tags: ["reading", "comprehension", "english"],
      objectives: ["Find main idea", "Use details as evidence", "Infer meaning from context"],
      explanation: "Reading comprehension means understanding what a text says and what it suggests. Good readers identify the main idea, notice details, and use clues to infer meaning.",
      story: "{{STUDENT_NAME}} reads a mystery passage at the {{INTEREST_PLACE}} and uses clues to explain what happened.",
      example: { problem: "A passage says the ground was wet and people carried umbrellas. What can you infer?", steps: ["Wet ground is a clue.", "Umbrellas are used in rain.", "It probably rained."], answer: "It probably rained" },
      keyPoints: ["Main idea is what the text is mostly about.", "Details support the main idea.", "Inference uses clues plus your thinking."],
      quiz: ["What is the main idea?", "What a text is mostly about", ["A spelling error", "Only the last word", "A page number"], "The main idea captures the central point.", "An inference is based on?", "Clues and reasoning", ["Guessing without reading", "Only title color", "Counting commas"], "Inference uses text clues and reasoning."]
    },
    {
      parent: english._id,
      name: "Creative Writing",
      id: "creative-writing",
      difficulty: "medium",
      minutes: 14,
      tags: ["writing", "stories", "english"],
      objectives: ["Plan a story", "Develop characters", "Use descriptive details"],
      explanation: "Creative writing uses imagination with structure. A strong story has a setting, characters, a problem, events, and a resolution. Details help readers see, hear, and feel the scene.",
      story: "{{STUDENT_NAME}} turns a normal day at the {{INTEREST_PLACE}} into an adventure story with a surprising problem.",
      example: { problem: "Plan a story about a lost key.", steps: ["Setting: school library.", "Problem: the cupboard key is missing.", "Resolution: clues lead to the reading table."], answer: "A complete story plan" },
      keyPoints: ["Characters need goals.", "Problems create interest.", "Specific details make writing vivid."],
      quiz: ["What creates conflict in a story?", "A problem", ["A page number", "A comma", "A margin"], "The problem creates conflict and interest.", "Setting means?", "Where and when a story happens", ["Only the hero name", "The ending only", "A spelling list"], "Setting tells place and time."]
    },
    {
      parent: kannada._id,
      name: "Kannada Varnamale Practice",
      id: "kannada-varnamale",
      difficulty: "easy",
      minutes: 10,
      tags: ["kannada", "letters", "language"],
      objectives: ["Recognize Kannada vowels and consonants", "Practice letter sounds", "Build simple words"],
      explanation: "Kannada varnamale is the alphabet system used to read and write Kannada. Learning letters, sounds, and simple combinations helps students read words confidently.",
      story: "{{STUDENT_NAME}} labels objects at the {{INTEREST_PLACE}} using Kannada letters and practices reading each label aloud.",
      example: { problem: "How do letter sounds help reading?", steps: ["Recognize the letter.", "Say its sound.", "Combine sounds to read the word."], answer: "Letters combine to make words" },
      keyPoints: ["Vowels and consonants work together.", "Sound practice improves reading.", "Writing letters helps memory."],
      quiz: ["What is varnamale?", "Alphabet", ["Number table", "Map", "Game score"], "Varnamale means alphabet.", "Why practice letter sounds?", "To read words better", ["To skip reading", "To erase words", "To count coins"], "Sounds combine to form words."]
    },
    {
      parent: kannada._id,
      name: "Simple Kannada Sentences",
      id: "simple-kannada-sentences",
      difficulty: "easy",
      minutes: 11,
      tags: ["kannada", "sentences", "grammar"],
      objectives: ["Build simple sentences", "Use subject and action words", "Read everyday Kannada lines"],
      explanation: "A simple sentence expresses one complete idea. In Kannada learning, students can begin with a subject, an action, and a clear object or place.",
      story: "{{STUDENT_NAME}} writes short Kannada sentences about what classmates are doing at the {{INTEREST_PLACE}}.",
      example: { problem: "Make a simple sentence about a student reading.", steps: ["Choose subject: student.", "Choose action: reads.", "Add object: book."], answer: "The student reads a book." },
      keyPoints: ["A sentence should express a complete idea.", "Action words tell what happens.", "Short sentences build confidence."],
      quiz: ["A complete sentence should have?", "A complete idea", ["Only random letters", "Only a full stop", "Only numbers"], "A sentence communicates a complete thought.", "Which word type shows action?", "Verb", ["Color", "Page", "Comma"], "A verb tells the action."]
    },
    {
      parent: coding._id,
      name: "Variables & Data Types",
      id: "variables-data-types",
      difficulty: "easy",
      minutes: 12,
      tags: ["coding", "variables", "data types"],
      objectives: ["Create variables", "Identify strings and numbers", "Use variables in expressions"],
      explanation: "A variable stores a value so a program can use it later. Common data types include numbers, strings, and booleans. Clear variable names make code easier to read.",
      story: "{{STUDENT_NAME}} builds a scoreboard at the {{INTEREST_PLACE}} and stores the player score in a variable.",
      example: { problem: "Use variables to find final price.", steps: ["price = 50", "discount = 10", "finalPrice = price - discount"], answer: "40" },
      keyPoints: ["Strings are text.", "Numbers can be used in calculations.", "Booleans are true or false values."],
      quiz: ["Which value is a string?", "\"Hello\"", ["25", "true", "10.5"], "Text inside quotes is a string.", "If score = 7, score + 3 equals?", "10", ["73", "4", "score3"], "7 + 3 = 10."]
    },
    {
      parent: coding._id,
      name: "Conditionals",
      id: "conditionals",
      difficulty: "medium",
      minutes: 12,
      tags: ["coding", "if else", "logic"],
      objectives: ["Use if statements", "Compare values", "Choose actions based on conditions"],
      explanation: "Conditionals let a program make decisions. If a condition is true, one block of code runs. Otherwise, a different block can run using else.",
      story: "{{STUDENT_NAME}} programs a quiz at the {{INTEREST_PLACE}} where the app checks whether an answer is correct.",
      example: { problem: "Show pass if marks are at least 35.", steps: ["Check condition: marks >= 35.", "If true, print Pass.", "Else, print Try again."], answer: "An if-else decision" },
      keyPoints: ["Conditions evaluate to true or false.", "Use comparison operators like >, <, and ==.", "Else handles the other case."],
      quiz: ["What does an if statement do?", "Makes a decision", ["Draws a circle only", "Deletes all code", "Stores only text"], "If statements run code based on a condition.", "Which operator checks equality in many languages?", "==", ["=", "+", "!="], "== compares two values for equality."]
    },
    {
      parent: coding._id,
      name: "Loops",
      id: "loops",
      difficulty: "medium",
      minutes: 12,
      tags: ["coding", "loops", "iteration"],
      objectives: ["Explain repetition in code", "Use simple loops", "Avoid infinite loops"],
      explanation: "Loops repeat code. A for loop is useful when the number of repetitions is known. A while loop repeats as long as a condition stays true.",
      story: "{{STUDENT_NAME}} writes code at the {{INTEREST_PLACE}} to print practice questions five times without copying the same line.",
      example: { problem: "Print numbers 1 to 3.", steps: ["Start at 1.", "Repeat printing while the number is 3 or less.", "Increase the number each time."], answer: "1, 2, 3" },
      keyPoints: ["Loops reduce repeated code.", "A loop needs a stopping condition.", "Counters help track repetitions."],
      quiz: ["Why use a loop?", "To repeat code", ["To turn off code", "To store only images", "To change the keyboard"], "Loops repeat instructions.", "What can happen without a stopping condition?", "Infinite loop", ["Better spelling", "Automatic login", "No output ever guaranteed"], "A loop may run forever if it never stops."]
    }
  ];

  return topicData.map((item) => topic(item.parent, item));
}

const run = async () => {
  try {
    await connectDatabase();
    console.log("\nLERNZY topic seeding started\n");

    const grade6 = await CurriculumNode.findOne({ name: "Grade 6", nodeType: "grade" });
    if (!grade6) throw new Error("Grade 6 node not found. Run `npm run seed` first.");

    const math = await findOrCreate(
      { name: "Mathematics", nodeType: "concept", parent: grade6._id },
      { name: "Mathematics", nodeType: "concept", parent: grade6._id, tags: ["math"], metadata: { standard: "NCERT" } }
    );
    const science = await findOrCreate(
      { name: "Science", nodeType: "concept", parent: grade6._id },
      { name: "Science", nodeType: "concept", parent: grade6._id, tags: ["science"], metadata: { standard: "NCERT" } }
    );
    const social = await findOrCreate(
      { name: "Social Studies", nodeType: "concept", parent: grade6._id },
      { name: "Social Studies", nodeType: "concept", parent: grade6._id, tags: ["social"], metadata: { standard: "NCERT" } }
    );
    const english = await findOrCreate(
      { name: "English", nodeType: "concept", parent: grade6._id },
      { name: "English", nodeType: "concept", parent: grade6._id, tags: ["english"], metadata: { standard: "NCERT" } }
    );
    const kannada = await findOrCreate(
      { name: "Kannada", nodeType: "concept", parent: grade6._id },
      { name: "Kannada", nodeType: "concept", parent: grade6._id, tags: ["kannada"], metadata: { standard: "Karnataka State" } }
    );
    const coding = await findOrCreate(
      { name: "Coding", nodeType: "concept", parent: grade6._id },
      { name: "Coding", nodeType: "concept", parent: grade6._id, tags: ["coding", "stem"], metadata: { standard: "NEP 2020" } }
    );

    const topics = getTopics({ math, science, social, english, kannada, coding });

    let created = 0;
    let updated = 0;
    for (const item of topics) {
      const existing = await CurriculumNode.findOne({ name: item.name, nodeType: "topic", parent: item.parent });
      if (existing) {
        existing.tags = item.tags;
        existing.metadata = item.metadata;
        existing.markModified("metadata");
        await existing.save();
        console.log(`  ~ Updated: ${item.name}`);
        updated++;
      } else {
        await CurriculumNode.create(item);
        console.log(`  + Created topic: ${item.name}`);
        created++;
      }
    }

    console.log(`\nDone. Created: ${created}, Updated: ${updated}\n`);
    process.exit(0);
  } catch (err) {
    console.error("Seeding failed:", err.message);
    process.exit(1);
  }
};

run();
