export type LocalizedText = { en: string; hi: string; kn: string };

export interface TopicItem {
  id: string;
  title: LocalizedText;
  desc: LocalizedText;
}

export interface Question {
  id: string;
  question: LocalizedText;
  options: { en: string[]; hi: string[]; kn: string[] };
  correct_index: number;
  explanation: LocalizedText;
}

export interface FlashcardItem {
  id: string;
  front: LocalizedText;
  back: LocalizedText;
  memory_hook: LocalizedText;
}

const text = (value: string): LocalizedText => ({ en: value, hi: value, kn: value });
const options = (values: string[]) => ({ en: values, hi: values, kn: values });

export const TOPICS_BY_SUBJECT: Record<string, TopicItem[]> = {
  math: [
    { id: 'fractions', title: text('Fractions & Decimals'), desc: text('Add, compare, and simplify fraction and decimal values.') },
    { id: 'algebra', title: text('Introduction to Algebra'), desc: text('Use variables and equations to describe number patterns.') },
    { id: 'geometry', title: text('Geometry Basics'), desc: text('Explore angles, triangles, area, and perimeter.') },
  ],
  science: [
    { id: 'forces', title: text('Force & Motion'), desc: text('Understand pushes, pulls, speed, friction, and gravity.') },
    { id: 'plants', title: text('Photosynthesis'), desc: text('Learn how plants use sunlight to make food.') },
    { id: 'matter', title: text('States of Matter'), desc: text('Compare solids, liquids, gases, and changes of state.') },
  ],
  social: [
    { id: 'indus', title: text('Indus Valley Civilization'), desc: text('Discover Harappa, Mohenjo-daro, trade, and city planning.') },
    { id: 'maps', title: text('Maps & Directions'), desc: text('Read symbols, directions, scales, and simple maps.') },
    { id: 'government', title: text('Local Government'), desc: text('Learn how communities make decisions and provide services.') },
  ],
  english: [
    { id: 'tenses', title: text('Active & Passive Voice'), desc: text('Understand how sentences change focus between doer and action.') },
    { id: 'comprehension', title: text('Reading Comprehension'), desc: text('Find main ideas, details, and meaning from passages.') },
    { id: 'writing', title: text('Creative Writing'), desc: text('Build stronger paragraphs, stories, and descriptions.') },
  ],
  kannada: [
    { id: 'sandhi', title: text('Kannada Sandhigalu'), desc: text('Understand how words join and change in Kannada grammar.') },
    { id: 'kannada-poetry', title: text('Kannada Poetry'), desc: text('Read imagery, rhythm, and meaning in simple poems.') },
    { id: 'kannada-grammar', title: text('Kannada Grammar'), desc: text('Practice nouns, verbs, sentence order, and usage.') },
  ],
  coding: [
    { id: 'coding-basics', title: text('Coding Basics'), desc: text('Learn commands, sequences, and how programs follow instructions.') },
    { id: 'logic-loops', title: text('Logic & Loops'), desc: text('Use conditions and repeated steps to solve small problems.') },
    { id: 'build-an-app', title: text('Build a Mini App'), desc: text('Plan screens, buttons, and simple interactions for an app idea.') },
  ],
};

export const QUIZ_BANK: Record<string, Question[]> = {
  fractions: [
    {
      id: 'fractions-q1',
      question: text('What is 1/2 + 1/4?'),
      options: options(['2/6', '3/4', '2/4', '3/8']),
      correct_index: 1,
      explanation: text('Rewrite 1/2 as 2/4, then add 2/4 + 1/4 = 3/4.'),
    },
    {
      id: 'fractions-q2',
      question: text('Which decimal is equal to 1/4?'),
      options: options(['0.14', '0.20', '0.25', '0.40']),
      correct_index: 2,
      explanation: text('One quarter means 1 divided by 4, which is 0.25.'),
    },
    {
      id: 'fractions-q3',
      question: text('What is the denominator in 5/8?'),
      options: options(['5', '8', '13', '3']),
      correct_index: 1,
      explanation: text('The denominator is the bottom number, so in 5/8 it is 8.'),
    },
  ],
  algebra: [
    {
      id: 'algebra-q1',
      question: text('If x + 4 = 9, what is x?'),
      options: options(['3', '4', '5', '13']),
      correct_index: 2,
      explanation: text('Subtract 4 from both sides: x = 9 - 4 = 5.'),
    },
    {
      id: 'algebra-q2',
      question: text('Which expression means "three more than n"?'),
      options: options(['3n', 'n + 3', 'n - 3', '3 - n']),
      correct_index: 1,
      explanation: text('Three more than n means add 3 to n.'),
    },
    {
      id: 'algebra-q3',
      question: text('What does a variable represent?'),
      options: options(['Only zero', 'A known shape', 'A number that can change', 'A punctuation mark']),
      correct_index: 2,
      explanation: text('A variable is a symbol used for a value that can change or is unknown.'),
    },
  ],
  geometry: [
    {
      id: 'geometry-q1',
      question: text('How many degrees are in a right angle?'),
      options: options(['45', '60', '90', '180']),
      correct_index: 2,
      explanation: text('A right angle always measures 90 degrees.'),
    },
    {
      id: 'geometry-q2',
      question: text('Area of a rectangle is found by multiplying...'),
      options: options(['length x width', 'length + width', 'all sides', 'two angles']),
      correct_index: 0,
      explanation: text('Rectangle area is length multiplied by width.'),
    },
    {
      id: 'geometry-q3',
      question: text('A triangle has how many sides?'),
      options: options(['2', '3', '4', '5']),
      correct_index: 1,
      explanation: text('A triangle is a polygon with three sides.'),
    },
  ],
  forces: [
    {
      id: 'forces-q1',
      question: text('A force is best described as a...'),
      options: options(['push or pull', 'type of color', 'unit of time', 'kind of food']),
      correct_index: 0,
      explanation: text('Forces are pushes or pulls that can change motion.'),
    },
    {
      id: 'forces-q2',
      question: text('Friction usually does what to a moving object?'),
      options: options(['Speeds it up forever', 'Slows it down', 'Turns it invisible', 'Removes gravity']),
      correct_index: 1,
      explanation: text('Friction acts against motion, so it often slows objects down.'),
    },
    {
      id: 'forces-q3',
      question: text('Gravity pulls objects toward...'),
      options: options(['the sky', 'Earth', 'sound', 'light']),
      correct_index: 1,
      explanation: text('Gravity pulls objects toward Earth and gives them weight.'),
    },
  ],
  plants: [
    {
      id: 'plants-q1',
      question: text('Plants use sunlight to make food in a process called...'),
      options: options(['evaporation', 'photosynthesis', 'friction', 'digestion']),
      correct_index: 1,
      explanation: text('Photosynthesis is how green plants make food using sunlight.'),
    },
    {
      id: 'plants-q2',
      question: text('Which gas do plants take in for photosynthesis?'),
      options: options(['oxygen', 'carbon dioxide', 'helium', 'nitrogen only']),
      correct_index: 1,
      explanation: text('Plants take in carbon dioxide and release oxygen during photosynthesis.'),
    },
    {
      id: 'plants-q3',
      question: text('The green pigment in leaves is called...'),
      options: options(['chlorophyll', 'protein', 'salt', 'starch']),
      correct_index: 0,
      explanation: text('Chlorophyll helps leaves capture energy from sunlight.'),
    },
  ],
  matter: [
    {
      id: 'matter-q1',
      question: text('Which state of matter has a fixed shape?'),
      options: options(['solid', 'liquid', 'gas', 'steam']),
      correct_index: 0,
      explanation: text('Solids keep their own shape unless a force changes them.'),
    },
    {
      id: 'matter-q2',
      question: text('Water vapor is a...'),
      options: options(['solid', 'liquid', 'gas', 'metal']),
      correct_index: 2,
      explanation: text('Water vapor is water in gas form.'),
    },
    {
      id: 'matter-q3',
      question: text('Melting changes a solid into a...'),
      options: options(['liquid', 'gas only', 'shadow', 'sound']),
      correct_index: 0,
      explanation: text('When a solid melts, it becomes a liquid.'),
    },
  ],
  indus: [
    {
      id: 'indus-q1',
      question: text('Which ancient civilization built cities like Harappa?'),
      options: options(['Indus Valley', 'Roman', 'Maya', 'Greek']),
      correct_index: 0,
      explanation: text('Harappa and Mohenjo-daro were major Indus Valley cities.'),
    },
    {
      id: 'indus-q2',
      question: text('The Indus cities are known for advanced...'),
      options: options(['city planning', 'airplanes', 'printing presses', 'electric trains']),
      correct_index: 0,
      explanation: text('They had planned streets, drainage, and organized settlements.'),
    },
    {
      id: 'indus-q3',
      question: text('Mohenjo-daro means...'),
      options: options(['Mound of the Dead', 'City of Gold', 'Forest Village', 'River Boat']),
      correct_index: 0,
      explanation: text('Mohenjo-daro is commonly translated as Mound of the Dead.'),
    },
  ],
  maps: [
    {
      id: 'maps-q1',
      question: text('A map key helps us understand...'),
      options: options(['symbols on a map', 'a poem', 'a recipe', 'a clock']),
      correct_index: 0,
      explanation: text('A map key explains what symbols and colors mean.'),
    },
    {
      id: 'maps-q2',
      question: text('North, south, east, and west are called...'),
      options: options(['directions', 'continents', 'seasons', 'fractions']),
      correct_index: 0,
      explanation: text('They are cardinal directions.'),
    },
    {
      id: 'maps-q3',
      question: text('A map scale shows...'),
      options: options(['real distance', 'temperature', 'population only', 'grammar rules']),
      correct_index: 0,
      explanation: text('Scale tells how map distance compares to real-world distance.'),
    },
  ],
  government: [
    {
      id: 'government-q1',
      question: text('Local government usually helps manage...'),
      options: options(['roads and public services', 'planet orbits', 'fractions', 'storybook endings']),
      correct_index: 0,
      explanation: text('Local government provides services like roads, water, and community support.'),
    },
    {
      id: 'government-q2',
      question: text('Voting is a way for citizens to...'),
      options: options(['choose representatives', 'measure angles', 'cook rice', 'make clouds']),
      correct_index: 0,
      explanation: text('Voting lets citizens help choose leaders and representatives.'),
    },
    {
      id: 'government-q3',
      question: text('A community rule is useful when it...'),
      options: options(['keeps people safe and fair', 'confuses everyone', 'stops learning', 'hides information']),
      correct_index: 0,
      explanation: text('Good rules help communities stay safe, organized, and fair.'),
    },
  ],
  tenses: [
    {
      id: 'tenses-q1',
      question: text('In passive voice, the action receiver becomes the...'),
      options: options(['subject', 'comma', 'adverb only', 'title']),
      correct_index: 0,
      explanation: text('Passive voice often makes the receiver of the action the subject.'),
    },
    {
      id: 'tenses-q2',
      question: text('Which sentence is active voice?'),
      options: options(['The ball was kicked by Ravi.', 'Ravi kicked the ball.', 'The ball was seen.', 'The book was read.']),
      correct_index: 1,
      explanation: text('Ravi is doing the action directly, so it is active voice.'),
    },
    {
      id: 'tenses-q3',
      question: text('Passive voice often uses a form of...'),
      options: options(['be + past participle', 'only nouns', 'only questions', 'future tense only']),
      correct_index: 0,
      explanation: text('Passive voice commonly uses be verbs with a past participle, such as was written.'),
    },
  ],
  comprehension: [
    {
      id: 'comprehension-q1',
      question: text('The main idea of a passage is...'),
      options: options(['what it is mostly about', 'only the first word', 'the page number', 'a random detail']),
      correct_index: 0,
      explanation: text('The main idea is the central point or message.'),
    },
    {
      id: 'comprehension-q2',
      question: text('A supporting detail should...'),
      options: options(['explain or prove the main idea', 'ignore the topic', 'replace the title', 'always be a question']),
      correct_index: 0,
      explanation: text('Supporting details give evidence or examples for the main idea.'),
    },
    {
      id: 'comprehension-q3',
      question: text('To infer means to...'),
      options: options(['use clues to figure something out', 'copy every word', 'skip the passage', 'count letters']),
      correct_index: 0,
      explanation: text('Inference uses text clues and what you know to understand unstated meaning.'),
    },
  ],
  writing: [
    {
      id: 'writing-q1',
      question: text('A strong paragraph usually begins with a...'),
      options: options(['topic sentence', 'shopping list', 'map scale', 'denominator']),
      correct_index: 0,
      explanation: text('A topic sentence tells the reader what the paragraph is about.'),
    },
    {
      id: 'writing-q2',
      question: text('Descriptive writing uses sensory details to help readers...'),
      options: options(['imagine the scene', 'solve equations only', 'ignore characters', 'avoid examples']),
      correct_index: 0,
      explanation: text('Sensory details make writing vivid and easier to picture.'),
    },
    {
      id: 'writing-q3',
      question: text('A story problem or conflict is important because it...'),
      options: options(['gives characters something to solve', 'removes the setting', 'ends every sentence', 'counts syllables']),
      correct_index: 0,
      explanation: text('Conflict creates purpose and movement in a story.'),
    },
  ],
  sandhi: [
    {
      id: 'sandhi-q1',
      question: text('Sandhi is about how words or sounds...'),
      options: options(['join and change', 'become numbers', 'turn into maps', 'measure force']),
      correct_index: 0,
      explanation: text('Sandhi studies how sounds or words combine and change form.'),
    },
    {
      id: 'sandhi-q2',
      question: text('Studying Sandhi improves...'),
      options: options(['grammar and reading accuracy', 'only drawing', 'only sports', 'weather prediction']),
      correct_index: 0,
      explanation: text('Sandhi helps learners read, split, and understand Kannada words correctly.'),
    },
    {
      id: 'sandhi-q3',
      question: text('When two sounds meet, Sandhi may cause a...'),
      options: options(['sound change', 'fraction sum', 'map scale', 'plant cell']),
      correct_index: 0,
      explanation: text('Sound changes are common when words join.'),
    },
  ],
  'kannada-poetry': [
    {
      id: 'kannada-poetry-q1',
      question: text('Imagery in poetry helps readers...'),
      options: options(['picture ideas in the mind', 'solve only sums', 'find north', 'measure speed']),
      correct_index: 0,
      explanation: text('Imagery uses descriptive language to create mental pictures.'),
    },
    {
      id: 'kannada-poetry-q2',
      question: text('Rhythm in a poem is connected to...'),
      options: options(['sound and beat', 'only maps', 'only coding', 'only decimals']),
      correct_index: 0,
      explanation: text('Rhythm is the pattern of sound and beat in lines.'),
    },
    {
      id: 'kannada-poetry-q3',
      question: text('A poem can express...'),
      options: options(['feelings and ideas', 'only street names', 'only formulas', 'only commands']),
      correct_index: 0,
      explanation: text('Poetry often expresses feelings, images, and meaning in compact language.'),
    },
  ],
  'kannada-grammar': [
    {
      id: 'kannada-grammar-q1',
      question: text('Grammar helps us build sentences that are...'),
      options: options(['clear and meaningful', 'always silent', 'only numbers', 'without words']),
      correct_index: 0,
      explanation: text('Grammar gives structure so sentences make sense.'),
    },
    {
      id: 'kannada-grammar-q2',
      question: text('A verb usually tells us about...'),
      options: options(['an action or state', 'only a color', 'only a map', 'a denominator']),
      correct_index: 0,
      explanation: text('Verbs describe actions, states, or happenings.'),
    },
    {
      id: 'kannada-grammar-q3',
      question: text('A noun names a...'),
      options: options(['person, place, thing, or idea', 'force only', 'loop only', 'direction only']),
      correct_index: 0,
      explanation: text('Nouns are naming words.'),
    },
  ],
  'coding-basics': [
    {
      id: 'coding-basics-q1',
      question: text('A program is a set of...'),
      options: options(['instructions', 'clouds', 'triangles only', 'story titles']),
      correct_index: 0,
      explanation: text('Programs are instructions a computer can follow.'),
    },
    {
      id: 'coding-basics-q2',
      question: text('The order of commands in code is called a...'),
      options: options(['sequence', 'fraction', 'continent', 'chlorophyll']),
      correct_index: 0,
      explanation: text('A sequence is the step-by-step order of instructions.'),
    },
    {
      id: 'coding-basics-q3',
      question: text('Debugging means...'),
      options: options(['finding and fixing mistakes', 'deleting learning', 'drawing maps only', 'adding gravity']),
      correct_index: 0,
      explanation: text('Debugging is how programmers find and fix problems in code.'),
    },
  ],
  'logic-loops': [
    {
      id: 'logic-loops-q1',
      question: text('A loop is used to...'),
      options: options(['repeat steps', 'stop all code', 'make water', 'measure angles only']),
      correct_index: 0,
      explanation: text('Loops repeat instructions until a condition or count is met.'),
    },
    {
      id: 'logic-loops-q2',
      question: text('An if statement helps a program...'),
      options: options(['make a decision', 'draw a map key', 'melt ice only', 'read poetry only']),
      correct_index: 0,
      explanation: text('If statements run code when a condition is true.'),
    },
    {
      id: 'logic-loops-q3',
      question: text('Which is a condition?'),
      options: options(['score > 10', 'blue', 'triangle', 'chapter']),
      correct_index: 0,
      explanation: text('score > 10 can be true or false, so it is a condition.'),
    },
  ],
  'build-an-app': [
    {
      id: 'build-an-app-q1',
      question: text('A button in an app usually lets the user...'),
      options: options(['perform an action', 'change gravity', 'become a gas', 'erase the screen permanently']),
      correct_index: 0,
      explanation: text('Buttons trigger actions such as save, start, next, or submit.'),
    },
    {
      id: 'build-an-app-q2',
      question: text('A screen layout decides...'),
      options: options(['where content and controls appear', 'the weather', 'the LCM', 'plant food']),
      correct_index: 0,
      explanation: text('Layout organizes text, buttons, images, and controls on a screen.'),
    },
    {
      id: 'build-an-app-q3',
      question: text('A prototype is useful because it helps you...'),
      options: options(['test an idea early', 'skip all planning', 'remove users', 'hide buttons']),
      correct_index: 0,
      explanation: text('A prototype lets you try and improve an app idea before final build.'),
    },
  ],
};

export const FLASHCARD_BANK: Record<string, FlashcardItem[]> = Object.fromEntries(
  Object.entries(QUIZ_BANK).map(([topicId, questions]) => [
    topicId,
    questions.map((question, index) => ({
      id: `${topicId}-fc${index + 1}`,
      front: question.question,
      back: question.explanation,
      memory_hook: text(`Remember: ${question.options.en[question.correct_index]}`),
    })),
  ])
);

export function getTopicSubject(topicId: string): string {
  for (const [subjectId, topics] of Object.entries(TOPICS_BY_SUBJECT)) {
    if (topics.some((topic) => topic.id === topicId)) {
      return subjectId;
    }
  }
  return 'math';
}

export function getQuizQuestions(topicId: string): Question[] {
  return QUIZ_BANK[topicId] || QUIZ_BANK.fractions;
}

export function getFlashcards(topicId: string): FlashcardItem[] {
  return FLASHCARD_BANK[topicId] || FLASHCARD_BANK.fractions;
}
