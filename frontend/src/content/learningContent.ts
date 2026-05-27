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

export interface LessonContent {
  topic_id: string;
  title: LocalizedText;
  learning_objectives: string[];
  estimated_minutes: number;
  base_story_template: LocalizedText;
  concept_explanation: LocalizedText;
  worked_example: {
    problem: string;
    steps: { en: string[]; hi: string[]; kn: string[] };
    answer: string;
  };
  key_points: { en: string[]; hi: string[]; kn: string[] };
  interest_placeholders: {
    INTEREST_PLACE: Record<string, LocalizedText>;
  };
  diagram: {
    source: string;
    caption: string;
    description: string;
  };
}

interface FactItem {
  front: string;
  back: string;
  hook: string;
}

interface CheckItem {
  question: string;
  options: string[];
  correct_index: number;
  explanation: string;
}

interface TopicBlueprint {
  concept: string;
  objectives: string[];
  example: string;
  steps: string[];
  answer: string;
  keyPoints: string[];
  facts: FactItem[];
  checks: CheckItem[];
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

const BLUEPRINTS: Record<string, TopicBlueprint> = {
  fractions: {
    concept: 'Fractions show parts of a whole, while decimals show the same ideas using place value. To add or compare fractions, make the denominators match first.',
    objectives: ['Identify numerators and denominators.', 'Convert simple fractions to decimals.', 'Add fractions using common denominators.'],
    example: 'Add 1/3 + 1/4.',
    steps: ['Find a common denominator: 12.', 'Rewrite 1/3 as 4/12 and 1/4 as 3/12.', 'Add the numerators: 4/12 + 3/12 = 7/12.'],
    answer: '7/12',
    keyPoints: ['The denominator names the equal parts.', 'Equivalent fractions have the same value.', 'Decimals use tenths, hundredths, and thousandths.'],
    facts: [
      { front: 'What is a numerator?', back: 'The top number that shows how many parts are being counted.', hook: 'Numerator = number on top.' },
      { front: 'What is a denominator?', back: 'The bottom number that shows total equal parts.', hook: 'Denominator = down number.' },
      { front: 'What is 1/2 as a decimal?', back: '0.5', hook: 'Half of one whole is five tenths.' },
      { front: 'Why use common denominators?', back: 'They make fraction parts the same size before adding or comparing.', hook: 'Same bottoms before adding.' },
      { front: 'What is an equivalent fraction?', back: 'A fraction with the same value but different numbers.', hook: 'Different look, same amount.' },
    ],
    checks: [
      { question: 'What is 1/2 + 1/4?', options: ['2/6', '3/4', '2/4', '3/8'], correct_index: 1, explanation: '1/2 is 2/4, so 2/4 + 1/4 = 3/4.' },
      { question: 'Which decimal equals 1/4?', options: ['0.14', '0.20', '0.25', '0.40'], correct_index: 2, explanation: 'One quarter is 1 divided by 4, which is 0.25.' },
      { question: 'What is the denominator in 5/8?', options: ['5', '8', '13', '3'], correct_index: 1, explanation: 'The denominator is the bottom number.' },
      { question: 'Which fraction is equivalent to 1/2?', options: ['2/4', '1/3', '3/5', '4/6'], correct_index: 0, explanation: '2/4 simplifies to 1/2.' },
      { question: 'Which is greater?', options: ['1/3', '1/6', 'They are equal', 'Cannot compare'], correct_index: 0, explanation: 'One third is larger than one sixth because thirds are bigger parts.' },
    ],
  },
  algebra: {
    concept: 'Algebra uses letters to stand for unknown or changing numbers. Equations stay balanced when you do the same operation to both sides.',
    objectives: ['Understand variables.', 'Solve one-step equations.', 'Translate words into expressions.'],
    example: 'Solve x + 7 = 15.',
    steps: ['Find the operation attached to x.', 'Undo +7 by subtracting 7 from both sides.', 'x = 8.'],
    answer: 'x = 8',
    keyPoints: ['A variable can stand for an unknown number.', 'An equation has two equal sides.', 'Inverse operations undo each other.'],
    facts: [
      { front: 'What is a variable?', back: 'A symbol that represents a number.', hook: 'Variable values can vary.' },
      { front: 'What does x + 3 mean?', back: 'Three more than x.', hook: 'More than means add.' },
      { front: 'How do you solve x - 5 = 9?', back: 'Add 5 to both sides to get x = 14.', hook: 'Undo subtraction with addition.' },
      { front: 'What is a coefficient?', back: 'A number multiplied by a variable.', hook: '3x has coefficient 3.' },
      { front: 'Why balance equations?', back: 'Both sides must remain equal.', hook: 'Same move, both sides.' },
    ],
    checks: [
      { question: 'If x + 4 = 9, what is x?', options: ['3', '4', '5', '13'], correct_index: 2, explanation: 'Subtract 4 from both sides: x = 5.' },
      { question: 'Which expression means three more than n?', options: ['3n', 'n + 3', 'n - 3', '3 - n'], correct_index: 1, explanation: 'Three more than n means add 3.' },
      { question: 'What does a variable represent?', options: ['Only zero', 'A known shape', 'A number that can change', 'A punctuation mark'], correct_index: 2, explanation: 'A variable can represent an unknown or changing value.' },
      { question: 'Solve y - 6 = 10.', options: ['4', '10', '16', '60'], correct_index: 2, explanation: 'Add 6 to both sides: y = 16.' },
      { question: 'In 5a, what is 5 called?', options: ['Coefficient', 'Denominator', 'Variable', 'Angle'], correct_index: 0, explanation: 'The number multiplying a variable is the coefficient.' },
    ],
  },
  geometry: {
    concept: 'Geometry studies shapes, sizes, angles, and space. It helps us measure objects and describe how figures are built.',
    objectives: ['Recognize common shapes.', 'Measure angles.', 'Calculate simple area and perimeter.'],
    example: 'Find the area of a rectangle with length 8 cm and width 3 cm.',
    steps: ['Use area = length x width.', 'Multiply 8 x 3.', 'The area is 24 square cm.'],
    answer: '24 square cm',
    keyPoints: ['A right angle is 90 degrees.', 'Perimeter is distance around a shape.', 'Area measures surface covered.'],
    facts: [
      { front: 'What is a right angle?', back: 'An angle that measures 90 degrees.', hook: 'Right angle = square corner.' },
      { front: 'How many sides does a triangle have?', back: 'Three sides.', hook: 'Tri means three.' },
      { front: 'What is perimeter?', back: 'The total distance around a shape.', hook: 'Perimeter walks around.' },
      { front: 'What is rectangle area?', back: 'Length multiplied by width.', hook: 'Area covers inside.' },
      { front: 'What is a parallel line?', back: 'A line that stays the same distance from another line and never meets it.', hook: 'Parallel paths never cross.' },
    ],
    checks: [
      { question: 'How many degrees are in a right angle?', options: ['45', '60', '90', '180'], correct_index: 2, explanation: 'A right angle measures 90 degrees.' },
      { question: 'Area of a rectangle is found by multiplying...', options: ['length x width', 'length + width', 'all sides', 'two angles'], correct_index: 0, explanation: 'Rectangle area is length times width.' },
      { question: 'A triangle has how many sides?', options: ['2', '3', '4', '5'], correct_index: 1, explanation: 'A triangle has three sides.' },
      { question: 'Perimeter means...', options: ['inside space', 'distance around', 'angle size', 'shape color'], correct_index: 1, explanation: 'Perimeter is the distance around a figure.' },
      { question: 'Lines that never meet are...', options: ['parallel', 'curved', 'vertical only', 'triangles'], correct_index: 0, explanation: 'Parallel lines stay apart and never intersect.' },
    ],
  },
  forces: {
    concept: 'A force is a push or pull that can change an object\'s speed, direction, or shape. Motion depends on force, mass, and friction.',
    objectives: ['Define push and pull.', 'Explain friction and gravity.', 'Connect force to changes in motion.'],
    example: 'A ball rolling on rough ground slows down.',
    steps: ['The ball is moving forward.', 'Friction acts opposite the motion.', 'The ball loses speed and stops.'],
    answer: 'Friction slows the ball.',
    keyPoints: ['Forces can start or stop motion.', 'Friction opposes motion.', 'Gravity pulls objects toward Earth.'],
    facts: [
      { front: 'What is force?', back: 'A push or pull on an object.', hook: 'Force moves or changes.' },
      { front: 'What does friction do?', back: 'It resists motion between surfaces.', hook: 'Friction fights sliding.' },
      { front: 'What is gravity?', back: 'A force that pulls objects toward each other.', hook: 'Gravity pulls down on Earth.' },
      { front: 'What is speed?', back: 'How fast an object moves.', hook: 'Speed = fastness.' },
      { front: 'What happens with a stronger force?', back: 'It can cause a bigger change in motion.', hook: 'More push, more change.' },
    ],
    checks: [
      { question: 'A force is best described as a...', options: ['push or pull', 'type of color', 'unit of time', 'kind of food'], correct_index: 0, explanation: 'Forces are pushes or pulls.' },
      { question: 'Friction usually does what to a moving object?', options: ['Speeds it forever', 'Slows it down', 'Turns it invisible', 'Removes gravity'], correct_index: 1, explanation: 'Friction acts against motion.' },
      { question: 'Gravity pulls objects toward...', options: ['the sky', 'Earth', 'sound', 'light'], correct_index: 1, explanation: 'Earth\'s gravity pulls objects toward Earth.' },
      { question: 'Which action uses force?', options: ['pushing a door', 'thinking silently', 'seeing blue', 'hearing music'], correct_index: 0, explanation: 'Pushing a door applies force.' },
      { question: 'A heavier object usually has more...', options: ['mass', 'color', 'sound', 'alphabet'], correct_index: 0, explanation: 'Mass is the amount of matter in an object.' },
    ],
  },
  plants: {
    concept: 'Photosynthesis is the process by which green plants use sunlight, water, and carbon dioxide to make food.',
    objectives: ['Name photosynthesis inputs.', 'Explain the role of chlorophyll.', 'Describe why plants release oxygen.'],
    example: 'A leaf in sunlight makes sugar for the plant.',
    steps: ['The leaf takes in carbon dioxide.', 'Roots bring water to the plant.', 'Chlorophyll captures sunlight to make sugar and oxygen.'],
    answer: 'Plants make sugar and release oxygen.',
    keyPoints: ['Sunlight is the energy source.', 'Chlorophyll makes leaves green.', 'Plants are producers.'],
    facts: [
      { front: 'What is photosynthesis?', back: 'The process plants use to make food with sunlight.', hook: 'Photo means light.' },
      { front: 'Which gas do plants take in?', back: 'Carbon dioxide.', hook: 'CO2 goes in.' },
      { front: 'Which gas do plants release?', back: 'Oxygen.', hook: 'Oxygen comes out.' },
      { front: 'What is chlorophyll?', back: 'The green pigment that captures sunlight.', hook: 'Chlorophyll catches light.' },
      { front: 'Why are plants called producers?', back: 'They make their own food.', hook: 'Producers produce food.' },
    ],
    checks: [
      { question: 'Plants use sunlight to make food in...', options: ['evaporation', 'photosynthesis', 'friction', 'digestion'], correct_index: 1, explanation: 'Photosynthesis is how green plants make food.' },
      { question: 'Which gas do plants take in?', options: ['oxygen', 'carbon dioxide', 'helium', 'nitrogen only'], correct_index: 1, explanation: 'Plants take in carbon dioxide.' },
      { question: 'The green pigment in leaves is called...', options: ['chlorophyll', 'protein', 'salt', 'starch'], correct_index: 0, explanation: 'Chlorophyll captures sunlight.' },
      { question: 'Which plant part mostly captures sunlight?', options: ['leaf', 'root hair', 'seed coat', 'stem tip only'], correct_index: 0, explanation: 'Leaves are adapted to capture sunlight.' },
      { question: 'Photosynthesis mainly makes...', options: ['sugar', 'plastic', 'sand', 'iron'], correct_index: 0, explanation: 'Plants make glucose sugar as food.' },
    ],
  },
  matter: {
    concept: 'Matter is anything that has mass and takes up space. It commonly exists as solids, liquids, and gases.',
    objectives: ['Compare solids, liquids, and gases.', 'Describe melting and evaporation.', 'Identify examples of matter.'],
    example: 'Ice melts into liquid water.',
    steps: ['Ice is a solid with fixed shape.', 'Heat gives particles more energy.', 'The solid becomes liquid water.'],
    answer: 'Melting changes solid to liquid.',
    keyPoints: ['Solids keep shape.', 'Liquids flow and take container shape.', 'Gases spread out to fill space.'],
    facts: [
      { front: 'What is matter?', back: 'Anything with mass that takes up space.', hook: 'Matter has stuff and space.' },
      { front: 'Which state has fixed shape?', back: 'Solid.', hook: 'Solids stay shaped.' },
      { front: 'Which state flows?', back: 'Liquid.', hook: 'Liquids level and flow.' },
      { front: 'Which state spreads out?', back: 'Gas.', hook: 'Gases go everywhere.' },
      { front: 'What is melting?', back: 'A solid changing into a liquid.', hook: 'Melt means solid to liquid.' },
    ],
    checks: [
      { question: 'Which state of matter has a fixed shape?', options: ['solid', 'liquid', 'gas', 'steam'], correct_index: 0, explanation: 'Solids keep their shape.' },
      { question: 'Water vapor is a...', options: ['solid', 'liquid', 'gas', 'metal'], correct_index: 2, explanation: 'Water vapor is gas-state water.' },
      { question: 'Melting changes a solid into a...', options: ['liquid', 'gas only', 'shadow', 'sound'], correct_index: 0, explanation: 'Melting makes a liquid.' },
      { question: 'A liquid usually...', options: ['takes container shape', 'has no volume', 'is always invisible', 'cannot move'], correct_index: 0, explanation: 'Liquids take the shape of their container.' },
      { question: 'Matter must have...', options: ['mass and volume', 'only color', 'only sound', 'only smell'], correct_index: 0, explanation: 'Matter has mass and takes up space.' },
    ],
  },
  indus: {
    concept: 'The Indus Valley Civilization was an ancient urban civilization known for planned cities, drainage systems, trade, and craft work.',
    objectives: ['Locate major Indus cities.', 'Describe city planning.', 'Explain evidence from artifacts.'],
    example: 'Mohenjo-daro had streets laid out in a grid.',
    steps: ['Archaeologists studied ruins.', 'They found planned roads and drains.', 'These clues show organized city life.'],
    answer: 'The cities were carefully planned.',
    keyPoints: ['Harappa and Mohenjo-daro were major cities.', 'Drainage systems were advanced.', 'Seals suggest trade and administration.'],
    facts: [
      { front: 'Name two Indus cities.', back: 'Harappa and Mohenjo-daro.', hook: 'H and M are Indus names.' },
      { front: 'What were Indus cities famous for?', back: 'Planned streets and drainage.', hook: 'Indus cities were organized.' },
      { front: 'What is an artifact?', back: 'An object made or used by people in the past.', hook: 'Artifacts are history clues.' },
      { front: 'What did seals likely support?', back: 'Trade, identity, or administration.', hook: 'Seals stamped information.' },
      { front: 'What does archaeology study?', back: 'Past human life through remains.', hook: 'Archaeology reads objects.' },
    ],
    checks: [
      { question: 'Which civilization built cities like Harappa?', options: ['Indus Valley', 'Roman', 'Maya', 'Greek'], correct_index: 0, explanation: 'Harappa was an Indus Valley city.' },
      { question: 'Indus cities are known for advanced...', options: ['city planning', 'airplanes', 'printing presses', 'electric trains'], correct_index: 0, explanation: 'They had planned streets and drains.' },
      { question: 'Mohenjo-daro means...', options: ['Mound of the Dead', 'City of Gold', 'Forest Village', 'River Boat'], correct_index: 0, explanation: 'It is commonly translated as Mound of the Dead.' },
      { question: 'A seal is evidence of...', options: ['trade or identity', 'modern phones', 'space travel', 'electricity'], correct_index: 0, explanation: 'Seals may have marked goods or owners.' },
      { question: 'Archaeologists learn by studying...', options: ['artifacts', 'future news', 'weather only', 'computer games'], correct_index: 0, explanation: 'Artifacts help reconstruct the past.' },
    ],
  },
  maps: {
    concept: 'Maps represent places using symbols, directions, scale, and location clues. They help us understand where things are.',
    objectives: ['Read a map key.', 'Use cardinal directions.', 'Understand simple scale.'],
    example: 'A map says 1 cm equals 1 km.',
    steps: ['Measure 3 cm between two places.', 'Use the scale: 1 cm = 1 km.', 'The real distance is 3 km.'],
    answer: '3 km',
    keyPoints: ['A map key explains symbols.', 'North, south, east, and west are cardinal directions.', 'Scale compares map distance to real distance.'],
    facts: [
      { front: 'What is a map key?', back: 'A guide that explains map symbols.', hook: 'Key unlocks symbols.' },
      { front: 'What are cardinal directions?', back: 'North, south, east, and west.', hook: 'Never Eat Sour Watermelon.' },
      { front: 'What does map scale show?', back: 'How map distance compares to real distance.', hook: 'Scale shrinks distance.' },
      { front: 'What is a compass rose?', back: 'A symbol showing directions on a map.', hook: 'Compass rose points the way.' },
      { front: 'What is a landmark?', back: 'An easy-to-recognize place or feature.', hook: 'Landmarks help locate.' },
    ],
    checks: [
      { question: 'A map key helps us understand...', options: ['symbols on a map', 'a poem', 'a recipe', 'a clock'], correct_index: 0, explanation: 'A map key explains symbols.' },
      { question: 'North, south, east, and west are called...', options: ['directions', 'continents', 'seasons', 'fractions'], correct_index: 0, explanation: 'They are cardinal directions.' },
      { question: 'A map scale shows...', options: ['real distance', 'temperature', 'population only', 'grammar rules'], correct_index: 0, explanation: 'Scale connects map distance to real-world distance.' },
      { question: 'A compass rose shows...', options: ['directions', 'food', 'fractions', 'rainfall only'], correct_index: 0, explanation: 'A compass rose points to directions.' },
      { question: 'A landmark is useful because it is...', options: ['easy to recognize', 'always invisible', 'a type of verb', 'only a number'], correct_index: 0, explanation: 'Landmarks help people find places.' },
    ],
  },
  government: {
    concept: 'Local government helps communities solve shared problems, provide services, and make rules for safety and fairness.',
    objectives: ['Identify local services.', 'Explain voting and representation.', 'Connect rules to public good.'],
    example: 'A town repairs a damaged road.',
    steps: ['Citizens report the issue.', 'Local leaders plan repair work.', 'The road becomes safer for everyone.'],
    answer: 'Local government provides public services.',
    keyPoints: ['Local government handles nearby public needs.', 'Citizens can participate by voting.', 'Rules should protect fairness and safety.'],
    facts: [
      { front: 'What does local government manage?', back: 'Services like roads, water, waste, and community spaces.', hook: 'Local means nearby needs.' },
      { front: 'Why do people vote?', back: 'To choose representatives and influence decisions.', hook: 'Votes give voice.' },
      { front: 'What is a public service?', back: 'A service provided for community benefit.', hook: 'Public means for everyone.' },
      { front: 'Why are rules needed?', back: 'To keep communities safe and fair.', hook: 'Rules guide shared life.' },
      { front: 'What is a representative?', back: 'A person chosen to speak or decide for a group.', hook: 'Representatives represent people.' },
    ],
    checks: [
      { question: 'Local government usually helps manage...', options: ['roads and public services', 'planet orbits', 'fractions', 'storybook endings'], correct_index: 0, explanation: 'Local government manages nearby public services.' },
      { question: 'Voting is a way for citizens to...', options: ['choose representatives', 'measure angles', 'cook rice', 'make clouds'], correct_index: 0, explanation: 'Voting helps choose leaders.' },
      { question: 'A community rule is useful when it...', options: ['keeps people safe and fair', 'confuses everyone', 'stops learning', 'hides information'], correct_index: 0, explanation: 'Good rules protect safety and fairness.' },
      { question: 'Which is a public service?', options: ['street lighting', 'private diary', 'personal toy', 'secret password'], correct_index: 0, explanation: 'Street lighting benefits the community.' },
      { question: 'A representative is chosen to...', options: ['speak for people', 'erase maps', 'stop voting', 'hide laws'], correct_index: 0, explanation: 'Representatives make or discuss decisions for people.' },
    ],
  },
  tenses: {
    concept: 'Active voice focuses on the doer of an action. Passive voice focuses on the receiver of the action.',
    objectives: ['Identify active voice.', 'Identify passive voice.', 'Change sentence focus clearly.'],
    example: 'Change "Ravi kicked the ball" to passive voice.',
    steps: ['Find the receiver: the ball.', 'Move it to the subject position.', 'Use was + past participle: The ball was kicked by Ravi.'],
    answer: 'The ball was kicked by Ravi.',
    keyPoints: ['Active: doer + action + receiver.', 'Passive: receiver + be verb + past participle.', 'Use passive when the receiver matters more.'],
    facts: [
      { front: 'What does active voice focus on?', back: 'The doer of the action.', hook: 'Active actor acts.' },
      { front: 'What does passive voice focus on?', back: 'The receiver of the action.', hook: 'Passive receives.' },
      { front: 'What verb form appears in passive voice?', back: 'A be verb plus past participle.', hook: 'Be + done form.' },
      { front: 'Which is active: "Meera wrote a poem"?', back: 'Yes, Meera is doing the action.', hook: 'Doer first is active.' },
      { front: 'Why use passive voice?', back: 'To emphasize the action receiver or when the doer is unknown.', hook: 'Receiver gets spotlight.' },
    ],
    checks: [
      { question: 'In passive voice, the action receiver becomes the...', options: ['subject', 'comma', 'adverb only', 'title'], correct_index: 0, explanation: 'Passive voice often puts the receiver first.' },
      { question: 'Which sentence is active voice?', options: ['The ball was kicked by Ravi.', 'Ravi kicked the ball.', 'The ball was seen.', 'The book was read.'], correct_index: 1, explanation: 'Ravi is doing the action directly.' },
      { question: 'Passive voice often uses...', options: ['be + past participle', 'only nouns', 'only questions', 'future tense only'], correct_index: 0, explanation: 'Passive voice uses forms like was written.' },
      { question: 'Which sentence is passive?', options: ['The song was sung by Asha.', 'Asha sang the song.', 'Asha sings.', 'Sing loudly.'], correct_index: 0, explanation: 'The receiver "song" is first and uses was sung.' },
      { question: 'In "The cake was baked by Neha", the doer is...', options: ['Neha', 'cake', 'was', 'baked'], correct_index: 0, explanation: 'The phrase by Neha names the doer.' },
    ],
  },
  comprehension: {
    concept: 'Reading comprehension means understanding what a text says directly and what it suggests through clues.',
    objectives: ['Find main ideas.', 'Use supporting details.', 'Make simple inferences.'],
    example: 'A passage says clouds darkened and people opened umbrellas.',
    steps: ['Notice the clues: dark clouds and umbrellas.', 'Connect them to weather.', 'Infer that it may rain.'],
    answer: 'It may rain.',
    keyPoints: ['The main idea is what the text is mostly about.', 'Details support the main idea.', 'Inference uses clues plus what you know.'],
    facts: [
      { front: 'What is the main idea?', back: 'What a passage is mostly about.', hook: 'Main = most important.' },
      { front: 'What is a supporting detail?', back: 'A fact or example that explains the main idea.', hook: 'Details hold up ideas.' },
      { front: 'What is an inference?', back: 'A smart conclusion based on clues.', hook: 'Infer from clues.' },
      { front: 'Why reread?', back: 'To notice details you missed.', hook: 'Reread to reveal.' },
      { front: 'What is context?', back: 'The words and ideas around a word or event.', hook: 'Context surrounds.' },
    ],
    checks: [
      { question: 'The main idea of a passage is...', options: ['what it is mostly about', 'only the first word', 'the page number', 'a random detail'], correct_index: 0, explanation: 'The main idea is the central point.' },
      { question: 'A supporting detail should...', options: ['explain or prove the main idea', 'ignore the topic', 'replace the title', 'always be a question'], correct_index: 0, explanation: 'Details support the main idea.' },
      { question: 'To infer means to...', options: ['use clues to figure something out', 'copy every word', 'skip the passage', 'count letters'], correct_index: 0, explanation: 'Inference combines clues and knowledge.' },
      { question: 'Context clues help you find...', options: ['word meaning', 'shoe size', 'map scale only', 'phone battery'], correct_index: 0, explanation: 'Nearby words can reveal meaning.' },
      { question: 'If a character shivers and wears a coat, you may infer it is...', options: ['cold', 'loud', 'empty', 'square'], correct_index: 0, explanation: 'Shivering and coats are clues for cold weather.' },
    ],
  },
  writing: {
    concept: 'Creative writing uses clear structure, vivid details, and imagination to communicate ideas, stories, and feelings.',
    objectives: ['Write topic sentences.', 'Use sensory details.', 'Plan beginning, middle, and end.'],
    example: 'Improve: "The garden was nice."',
    steps: ['Add sight: bright flowers.', 'Add smell: fresh soil.', 'Write: The garden glowed with bright flowers and smelled of fresh soil.'],
    answer: 'Use specific sensory details.',
    keyPoints: ['A topic sentence guides a paragraph.', 'Sensory details help readers imagine.', 'Revision makes writing stronger.'],
    facts: [
      { front: 'What is a topic sentence?', back: 'A sentence that tells what a paragraph is about.', hook: 'Topic sentence leads.' },
      { front: 'What are sensory details?', back: 'Details about sight, sound, smell, taste, or touch.', hook: 'Five senses make scenes.' },
      { front: 'What is conflict in a story?', back: 'A problem characters try to solve.', hook: 'Conflict creates movement.' },
      { front: 'Why revise writing?', back: 'To make ideas clearer and stronger.', hook: 'Revision improves.' },
      { front: 'What is a setting?', back: 'Where and when a story happens.', hook: 'Setting sets the scene.' },
    ],
    checks: [
      { question: 'A strong paragraph usually begins with a...', options: ['topic sentence', 'shopping list', 'map scale', 'denominator'], correct_index: 0, explanation: 'A topic sentence introduces the paragraph idea.' },
      { question: 'Descriptive writing uses sensory details to help readers...', options: ['imagine the scene', 'solve equations only', 'ignore characters', 'avoid examples'], correct_index: 0, explanation: 'Sensory details make writing vivid.' },
      { question: 'A story conflict is important because it...', options: ['gives characters something to solve', 'removes the setting', 'ends every sentence', 'counts syllables'], correct_index: 0, explanation: 'Conflict gives the story purpose.' },
      { question: 'Which is a sensory detail?', options: ['sweet mango smell', 'paragraph number', 'only a comma', 'chapter title'], correct_index: 0, explanation: 'Smell is one of the senses.' },
      { question: 'Revision means...', options: ['improving a draft', 'never changing writing', 'throwing away ideas', 'only drawing'], correct_index: 0, explanation: 'Revision improves clarity and effect.' },
    ],
  },
  sandhi: {
    concept: 'Sandhi studies how sounds or words join and change. It helps learners split, read, and understand Kannada words accurately.',
    objectives: ['Understand sound joining.', 'Recognize simple word changes.', 'Use Sandhi to improve reading accuracy.'],
    example: 'Two words meet and a sound changes at the boundary.',
    steps: ['Find the two word parts.', 'Notice the ending and starting sounds.', 'Apply the sound-change rule to read the joined word.'],
    answer: 'Sounds can change when words join.',
    keyPoints: ['Sandhi means joining.', 'Sound changes happen at word boundaries.', 'Splitting joined words helps meaning.'],
    facts: [
      { front: 'What is Sandhi?', back: 'A grammar idea about sounds or words joining and changing.', hook: 'Sandhi joins sounds.' },
      { front: 'Why study Sandhi?', back: 'It improves reading and word splitting.', hook: 'Split to understand.' },
      { front: 'Where does Sandhi change happen?', back: 'At the boundary where sounds meet.', hook: 'Boundary changes.' },
      { front: 'What skill does Sandhi build?', back: 'Accurate reading and grammar awareness.', hook: 'Sandhi sharpens reading.' },
      { front: 'What should you look for first?', back: 'The two word parts being joined.', hook: 'Find the parts.' },
    ],
    checks: [
      { question: 'Sandhi is about how words or sounds...', options: ['join and change', 'become numbers', 'turn into maps', 'measure force'], correct_index: 0, explanation: 'Sandhi studies joining and sound changes.' },
      { question: 'Studying Sandhi improves...', options: ['grammar and reading accuracy', 'only drawing', 'only sports', 'weather prediction'], correct_index: 0, explanation: 'Sandhi helps reading and grammar.' },
      { question: 'When two sounds meet, Sandhi may cause a...', options: ['sound change', 'fraction sum', 'map scale', 'plant cell'], correct_index: 0, explanation: 'Sound changes are common when words join.' },
      { question: 'Sandhi changes often happen at...', options: ['word boundaries', 'map borders only', 'triangle centers', 'computer screens'], correct_index: 0, explanation: 'The boundary is where sounds meet.' },
      { question: 'To understand a joined word, first try to...', options: ['find its parts', 'ignore all sounds', 'count planets', 'draw a rectangle'], correct_index: 0, explanation: 'Splitting parts helps meaning.' },
    ],
  },
  'kannada-poetry': {
    concept: 'Kannada poetry uses rhythm, imagery, sound, and compact language to express feelings and ideas.',
    objectives: ['Notice imagery.', 'Hear rhythm.', 'Explain mood and meaning.'],
    example: 'A poem compares the moon to a silver lamp.',
    steps: ['Find the comparison.', 'Imagine the picture it creates.', 'Explain how it builds mood.'],
    answer: 'The image makes the moon feel bright and gentle.',
    keyPoints: ['Imagery creates pictures in the mind.', 'Rhythm gives lines a beat.', 'Poems often express feelings indirectly.'],
    facts: [
      { front: 'What is imagery?', back: 'Language that creates mental pictures.', hook: 'Imagery is image-making.' },
      { front: 'What is rhythm?', back: 'The beat or movement of lines.', hook: 'Rhythm has pulse.' },
      { front: 'What is mood?', back: 'The feeling a poem creates.', hook: 'Mood is poem feeling.' },
      { front: 'Why use comparison?', back: 'To make an idea vivid and memorable.', hook: 'Compare to clarify.' },
      { front: 'What should you read aloud for?', back: 'To hear sound, rhythm, and emphasis.', hook: 'Poetry likes voice.' },
    ],
    checks: [
      { question: 'Imagery in poetry helps readers...', options: ['picture ideas in the mind', 'solve only sums', 'find north', 'measure speed'], correct_index: 0, explanation: 'Imagery creates mental pictures.' },
      { question: 'Rhythm in a poem is connected to...', options: ['sound and beat', 'only maps', 'only coding', 'only decimals'], correct_index: 0, explanation: 'Rhythm is the beat of lines.' },
      { question: 'A poem can express...', options: ['feelings and ideas', 'only street names', 'only formulas', 'only commands'], correct_index: 0, explanation: 'Poetry often expresses feelings and ideas.' },
      { question: 'The mood of a poem means its...', options: ['feeling', 'page number', 'map key', 'denominator'], correct_index: 0, explanation: 'Mood is the feeling created.' },
      { question: 'Reading poetry aloud helps you hear...', options: ['rhythm', 'gravity', 'fractions', 'population'], correct_index: 0, explanation: 'Sound and rhythm are clearer aloud.' },
    ],
  },
  'kannada-grammar': {
    concept: 'Grammar gives structure to language. It helps us form clear Kannada sentences using nouns, verbs, order, and meaning.',
    objectives: ['Recognize nouns and verbs.', 'Build meaningful sentences.', 'Use grammar to improve clarity.'],
    example: 'Identify the action word in a sentence.',
    steps: ['Read the full sentence.', 'Ask what action is happening.', 'The word naming the action is the verb.'],
    answer: 'The action word is the verb.',
    keyPoints: ['Nouns name people, places, things, or ideas.', 'Verbs show action or state.', 'Sentence order helps meaning.'],
    facts: [
      { front: 'What does grammar do?', back: 'It organizes words into meaningful sentences.', hook: 'Grammar gives structure.' },
      { front: 'What is a noun?', back: 'A word that names a person, place, thing, or idea.', hook: 'Noun names.' },
      { front: 'What is a verb?', back: 'A word that shows action or state.', hook: 'Verb acts.' },
      { front: 'Why is word order important?', back: 'It helps the sentence make sense.', hook: 'Order carries meaning.' },
      { front: 'What is a sentence?', back: 'A group of words that expresses a complete idea.', hook: 'Sentence says a full thought.' },
    ],
    checks: [
      { question: 'Grammar helps us build sentences that are...', options: ['clear and meaningful', 'always silent', 'only numbers', 'without words'], correct_index: 0, explanation: 'Grammar makes sentence meaning clear.' },
      { question: 'A verb usually tells us about...', options: ['an action or state', 'only a color', 'only a map', 'a denominator'], correct_index: 0, explanation: 'Verbs describe actions or states.' },
      { question: 'A noun names a...', options: ['person, place, thing, or idea', 'force only', 'loop only', 'direction only'], correct_index: 0, explanation: 'Nouns are naming words.' },
      { question: 'A complete sentence should express...', options: ['a complete idea', 'only a sound', 'only a symbol', 'nothing'], correct_index: 0, explanation: 'Sentences communicate full thoughts.' },
      { question: 'Word order matters because it...', options: ['supports meaning', 'removes grammar', 'stops reading', 'changes matter state'], correct_index: 0, explanation: 'Word order helps readers understand.' },
    ],
  },
  'coding-basics': {
    concept: 'Coding is writing instructions a computer can follow. Clear sequences and debugging help programs work correctly.',
    objectives: ['Understand programs as instructions.', 'Use sequence.', 'Find and fix simple bugs.'],
    example: 'Give steps to make a sprite move forward then turn.',
    steps: ['Put move first.', 'Put turn second.', 'Run and check the order.'],
    answer: 'The program follows instructions in sequence.',
    keyPoints: ['A program is a list of instructions.', 'Computers follow exact steps.', 'Debugging fixes mistakes.'],
    facts: [
      { front: 'What is a program?', back: 'A set of instructions for a computer.', hook: 'Program = instructions.' },
      { front: 'What is sequence?', back: 'The order in which steps run.', hook: 'Sequence is step order.' },
      { front: 'What is debugging?', back: 'Finding and fixing mistakes in code.', hook: 'Debug means fix.' },
      { front: 'Why be precise in code?', back: 'Computers follow instructions exactly.', hook: 'Exact code, exact action.' },
      { front: 'What is an algorithm?', back: 'A step-by-step plan to solve a problem.', hook: 'Algorithm is a recipe.' },
    ],
    checks: [
      { question: 'A program is a set of...', options: ['instructions', 'clouds', 'triangles only', 'story titles'], correct_index: 0, explanation: 'Programs are instructions computers follow.' },
      { question: 'The order of commands in code is called a...', options: ['sequence', 'fraction', 'continent', 'chlorophyll'], correct_index: 0, explanation: 'Sequence is step-by-step order.' },
      { question: 'Debugging means...', options: ['finding and fixing mistakes', 'deleting learning', 'drawing maps only', 'adding gravity'], correct_index: 0, explanation: 'Debugging fixes code problems.' },
      { question: 'An algorithm is...', options: ['a step-by-step plan', 'a plant pigment', 'a map symbol', 'a poem mood'], correct_index: 0, explanation: 'Algorithms are plans for solving problems.' },
      { question: 'Computers follow instructions...', options: ['exactly', 'emotionally', 'randomly always', 'only on paper'], correct_index: 0, explanation: 'Code must be precise because computers follow exact instructions.' },
    ],
  },
  'logic-loops': {
    concept: 'Logic helps programs make decisions. Loops let programs repeat steps efficiently until a condition or count is met.',
    objectives: ['Use if statements.', 'Understand conditions.', 'Explain loops.'],
    example: 'Repeat "jump" 5 times.',
    steps: ['Choose the action: jump.', 'Set the repeat count to 5.', 'Run the loop until all repeats finish.'],
    answer: 'A loop repeats the action 5 times.',
    keyPoints: ['Conditions are true or false.', 'If statements choose actions.', 'Loops reduce repeated code.'],
    facts: [
      { front: 'What is a loop?', back: 'A structure that repeats steps.', hook: 'Loop repeats.' },
      { front: 'What is a condition?', back: 'A statement that can be true or false.', hook: 'Condition asks yes/no.' },
      { front: 'What does if do?', back: 'It runs code when a condition is true.', hook: 'If decides.' },
      { front: 'Why use loops?', back: 'To avoid writing the same steps many times.', hook: 'Loop saves repetition.' },
      { front: 'What is logic in coding?', back: 'Rules for decisions and problem solving.', hook: 'Logic guides choices.' },
    ],
    checks: [
      { question: 'A loop is used to...', options: ['repeat steps', 'stop all code', 'make water', 'measure angles only'], correct_index: 0, explanation: 'Loops repeat instructions.' },
      { question: 'An if statement helps a program...', options: ['make a decision', 'draw a map key', 'melt ice only', 'read poetry only'], correct_index: 0, explanation: 'If statements choose based on conditions.' },
      { question: 'Which is a condition?', options: ['score > 10', 'blue', 'triangle', 'chapter'], correct_index: 0, explanation: 'score > 10 can be true or false.' },
      { question: 'A condition must evaluate to...', options: ['true or false', 'north or south only', 'solid only', 'a poem'], correct_index: 0, explanation: 'Conditions are boolean ideas.' },
      { question: 'Loops help code become...', options: ['shorter and reusable', 'less logical', 'only decorative', 'impossible to run'], correct_index: 0, explanation: 'Loops avoid repeated lines.' },
    ],
  },
  'build-an-app': {
    concept: 'App building starts with a user need, then turns it into screens, buttons, data, and interactions that can be tested.',
    objectives: ['Plan screens.', 'Connect buttons to actions.', 'Use prototypes to test ideas.'],
    example: 'Plan a homework reminder app.',
    steps: ['Create a home screen with tasks.', 'Add a button to create a reminder.', 'Test whether users can add a task easily.'],
    answer: 'A useful app starts with a clear user flow.',
    keyPoints: ['Screens organize tasks.', 'Buttons trigger actions.', 'Prototypes help test before final building.'],
    facts: [
      { front: 'What is a screen layout?', back: 'The arrangement of content and controls on a screen.', hook: 'Layout places things.' },
      { front: 'What does a button do?', back: 'It lets the user perform an action.', hook: 'Button triggers action.' },
      { front: 'What is a prototype?', back: 'An early test version of an idea.', hook: 'Prototype previews.' },
      { front: 'What is user flow?', back: 'The path a user follows to complete a task.', hook: 'Flow is the path.' },
      { front: 'Why test an app?', back: 'To find confusing parts and improve them.', hook: 'Test before final.' },
    ],
    checks: [
      { question: 'A button in an app usually lets the user...', options: ['perform an action', 'change gravity', 'become a gas', 'erase the screen permanently'], correct_index: 0, explanation: 'Buttons trigger actions.' },
      { question: 'A screen layout decides...', options: ['where content and controls appear', 'the weather', 'the LCM', 'plant food'], correct_index: 0, explanation: 'Layout organizes the screen.' },
      { question: 'A prototype helps you...', options: ['test an idea early', 'skip all planning', 'remove users', 'hide buttons'], correct_index: 0, explanation: 'Prototypes help test and improve ideas.' },
      { question: 'User flow means...', options: ['steps a user follows', 'water in a pipe only', 'a grammar rule', 'a map scale'], correct_index: 0, explanation: 'User flow is the path through a task.' },
      { question: 'Testing an app helps find...', options: ['confusing parts', 'only colors', 'plant cells', 'denominators'], correct_index: 0, explanation: 'Testing reveals what to improve.' },
    ],
  },
};

const genericWrongOptions = ['A map symbol', 'Only a color', 'A random number'];

function getTopicTitle(topicId: string): string {
  for (const topics of Object.values(TOPICS_BY_SUBJECT)) {
    const found = topics.find((topic) => topic.id === topicId);
    if (found) return found.title.en;
  }
  return 'Fractions & Decimals';
}

function makeQuestion(topicId: string, index: number, check: CheckItem): Question {
  return {
    id: `${topicId}-q${index}`,
    question: text(check.question),
    options: options(check.options),
    correct_index: check.correct_index,
    explanation: text(check.explanation),
  };
}

function factQuestion(topicId: string, fact: FactItem, index: number): Question {
  const correct = fact.back;
  const wrong = genericWrongOptions.filter((item) => item !== correct).slice(0, 3);
  return {
    id: `${topicId}-fq${index}`,
    question: text(fact.front),
    options: options([correct, ...wrong]),
    correct_index: 0,
    explanation: text(fact.back),
  };
}

export function getQuizQuestions(topicId: string): Question[] {
  const blueprint = BLUEPRINTS[topicId] || BLUEPRINTS.fractions;
  const checks = blueprint.checks.map((check, index) => makeQuestion(topicId, index + 1, check));
  const factChecks = blueprint.facts.map((fact, index) => factQuestion(topicId, fact, index + 1));
  return [...checks, ...factChecks];
}

export function getFlashcards(topicId: string): FlashcardItem[] {
  const blueprint = BLUEPRINTS[topicId] || BLUEPRINTS.fractions;
  const factCards = blueprint.facts.map((fact, index) => ({
    id: `${topicId}-fc${index + 1}`,
    front: text(fact.front),
    back: text(fact.back),
    memory_hook: text(fact.hook),
  }));
  const quizCards = blueprint.checks.map((check, index) => ({
    id: `${topicId}-qfc${index + 1}`,
    front: text(check.question),
    back: text(check.explanation),
    memory_hook: text(`Answer: ${check.options[check.correct_index]}`),
  }));
  return [...factCards, ...quizCards];
}

export function getLessonContent(topicId: string): LessonContent {
  const blueprint = BLUEPRINTS[topicId] || BLUEPRINTS.fractions;
  const title = getTopicTitle(topicId);
  return {
    topic_id: topicId,
    title: text(title),
    learning_objectives: blueprint.objectives,
    estimated_minutes: 10,
    base_story_template: text(`{{STUDENT_NAME}} is learning at the {{INTEREST_PLACE}}. Today's goal is ${title}: ${blueprint.concept}`),
    concept_explanation: text(blueprint.concept),
    worked_example: {
      problem: blueprint.example,
      steps: {
        en: blueprint.steps,
        hi: blueprint.steps,
        kn: blueprint.steps,
      },
      answer: blueprint.answer,
    },
    key_points: {
      en: blueprint.keyPoints,
      hi: blueprint.keyPoints,
      kn: blueprint.keyPoints,
    },
    interest_placeholders: {
      INTEREST_PLACE: {
        space: text('space shuttle study desk'),
        nature: text('green forest camp'),
        robots: text('robotics lab table'),
        history: text('museum learning corner'),
        sports: text('cricket practice ground'),
        stories: text('storytelling room'),
        default: text('school classroom'),
      },
    },
    diagram: {
      source: `https://picsum.photos/seed/${topicId}/360/240`,
      caption: `Visual guide for ${title}`,
      description: blueprint.concept,
    },
  };
}

export const QUIZ_BANK: Record<string, Question[]> = Object.fromEntries(
  Object.values(TOPICS_BY_SUBJECT)
    .flat()
    .map((topic) => [topic.id, getQuizQuestions(topic.id)])
);

export const FLASHCARD_BANK: Record<string, FlashcardItem[]> = Object.fromEntries(
  Object.values(TOPICS_BY_SUBJECT)
    .flat()
    .map((topic) => [topic.id, getFlashcards(topic.id)])
);

export function getTopicSubject(topicId: string): string {
  for (const [subjectId, topics] of Object.entries(TOPICS_BY_SUBJECT)) {
    if (topics.some((topic) => topic.id === topicId)) {
      return subjectId;
    }
  }
  return 'math';
}
