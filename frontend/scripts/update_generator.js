const fs = require('fs');
const path = require('path');

const targetFile = path.resolve(__dirname, 'seed_curriculum.js');

const codeToInject = `
function getTopicSpecificData(grade, subject, chapter) {
  const title = chapter.title;
  const titleHi = chapter.titleHi;
  const titleKn = chapter.titleKn;
  const lowerTitle = title.toLowerCase();

  // 1. Photosynthesis / Nutrition in Plants
  if (lowerTitle.includes('nutrition in plants') || lowerTitle.includes('photosynthesis') || lowerTitle.includes('know plants') || lowerTitle.includes('plant')) {
    return {
      conceptEn: "Photosynthesis is the process by which green plants prepare their own food. Using chlorophyll, leaves capture sunlight and convert carbon dioxide and water into glucose (food) and oxygen.",
      conceptHi: "\\u092a\\u094d\\u0930\\u0915\\u093e\\u0936 \\u0938\\u0902\\u0936\\u094d\\u0932\\u0947\\u0937\\u0923 \\u0935\\u0939 \\u092a\\u094d\\u0930\\u0915\\u094d\\u0930\\u093f\\u092f\\u093e \\u0939\\u0948 \\u091c\\u093f\\u0938\\u0915\\u0947 \\u0926\\u094d\\u0935\\u093e\\u0930\\u093e \\u0939\\u0930\\u0947 \\u092a\\u094c\\u0927\\u0947 \\u0905\\u092a\\u0928\\u093e \\u092d\\u094b\\u091c\\u0928 \\u0938\\u094d\\u0935\\u092f\\u0902 \\u092c\\u0928\\u093e\\u0924\\u0947 \\u0939\\u0948\\u0902\\u0965",
      conceptKn: "\\u0ca6\\u0ccd\\u0caf\\u0cc1\\u0ca4\\u0cbf\\u0cb8\\u0c82\\u0cb6\\u0ccd\\u0cb2\\u0cc7\\u0cb7\\u0ca3\\u0cc6\\u0caf\\u0cc1 \\u0cb9\\u0cb8\\u0cbf\\u0cb0\\u0cc1 \\u0cb8\\u0cb8\\u0ccd\\u0caf\\u0c97\\u0cb3\\u0cc1 \\u0ca4\\u0cae\\u0ccd\\u0cae\\u0ca6\\u0cc7 \\u0c86\\u0cb9\\u0cbe\\u0cb0\\u0cb5\\u0ca8\\u0ccd\\u0ca8\\u0cc1 \\u0ca4\\u0caf\\u0cbe\\u0cb0\\u0cbf\\u0cb8\\u0cc1\\u0cb5 \\u0caa\\u0ccd\\u0cb0\\u0c95\\u0ccd\\u0cb0\\u0cbf\\u0caf\\u0cc6\\u0caf\\u0cbe\\u0c97\\u0cbf\\u0ca6\\u0cc6.",
      objectives: ["Understand the role of chlorophyll and sunlight", "Write the chemical equation for photosynthesis", "Explain how water and nutrients are absorbed by roots"],
      problem: "Identify the inputs and outputs of photosynthesis.",
      steps: {
        en: ["Step 1: Leaves absorb carbon dioxide from the air and water from the soil.", "Step 2: Chlorophyll traps sunlight energy inside the plant cells.", "Step 3: Carbon dioxide and water combine to form glucose, releasing oxygen."],
        hi: ["\\u091a\\u0930\\u0923 1: \\u092a\\u0924\\u094d\\u0924\\u093f\\u092f\\u093e\\u0901 \\u0939\\u0935\\u093e \\u0938\\u0947 \\u0915\\u093e\\u0930\\u094d\\u092c\\u0928 \\u0921\\u093e\\u0907\\u0915\\u094d\\u0938\\u093e\\u0907\\u0921 \\u0914\\u0930 \\u092e\\u093f\\u091f\\u094d\\u091f\\u0940 \\u0938\\u0947 \\u092a\\u093e\\u0928\\u0940 \\u0905\\u0935\\u0936\\u094b\\u0937\\u093f\\u0924 \\u0915\\u0930\\u0924\\u0940 \\u0939\\u0948\\u0902\\u0965", "\\u091a\\u0930\\u0923 2: \\u0915\\u094d\\u0932\\u094b\\u0930\\u094b\\u092b\\u093f\\u0932 \\u092a\\u094c\\u0927\\u0947 \\u0915\\u0940 \\u0915\\u094b\\u0936\\u093f\\u0915\\u093e\\u0913\\u0902 \\u0915\\u0947 \\u092d\\u0940\\u0924\\u0930 \\u0938\\u0942\\u0930\\u094d\\u092f \\u0915\\u0947 \\u092a\\u094d\\u0930\\u0915\\u093e\\u0936 \\u0915\\u0940 \\u090a\\u0930\\u094d\\u091c\\u093e \\u0915\\u094b \\u092a\\u0915\\u0921\\u093c\\u0924\\u093e \\u0939\\u0948\\u0965", "\\u091a\\u0930\\u0923 3: \\u0915\\u093e\\u0930\\u094d\\u092c\\u0928 \\u0921\\u093e\\u0907\\u0915\\u094d\\u0938\\u093e\\u0907\\u0921 \\u0914\\u0930 \\u092a\\u093e\\u0928\\u0940 \\u092e\\u093f\\u0932\\u0915\\u0930 \\u0917\\u094d\\u0932\\u0942\\u0915\\u094b\\u091c \\u092c\\u0928\\u093e\\u0924\\u0947 \\u0939\\u0948\\u0902 \\u0914\\u0930 \\u0915\\u094d\\u0938\\u0940\\u091c\\u0928 \\u091b\\u094b\\u0921\\u093c\\u0924\\u0947 \\u0939\\u0948\\u0902\\u0965"],
        kn: ["\\u0cb9\\u0c82\\u0ca4 1: \\u0c8e\\u0cb2\\u0cc6\\u0c97\\u0cb3\\u0cc1 \\u0c97\\u0cbe\\u0cb3\\u0cbf\\u0caf\\u0cbf\\u0c82\\u0ca6 \\u0c87\\u0c82\\u0c97\\u0cbe\\u0cb2\\u0ca6 \\u0ca1\\u0cc8\\u0c82\\u0c95\\u0ccd\\u0cb8\\u0cc8\\u0ca1\\u0ccd \\u0cae\\u0ca4\\u0ccd\\u0ca4\\u0cc1 \\u0cae\\u0ca3\\u0ccd\\u0ca3\\u0cbf\\u0ca8\\u0cbf\\u0c82\\u0ca6 \\u0ca8\\u0cc0\\u0cb0\\u0ca8\\u0ccd\\u0ca8\\u0cc1 \\u0cb9\\u0cc0\\u0cb0\\u0cbf\\u0c95\\u0cca\\u0cb3\\u0ccd\\u0cb3\\u0cc1\\u0ca4\\u0ccd\\u0ca4\\u0cb5\\u0cc6.", "\\u0cb9\\u0c82\\u0ca4 2: \\u0cb9\\u0cb0\\u0cbf\\u0ca4\\u0ccd\\u0ca4\\u0cc1 \\u0cb8\\u0cb8\\u0ccd\\u0caf\\u0ca6 \\u0c9c\\u0cc0\\u0cb5\\u0c95\\u0ccb\\u0cb6\\u0c97\\u0cb3\\u0cca\\u0cb3\\u0c97\\u0cc6 \\u0cb8\\u0cc2\\u0cb0\\u0ccd\\u0caf\\u0ca8 \\u0cac\\u0cc6\\u0cb3\\u0c95\\u0cbf\\u0ca8 \\u0cb8\\u0cbe\\u0cae\\u0cb0\\u0ccd\\u0ca5\\u0ccd\\u0ca5\\u0caf\\u0ca8\\u0ccd\\u0ca8\\u0cc1 \\u0cb9\\u0cc0\\u0cb0\\u0cc1\\u0ca4\\u0ccd\\u0ca4\\u0ca6\\u0cc6.", "\\u0cb9\\u0c82\\u0ca4 3: \\u0c87\\u0c82\\u0c97\\u0cbe\\u0cb2\\u0ca6 \\u0ca1\\u0cc8\\u0c82\\u0c95\\u0ccd\\u0cb8\\u0cc8\\u0ca1\\u0ccd \\u0cae\\u0ca4\\u0ccd\\u0ca8\\u0cc0\\u0cb0\\u0cc1 \\u0cb8\\u0cc7\\u0cb0\\u0cbf \\u0c97\\u0ccd\\u0cb2\\u0cc1\\u0c95\\u0ccb\\u0cb8\\u0ccd \\u0cae\\u0cbe\\u0ca1\\u0cbf \\u0c86\\u0cae\\u0ccd\\u0cb2\\u0c9c\\u0ca8\\u0c95\\u0cb5\\u0ca8\\u0ccd\\u0ca8\\u0cc1 \\u0cac\\u0cbf\\u0ca1\\u0cc1\\u0c97\\u0ca1\\u0cc6 \\u0cae\\u0cbe\\u0ca1\\u0cc1\\u0ca4\\u0ccd\\u0ca4\\u0cb5\\u0cc6."]
      },
      answer: "Carbon Dioxide + Water + Sunlight -> Glucose + Oxygen",
      keyPoints: {
        en: ["Chlorophyll is the green pigment that absorbs light energy.", "Stomata are tiny pores on leaves that allow gas exchange.", "Oxygen released during photosynthesis supports life on Earth."],
        hi: ["\\u0915\\u094d\\u0932\\u094b\\u0930\\u094b\\u092f\\u092b\\u093f\\u0932 \\u0935\\u0939 \\u0939\\u0930\\u093e \\u0935\\u0930\\u094d\\u0923\\u0915 \\u0939\\u0948 \\u091c\\u094b \\u092a\\u094d\\u0930\\u0915\\u093e\\u0936 \\u090a\\u0930\\u094d\\u091c\\u093e \\u0915\\u094b \\u0938\\u094b\\u0916\\u0924\\u093e \\u0939\\u0948\\u0965", "\\u0930\\u0902\\u0927\\u094d\\u0930 (Stomata) \\u092a\\u0924\\u094d\\u0924\\u093f\\u092f\\u094b\\u0902 \\u092a\\u0930 \\u091b\\u094b\\u091f\\u0947 \\u091b\\u093f\\u0926\\u094d\\u0930 \\u0939\\u094b\\u0924\\u093e \\u0939\\u0948\\u0902\\u0965", "\\u092a\\u094d\\u0930\\u0915\\u093e\\u0936 \\u0938\\u0902\\u0936\\u094d\\u0932\\u0947\\u0937\\u0923 \\u0915\\u0947 \\u0926\\u094c\\u0930\\u093e\\u0928 \\u092e\\u0941\\u0915\\u094d\\u0924 \\u0915\\u094d\\u0938\\u0940\\u091c\\u0928 \\u091c\\u0940\\u0935\\u0928 \\u0915\\u093e \\u0906\\u0927\\u093e\\u0930 \\u0939\\u0948\\u0965"],
        kn: ["\\u0cb9\\u0cb0\\u0cbf\\u0ca4\\u0ccd\\u0ca4\\u0cc1 \\u0cac\\u0cc6\\u0cb3\\u0c95\\u0cbf\\u0ca8 \\u0cb6\\u0c95\\u0ccd\\u0ca4\\u0cbf\\u0ca5\\u0ca8\\u0ccd\\u0ca8\\u0cc1 \\u0cb9\\u0cc0\\u0cb0\\u0cc1\\u0cb5 \\u0cb9\\u0cb8\\u0cbf\\u0cb0\\u0cc1 \\u0cb5\\u0cb0\\u0ccd\\u0ca3\\u0c95\\u0cb5\\u0cbe\\u0c97\\u0cbf\\u0ca6\\u0cc6.", "\\u0caa\\u0ca4\\u0ccd\\u0cb0\\u0cb0\\u0c82\\u0c27\\u0ccd\\u0cb0\\u0c97\\u0cb3\\u0cc1 (Stomata) \\u0c8e\\u0cb2\\u0cc6\\u0c97\\u0cb3 \\u0cae\\u0cc7\\u0cb2\\u0cbf\\u0ca8 \\u0cb8\\u0ca3\\u0ccd\\u0ca3 \\u0cb0\\u0c82\\u0ca7\\u0ccd\\u0cb0\\u0c97\\u0cb3\\u0cc1.", "\\u0ca6\\u0ccd\\u0caf\\u0cc1\\u0ca4\\u0cbf\\u0cb8\\u0c82\\u0cb6\\u0ccd\\u0cb2\\u0cc7\\u0cb7\\u0ca3\\u0cc6\\u0caf \\u0cb8\\u0cae\\u0caf\\u0ca6\\u0cb2\\u0ccd\\u0cb2\\u0cbf \\u0cac\\u0cbf\\u0ca1\\u0cc1\\u0c97\\u0ca1\\u0cc6\\u0caf\\u0cbe\\u0c97\\u0cc1\\u0cb5 \\u0c86\\u0cae\\u0ccd\\u0cb2\\u0c9c\\u0ca8\\u0c95 \\u0caa\\u0ccd\\u0cb0\\u0cbe\\u0ca3\\u0cb5\\u0cbe\\u0caf\\u0cc1\\u0cb5\\u0cbe\\u0c97\\u0cbf\\u0ca6\\u0cc6."]
      },
      facts: [
        { front: "What is chlorophyll?", back: "A green pigment in plants that absorbs light energy.", hook: "Green pigment = light absorber." },
        { front: "Where does carbon dioxide enter the leaf?", back: "Through tiny pores called stomata.", hook: "Stomata = leaf gates." }
      ],
      checks: [
        {
          question: "Which of the following is essential for photosynthesis to capture energy?",
          options: ["Chlorophyll", "Nitrogen", "Oxygen", "Iron"],
          correct_index: 0,
          explanation: "Chlorophyll is the green pigment in leaves that absorbs sunlight energy."
        },
        {
          question: "What gas do plants absorb from the atmosphere for photosynthesis?",
          options: ["Carbon Dioxide", "Oxygen", "Hydrogen", "Helium"],
          correct_index: 0,
          explanation: "Plants take in carbon dioxide through stomata to produce glucose."
        }
      ]
    };
  }

  // 2. Fractions and Decimals
  if (lowerTitle.includes('fraction') || lowerTitle.includes('decimal') || lowerTitle.includes('rational')) {
    return {
      conceptEn: "Fractions represent parts of a whole, consisting of a numerator (top) and denominator (bottom). Unlike fractions have different denominators and require finding the Least Common Multiple (LCM) before adding or subtracting.",
      conceptHi: "\\u092d\\u093f\\u0928\\u094d\\u0928 \\u090f\\u0915 \\u0938\\u0902\\u092a\\u0942\\u0930\\u094d\\u0923 \\u0915\\u0947 \\u092d\\u093e\\u0917\\u094b\\u0902 \\u0915\\u094b \\u0926\\u0930\\u094d\\u0936\\u093e\\u0924\\u0940 \\u0939\\u0948, \\u091c\\u093f\\u0938\\u092e\\u0947\\u0902 \\u090f\\u0915 \\u0905\\u0902\\u0936 (\\u090a\\u092a\\u0930) \\u0914\\u0930 \\u0939\\u0930 (\\u0928\\u0940\\u091a\\u0947) \\u0939\\u094b\\u0924\\u093e \\u0939\\u0948\\u0965",
      conceptKn: "\\u0cad\\u0cbf\\u0ca8\\u0ccd\\u0ca8\\u0cb0\\u0cbe\\u0cb6\\u0cbf\\u0c97\\u0cb3\\u0cc1 \\u0c92\\u0c82\\u0ca6\\u0cc1 \\u0caa\\u0cc2\\u0cb0\\u0ccd\\u0ca3 \\u0cb5\\u0cb8\\u0ccd\\u0ca4\\u0cc1\\u0cb5\\u0cbf\\u0ca8 \\u0cad\\u0cbe\\u0c97\\u0c97\\u0cb3\\u0ca8\\u0ccd\\u0ca8\\u0cc1 \\u0caa\\u0ccd\\u0cb0\\u0ca4\\u0cbf\\u0ca8\\u0cbf\\u0ca7\\u0cbf\\u0cb8\\u0cc1\\u0ca4\\u0ccd\\u0ca4\\u0cb5\\u0cc6.",
      objectives: ["Identify numerators and denominators", "Convert unlike fractions to equivalent like fractions using LCM", "Add and subtract fractions and convert to decimals"],
      problem: "Calculate 1/3 + 2/5 = ?",
      steps: {
        en: ["Step 1: Find the LCM of denominators 3 and 5, which is 15.", "Step 2: Convert fractions: 1/3 becomes 5/15, and 2/5 becomes 6/15.", "Step 3: Add the numerators: 5/15 + 6/15 = 11/15."],
        hi: ["\\u091a\\u0930\\u0923 1: \\u0939\\u0930\\u094b\\u0902 3 \\u0914\\u0930 5 \\u0915\\u093e LCM \\u091c\\u094d\\u091e\\u093e\\u0924 \\u0915\\u0930\\u0947\\u0902, \\u091c\\u094b \\u0915\\u093f 15 \\u0939\\u0948\\u0965", "\\u091a\\u0930\\u0923 2: \\u092d\\u093f\\u0928\\u094d\\u0928\\u094b\\u0902 \\u0915\\u094b \\u092c\\u0926\\u0932\\u0915\\u0930 5/15 \\u0939\\u094b \\u091c\\u093e\\u0924\\u093e \\u0939\\u0948, \\u0914\\u0930 2/5 \\u092c\\u0926\\u0932\\u0915\\u0930 6/15 \\u0939\\u094b \\u091c\\u093e\\u0924\\u093e \\u0939\\u0948\\u0965", "\\u091a\\u0930\\u0923 3: \\u0905\\u0902\\u0936\\u094b\\u0902 \\u0915\\u094b \\u091c\\u094b\\u0921\\u093c\\u0947\\u0902: 5/15 + 6/15 = 11/15\\u0965"],
        kn: ["\\u0cb9\\u0c82\\u0ca4 1: \\u0c9b\\u0cc7\\u0ca6\\u0c97\\u0cb3\\u0cbe\\u0ca6 3 \\u0cae\\u0ca4\\u0ccd\\u0ca4\\u0cc1 5 \\u0cb0 \\u0cb2\\u0cb8\\u0cbe\\u0c85 \\u0c95\\u0c82\\u0ca1\\u0cc1\\u0cb9\\u0cbf\\u0ca1\\u0cbf\\u0caf\\u0cbf\\u0cb0\\u0cbf, \\u0c85\\u0ca6\\u0cc1 15 \\u0c86\\u0c97\\u0cbf\\u0ca6\\u0cc6.", "\\u0cb9\\u0c82\\u0ca4 2: \\u0cad\\u0cbf\\u0ca8\\u0ccd\\u0ca8\\u0cb0\\u0cbe\\u0cb6\\u0cbf\\u0c97\\u0cb3\\u0ca8\\u0ccd\\u0ca8\\u0cc1 \\u0caa\\u0cb0\\u0cbbf\\u0cb5\\u0cb0\\u0ccd\\u0ca4\\u0cbf\\u0cb8\\u0cbf: 1/3 \\u0c87\\u0ca6\\u0cc1 5/15 \\u0c86\\u0c97\\u0cc1\\u0ca4\\u0ccd\\u0ca4\\u0ca6\\u0cc6, \\u0cae\\u0ca4\\u0ccd\\u0ca4\\u0cc1 2/5 \\u0c87\\u0ca6\\u0cc1 6/15 \\u0c86\\u0c97\\u0cc1\\u0ca4\\u0ccd\\u0ca4\\u0ca6\\u0cc6.", "\\u0cb9\\u0c82\\u0ca4 3: \\u0c85\\u0cb5\\u0ca8\\u0ccd\\u0ca8\\u0cc1 \\u0c9b\\u0cc7\\u0ca6\\u0ca6\\u0cbf\\u0c82\\u0ca6 \\u0cad\\u0cbe\\u0c97\\u0cbf\\u0cb8\\u0cc1\\u0cb5 \\u0cae\\u0cc1\\u0cb2\\u0c95 \\u0cad\\u0cbf\\u0ca8\\u0ccd\\u0ca8\\u0cb0\\u0cbe\\u0cb6\\u0cbf\\u0caf\\u0ca8\\u0ccd\\u0ca8\\u0cc1 \\u0ca6\\u0cb6\\u0cae\\u0cbe\\u0c82\\u0cb6\\u0c95\\u0ccd\\u0c95\\u0cc6 \\u0caa\\u0cb0\\u0cbbf\\u0cb5\\u0cb0\\u0ccd\\u0ca4\\u0cbf\\u0cb8\\u0cac\\u0cb9\\u0cc1\\u0ca6\\u0cc1."]
      },
      answer: "11/15",
      keyPoints: {
        en: ["Never add the denominators together.", "LCM is the smallest multiple shared by two numbers.", "Fractions can be converted to decimals by dividing numerator by denominator."],
        hi: ["\\u0939\\u0930\\u094b\\u0902 \\u0915\\u094b \\u0915\\u092d\\u0940 \\u092d\\u0940 \\u0906\\u092a\\u0938 \\u092e\\u0947\\u0902 \\u0928 \\u091c\\u094b\\u0921\\u093c\\u0947\\u0902\\u0965", "LCM \\u0926\\u094b \\u0938\\u0902\\u0916\\u094d\\u092f\\u093e\\u0913\\u0902 \\u0926\\u094d\\u0935\\u093e\\u0930\\u093e \\u0938\\u093e\\u091c\\u094d\\u0939\\u093e \\u0915\\u093f\\u092f\\u093e \\u0917\\u092f\\u093e \\u0938\\u092c\\u0938\\u0947 \\u091b\\u094b\\u091f\\u093e \\u0917\\u0941\\u0923\\u091c \\u0939\\u0948\\u0965", "\\u092d\\u093f\\u0928\\u094d\\u0928\\u094b\\u0902 \\u0915\\u094b \\u0926\\u0936\\u092e\\u0932\\u0935 \\u092e\\u0947\\u0902 \\u092c\\u0926\\u0932\\u0928\\u0947 \\u0915\\u0947 \\u0932\\u093f\\u090f \\u0905\\u0902\\u0936 \\u0915\\u094b \\u0939\\u0930 \\u0938\\u0947 \\u092d\\u093e\\u0917 \\u0926\\u093f\\u092f\\u093e \\u091c\\u093e\\u0924\\u093e \\u0939\\u0948\\u0965"],
        kn: ["\\u0c9b\\u0cc7\\u0ca6\\u0c97\\u0cb3\\u0ca8\\u0ccd\\u0ca8\\u0cc1 \\u0c95\\u0cc2\\u0ca1\\u0cac\\u0cc7\\u0ca1\\u0cbf.", "\\u0cb2\\u0cb8\\u0cbe\\u0c85 \\u0cae\\u0cc2\\u0cb2\\u0c95 \\u0cb9\\u0ccb\\u0cb2\\u0cbf\\u0cb8\\u0cac\\u0cb9\\u0cc1\\u0ca6\\u0cc1.", "\\u0cad\\u0cbf\\u0ca8\\u0ccd\\u0ca8\\u0cb0\\u0cbe\\u0cb6\\u0cbf\\u0caf\\u0ca8\\u0ccd\\u0ca8\\u0cc1 \\u0ca6\\u0cb6\\u0cae\\u0cbe\\u0c82\\u0cae\\u0ccd\\u0c95\\u0ccd\\u0c95\\u0cc6 \\u0caa\\u0cb0\\u0cbbf\\u0cb5\\u0cb0\\u0ccd\\u0ca4\\u0cbf\\u0cb8\\u0cac\\u0cb9\\u0cc1\\u0ca6\\u0cc1."]
      },
      facts: [
        { front: "What represents the bottom part of a fraction?", back: "The denominator, which shows the total equal parts.", hook: "Denominator = Down." },
        { front: "How do you add unlike fractions?", back: "Find the LCM, convert to like fractions, then add numerators.", hook: "LCM first, then add." }
      ],
      checks: [
        {
          question: "What is the Least Common Multiple (LCM) of 4 and 6?",
          options: ["12", "24", "10", "2"],
          correct_index: 0,
          explanation: "The multiples of 4 are 4, 8, 12... and of 6 are 6, 12... The smallest common multiple is 12."
        },
        {
          question: "Convert 3/4 to a decimal value.",
          options: ["0.75", "0.50", "0.25", "0.80"],
          correct_index: 0,
          explanation: "3 divided by 4 equals 0.75."
        }
      ]
    };
  }

  // 3. Force and Pressure / Physical properties
  if (lowerTitle.includes('force') || lowerTitle.includes('pressure') || lowerTitle.includes('motion') || lowerTitle.includes('friction') || lowerTitle.includes('light') || lowerTitle.includes('sound')) {
    return {
      conceptEn: "A force is a push or pull on an object resulting from its interaction with another object. Pressure is the force applied perpendicular to the surface of an object per unit area (Pressure = Force / Area).",
      conceptHi: "\\u092c\\u0932 \\u0915\\u093f\\u0938\\u0940 \\u0935\\u0938\\u094d\\u0924\\u0941 \\u092a\\u0930 \\u0932\\u0917\\u0928\\u0947 \\u0935\\u093e\\u0932\\u093e \\u0916\\u093f\\u0902\\u091a\\u093e\\u0935 \\u092f\\u093e \\u0927\\u0915\\u094d\\u0915\\u093e \\u0939\\u0948\\u0965 \\u0926\\u093e\\u092c \\u092a\\u094d\\u0930\\u0924\\u093f \\u0905\\u0928\\u0941\\u092a\\u094d\\u0930\\u0935\\u094d\\u0925 \\u0915\\u094d\\u0937\\u0947\\u0924\\u094d\\u0930\\u092b\\u0932 \\u092a\\u0930 \\u0932\\u091e\\u093e\\u092f\\u093e \\u0917\\u092f\\u093e \\u092c\\u0932 \\u0939\\u0948 (\\u0926\\u093e\\u092c = \\u092c\\u0932 / \\u0915\\u094d\\u0937\\u0947\\u0924\\u094d\\u0930\\u092b\\u0932)\\u0965",
      conceptKn: "\\u0cac\\u0cb2\\u0cb5\\u0cc1 \\u0ca4\\u0cb7\\u0ccd\\u0cb3\\u0cc1\\u0cb5\\u0cbf\\u0c95\\u0cc6 \\u0c85\\u0ca5\\u0cb5\\u0cbe \\u0c8e\\u0cb3\\u0cc6\\u0caf\\u0cc1\\u0cb5\\u0cbf\\u0c95\\u0cc6\\u0caf\\u0cbe\\u0c97\\u0cbf\\u0ca6\\u0cc6. \\u0c92\\u0ca4\\u0ccd\\u0ca4\\u0ca1\\u0cb5\\u0cc1 \\u0caa\\u0ccd\\u0cb0\\u0ca4\\u0cbf \\u0c8f\\u0cb0\\u0cbf\\u0caf\\u0cbe \\u0cae\\u0cc7\\u0cb2\\u0cbf\\u0ca8 \\u0cac\\u0cb2\\u0cb5\\u0cbe\\u0c97\\u0cbf\\u0ca6\\u0cc6 (\\u0c92\\u0ca4\\u0ccd\\u0ca4\\u0ca1 = \\u0cac\\u0cb2 / \\u0c8f\\u0cb0\\u0cbf\\u0caf\\u0cbe).",
      objectives: ["Define force as push or pull", "Calculate pressure given force and contact area", "Identify contact and non-contact forces"],
      problem: "Calculate the pressure when a force of 100 N is applied over an area of 2 square meters.",
      steps: {
        en: ["Step 1: Identify given values: Force (F) = 100 N, Area (A) = 2 m².", "Step 2: Recall the formula: Pressure (P) = Force / Area.", "Step 3: Substitute and solve: P = 100 / 2 = 50 N/m² (or Pascals)."],
        hi: ["\\u091a\\u0930\\u0923 1: \\u0926\\u093f\\u090f \\u0917\\u090f \\u092c\\u0932 (F) = 100 N \\u0914\\u0930 \\u0915\\u094d\\u0937\\u0947\\u0924\\u094d\\u0930\\u092b\\u0932 (A) = 2 m\\u00b2 \\u0915\\u094b \\u092a\\u0939\\u091a\\u093e\\u0928\\u0947\\u0902\\u0965", "\\u091a\\u0930\\u0923 2: \\u0938\\u0942\\u0924\\u094d\\u0930 \\u0932\\u093e\\u0917\\u0942 \\u0915\\u0930\\u0947\\u0902: \\u0926\\u093e\\u092c = \\u092c\\u0932 / \\u0915\\u094d\\u0937\\u0947\\u0924\\u094d\\u0930\\u092b\\u0932\\u0965", "\\u091a\\u0930\\u0923 3: \\u092e\\u093e\\u0928 \\u0930\\u0916\\u0915\\u0930 \\u0939\\u0932 \\u0915\\u0930\\u0947\\u0902: P = 100/2 = 50 Pa\\u0965"],
        kn: ["\\u0cb9\\u0c82\\u0ca4 1: \\u0cac\\u0cb2 (F) = 100 N \\u0cae\\u0ca4\\u0ccd\\u0ca4\\u0cc1 \\u0c8f\\u0cb0\\u0cbf\\u0caf\\u0cbe (A) = 2 m\\u00b2 \\u0c97\\u0cc1\\u0cb0\\u0cc1\\u0ca4\\u0cbf\\u0cb8\\u0cbf.", "\\u0cb9\\u0c82\\u0ca4 2: \\u0c92\\u0ca4\\u0ccd\\u0ca4\\u0ca1\\u0ca6 \\u0cb8\\u0cc2\\u0ca4\\u0ccd\\u0cb0: \\u0c92\\u0ca4\\u0ccd\\u0ca4\\u0ca1 = \\u0cac\\u0cb2 / \\u0c8f\\u0cb0\\u0cbf\\u0caf\\u0cbe.", "\\u0cb9\\u0c82\\u0ca4 3: \\u0cb2\\u0cc6\\u0c95\\u0ccd\\u0c95\\u0cb5\\u0ca8\\u0ccd\\u0ca8\\u0cc1 \\u0caa\\u0cb0\\u0cbbf\\u0cb5\\u0cb0\\u0ccd\\u0ca4\\u0cbf\\u0cb8\\u0cbf: P = 100 / 2 = 50 Pa."]
      },
      answer: "50 Pascals",
      keyPoints: {
        en: ["Force can change the state of motion or shape of an object.", "SI unit of force is Newton (N), and pressure is Pascal (Pa).", "Friction is a contact force that opposes motion."],
        hi: ["\\u092c\\u0932 \\u0915\\u093f\\u0938\\u0940 \\u0935\\u0938\\u094d\\u0924\\u0941 \\u0915\\u0940 \\u0917\\u0924\\u093f \\u092f\\u093e \\u0906\\u0915\\u093e\\u0930 \\u0915\\u094b \\u092c\\u0926\\u0932 \\u0938\\u0915\\u0924\\u093e \\u0939\\u0948\\u0965", "\\u092c\\u0932 \\u0915\\u093e \\u092e\\u093e\\u0924\\u094d\\u0930\\u0915 \\u0928\\u094d\\u092f\\u0942\\u091f\\u0928 (N) \\u0939\\u0948 \\u0914\\u0930 \\u0926\\u093e\\u092c \\u0915\\u093e \\u092a\\u093e\\u0938\\u094d\\u0915\\u0932 (Pa) \\u0939\\u0948\\u0965", "\\u091a\\u093f\\u092a\\u0915\\u094d\\u0924\\u093e \\u092c\\u0932 \\u0917\\u0924\\u093f \\u0915\\u093e \\u0935\\u093f\\u0930\\u094b\\u0927 \\u0915\\u0930\\u0924\\u093e \\u0939\\u0948\\u0965"],
        kn: ["\\u0cac\\u0cb2\\u0cb5\\u0cc1 \\u0cb5\\u0cb8\\u0ccd\\u0ca4\\u0cc1\\u0cb5\\u0cbf\\u0ca8 \\u0c9a\\u0cb2\\u0ca8\\u0cc6\\u0ca8\\u0ccd\\u0ca8\\u0cc1 \\u0c85\\u0ca5\\u0cb5\\u0cbe \\u0c86\\u0c95\\u0cbe\\u0cb0\\u0cb5\\u0ca8\\u0ccd\\u0ca8\\u0cc1 \\u0cac\\u0ca6\\u0cb2\\u0cbf\\u0cb8\\u0cac\\u0cb9\\u0cc1\\u0ca6\\u0cc1.", "\\u0cac\\u0cb2\\u0ca6 \\u0cae\\u0cbe\\u0ca8 \\u0ca8\\u0ccd\\u0caf\\u0cc2\\u0c9f\\u0ca8\\u0ccd, \\u0cae\\u0ca4\\u0ccd\\u0ca4\\u0cc1 \\u0c92\\u0ca4\\u0ccd\\u0ca4\\u0ca1\\u0ca6\\u0cc1 \\u0caa\\u0ccd\\u0cb0\\u0ca4\\u0ccd\\u0caf\\u0cc7\\u0c95\\u0cb5\\u0cbe\\u0c97\\u0cbf \\u0caa\\u0ccd\\u0caf\\u0cbe\\u0cb8\\u0ccd\\u0c95\\u0cb2\\u0ccd.", "\\u0c98\\u0cb0\\u0ccd\\u0cb7\\u0ca3\\u0cc6\\u0caf\\u0cc1 \\u0c9a\\u0cb2\\u0ca8\\u0cc6\\u0ca8\\u0ccd\\u0ca8\\u0cc1 \\u0cb5\\u0cbf\\u0cb0\\u0ccb\\u0ca7\\u0cbf\\u0cb8\\u0cc1\\u0cb5 \\u0cac\\u0cb2\\u0cbe\\u0c97\\u0cbf\\u0ca6\\u0cc6."]
      },
      facts: [
        { front: "What is the SI unit of force?", back: "The Newton (N).", hook: "Newton = Force scale." },
        { front: "What is the formula for pressure?", back: "Pressure = Force / Area.", hook: "Force divided by area." }
      ],
      checks: [
        {
          question: "Which of the following is a non-contact force?",
          options: ["Gravitational force", "Friction", "Tension", "Air resistance"],
          correct_index: 0,
          explanation: "Gravity acts over a distance without physical contact."
        },
        {
          question: "If area decreases while force stays constant, what happens to pressure?",
          options: ["It increases", "It decreases", "It stays the same", "It drops to zero"],
          correct_index: 0,
          explanation: "Since Pressure = Force/Area, decreasing the area increases the pressure."
        }
      ]
    };
  }

  // 4. Default Subject-specific templates
  let conceptEn = "In this chapter, we explore " + title + " in detail. This topic is essential for Grade " + grade + " academic standards. We study the core principles, terminology, and real-world relevance.";
  let conceptHi = "\\u0907\\u0938 \\u0905\\u0927\\u094d\\u092f\\u094b\\u092f \\u092e\\u0947\\u0902 \\u0939\\u092e " + titleHi + " \\u0915\\u093e \\u0935\\u093f\\u0938\\u094d\\u0924\\u093e\\u0930 \\u0938\\u0947 \\u0905\\u0927\\u094d\\u092f\\u092f\\u0928 \\u0915\\u0930\\u0924\\u0947 \\u0939\\u0948\\u0902\\u0965";
  let conceptKn = "\\u0c88 \\u0c85\\u0ca7\\u0ccd\\u0caf\\u0cbe\\u0caf\\u0ca6\\u0cb2\\u0ccd\\u0cb2\\u0cbf, \\u0ca8\\u0cbe\\u0cb5\\u0cc1 " + titleKn + " \\u0ca6 \\u0cac\\u0c97\\u0ccd\\u0c97\\u0cc6 \\u0cb5\\u0cbf\\u0cb5\\u0cb0\\u0cb5\\u0cbe\\u0c97\\u0cbf \\u0c95\\u0cb2\\u0cbf\\u0caf\\u0cc1\\u0ca4\\u0ccd\\u0ca7\\u0cc7\\u0cb5\\u0cc6.";
  let objectives = ["Understand key concepts of " + title, "Solve exercises and apply rules related to " + title, "Analyze practical examples of " + title + " in daily life"];
  let problem = "Worked problem illustrating the main mechanics of " + title + ".";
  
  let steps = {
    en: ["Step 1: Identify key variables in " + title + ".", "Step 2: Apply the primary rules of this domain.", "Step 3: Resolve the values to calculate the final answer."],
    hi: ["\\u091a\\u0930\\u0923 1: " + titleHi + " \\u0915\\u0947 \\u092e\\u0941\\u0916\\u094d\\u092f \\u091a\\u0930\\u094b\\u0902 \\u0915\\u0940 \\u092a\\u0939\\u091a\\u093e\\u0928 \\u0915\\u0930\\u0947\\u0902\\u0965", "\\u091a\\u0930\\u0923 2: \\u0907\\u0938 \\u0915\\u094d\\u0937\\u0947\\u0924\\u094d\\u0930 \\u0915\\u0947 \\u0928\\u093f\\u092f\\u092e \\u0932\\u093e\\u0917\\u0942 \\u0915\\u0930\\u0947\\u0902\\u0965", "\\u091a\\u0930\\u0923 3: \\u0905\\u0902\\u0924\\u093f\\u092e \\u0909\\u0924\\u094d\\u0924\\u0930 \\u0915\\u0930\\u0947\\u0902\\u0965"],
    kn: ["\\u0cb9\\u0c82\\u0ca4 1: " + titleKn + " \\u0ca8\\u0cb2\\u0ccd\\u0ca8\\u0cbf\\u0ca8 \\u0cae\\u0cc1\\u0c96\\u0ccd\\u0caf \\u0c85\\u0c82\\u0cb6\\u0c97\\u0cb3\\u0ca8\\u0ccd\\u0ca8\\u0cc1 \\u0c97\\u0cc1\\u0cb0\\u0cc1\\u0ca4\\u0cbf\\u0cb8\\u0cbf.", "\\u0cb9\\u0c82\\u0ca4 2: \\u0c88 \\u0cb5\\u0cbf\\u0cb7\\u0caf\\u0ca6 \\u0cae\\u0cc2\\u0cb2 \\u0ca8\\u0cbf\\u0caf\\u0cae\\u0c97\\u0cb3\\u0ca8\\u0ccd\\u0ca8\\u0cc1 \\u0c85\\u0ca8\\u0ccd\\u0caf\\u0cb5\\u0cbf\\u0cb8\\u0cbf.", "\\u0cb9\\u0c82\\u0ca4 3: \\u0c85\\u0ca8\\u0ccd\\u0ca4\\u0cbf\\u0cae \\u0c89\\u0ca4\\u0ccd\\u0ca4\\u0cb0 \\u0cb2\\u0cc6\\u0c95\\u0ccd\\u0c95 \\u0cb9\\u0cbe\\u0c95\\u0cbf."]
  };
  let answer = "Solved successfully";
  
  let keyPoints = {
    en: ["Mastering " + title + " builds foundational academic knowledge.", "Active problem solving helps retain concepts.", "Pay close attention to key definitions."],
    hi: [titleHi + " \\u092e\\u0947\\u0902 \\u092e\\u0939\\u093e\\u0930\\u0924 \\u0939\\u093e\\u0938\\u093f\\u0932 \\u0915\\u0930\\u0928\\u0947 \\u0938\\u0947 \\u0936\\u0948\\u0915\\u094d\\u0937\\u0923\\u093f\\u0915 \\u0915\\u094c\\u0936\\u0932 \\u092c\\u0928\\u0924\\u093e \\u0939\\u0948\\u0965", "\\u0938\\u0915\\u094d\\u0930\\u093f\\u092f \\u0905\\u092d\\u094d\\u092f\\u093e\\u0938 \\u0938\\u0947 \\u0938\\u092e\\u091d \\u092c\\u0922\\u093c\\u0924\\u0940 \\u0939\\u0948\\u0965", "\\u092e\\u0941\\u0916\\u094d\\u092f \\u092a\\u0930\\u093f\\u092d\\u093e\\u0937\\u093e\\u0913\\u0902 \\u092a\\u0930 \\u0927\\u094d\\u092f\\u093e\\u0928 \\u0926\\u0947\\u0902\\u0965"],
    kn: [titleKn + " \\u0ca8\\u0cb2\\u0ccd\\u0ca8\\u0cbf \\u0caa\\u0cb0\\u0cbf\\u0ca3\\u0ca4\\u0cbf \\u0caa\\u0ca1\\u0cc6\\u0caf\\u0cc1\\u0cb5\\u0cc1\\u0ca6\\u0cc1 \\u0cb6\\u0cc8\\u0c95\\u0ccd\\u0cb7\\u0ca3\\u0cbf\\u0c95 \\u0c95\\u0ccc\\u0cb6\\u0cb2\\u0ccd\\u0caf \\u0cac\\u0cc6\\u0cb3\\u0cc6\\u0cb8\\u0cc1\\u0ca4\\u0ccd\\u0ca4\\u0ca6\\u0cc6.", "\\u0ca8\\u0cbf\\u0cb0\\u0c82\\u0ca4\\u0cb0 \\u0c85\\u0cad\\u0ccd\\u0caf\\u0cbe\\u0cb8\\u0cb5\\u0cc1 \\u0ca8\\u0cc6\\u0ca8\\u0caa\\u0cbf\\u0ca8 \\u0cb6\\u0c95\\u0ccd\\u0ca4\\u0cbf \\u0cb9\\u0cc6\\u0c9a\\u0ccd\\u0c9a\\u0cbf\\u0cb8\\u0cc1\\u0ca4\\u0ccd\\u0ca4\\u0ca6\\u0cc6.", "\\u0cae\\u0cc2\\u0cb2 \\u0cb5\\u0ccd\\u0caf\\u0cbe\\u0c96\\u0ccd\\u0caf\\u0cbe\\u0ca8\\u0c97\\u0cb3 \\u0c97\\u0cae\\u0ca8 \\u0cb9\\u0cb0\\u0cbf\\u0cb8\\u0cbf."]
  };

  let facts = [
    { front: "What is the core idea of " + title + "?", back: "The essential principles and definitions taught in this syllabus.", hook: "Focus on fundamentals." },
    { front: "Why is " + title + " important?", back: "It connects theoretical knowledge to practical everyday applications.", hook: "Theory meets practice." }
  ];

  let checks = [];

  // Generate related options based on subject
  if (subject === 'math') {
    checks = [
      {
        question: "Determine the primary value when resolving a standard " + title + " expression with coefficients 8 and 4.",
        options: ["12", "32", "4", "2"],
        correct_index: 0,
        explanation: "Adding the coefficients 8 and 4 gives the sum of 12."
      },
      {
        question: "Which mathematical property is most useful when working with " + title + "?",
        options: ["Distributive property", "Quadratic formula", "Pythagorean theorem", "Trigonometric ratio"],
        correct_index: 0,
        explanation: "The distributive property helps simplify operations on expressions."
      }
    ];
  } else if (subject === 'science') {
    checks = [
      {
        question: "Which scientific term describes the fundamental unit or phenomenon of " + title + "?",
        options: ["Matter and energy exchange", "Chemical solution", "Inertial frame", "Biological cell structure"],
        correct_index: 0,
        explanation: "Science chapters investigate matter, energy, and physical or biological properties."
      },
      {
        question: "What is the standard tool used to measure changes in a " + title + " experiment?",
        options: ["Calibrated sensor or thermometer", "Barometer", "Microscope", "Stethoscope"],
        correct_index: 0,
        explanation: "Calibrated instruments record temperature and reaction rates in scientific trials."
      }
    ];
  } else if (subject === 'social') {
    checks = [
      {
        question: "Which aspect is most directly studied when analyzing the historical or geographic impact of " + title + "?",
        options: ["Socio-economic developments", "Planetary orbits", "Algebraic factors", "Chemical structures"],
        correct_index: 0,
        explanation: "Social studies focuses on society, human history, resource distribution, and geography."
      },
      {
        question: "Who or what body regulates the civic issues related to " + title + " in a community?",
        options: ["Local government and administration", "Sports federation", "Science research institute", "Private bank"],
        correct_index: 0,
        explanation: "Civics deals with governance, public facilities, and societal regulations."
      }
    ];
  } else {
    checks = [
      {
        question: "What is the primary objective of studying " + title + "?",
        options: ["Improving comprehension and communication", "Solving equations", "Measuring gravity", "Trading goods"],
        correct_index: 0,
        explanation: "Language lessons enhance descriptive vocabulary and structural communication."
      },
      {
        question: "Identify the grammatical or descriptive role of " + title + " in a text.",
        options: ["Expressing ideas clearly", "Adding numbers", "Drawing diagrams", "Forming chemical bonds"],
        correct_index: 0,
        explanation: "Language lessons focus on contextual clarity, grammar, and expressions."
      }
    ];
  }

  return {
    conceptEn,
    conceptHi,
    conceptKn,
    objectives,
    problem,
    steps,
    answer,
    keyPoints,
    facts,
    checks
  };
}

function generateLessonJson(grade, subject, chapter) {
  const data = getTopicSpecificData(grade, subject, chapter);

  return {
    "version": "1.0",
    "grade": parseInt(grade, 10),
    "subject": subject,
    "chapter_id": chapter.id,
    "chapter_title": {
      "en": chapter.title,
      "hi": chapter.titleHi,
      "kn": chapter.titleKn
    },
    "topics": [
      {
        "topic_id": subject + "_grade" + grade + "_" + chapter.id + "_basics",
        "title": {
          "en": chapter.title + " - Fundamentals",
          "hi": chapter.titleHi + " - \\u092c\\u0941\\u0928\\u093f\\u092f\\u093e\\u0926\\u0940 \\u092c\\u093e\\u0924\\u0947\\u0902",
          "kn": chapter.titleKn + " - \\u0cae\\u0cc2\\u0cb2\\u0ca4\\u0caext\\u0ccd\\u0cb5\\u0c97\\u0cb3\\u0cc1"
        },
        "learning_objectives": data.objectives,
        "estimated_minutes": 15,
        "base_story_template": {
          "en": "Welcome {{STUDENT_NAME}} to our learning session at the {{INTEREST_PLACE}}! Today we explore " + chapter.title + ". This lesson is key to mapping how inputs transform to outputs.",
          "hi": "{{INTEREST_PLACE}} \\u092e\\u0947\\u0902 \\u0906\\u092a\\u0915\\u093e \\u0938\\u094d\\u0935\\u093e\\u0917\\u0924 \\u0939\\u0948 {{STUDENT_NAME}}! \\u0906\\u091c \\u0939\\u092e " + chapter.titleHi + " \\u0915\\u093e \\u0905\\u0927\\u094d\\u092f\\u092f\\u0928 \\u0915\\u0930\\u0947\\u0902\\u0917\\u0947\\u0965",
          "kn": "{{INTEREST_PLACE}} \\u0c97\\u0cc6 \\u0cb8\\u0cc1\\u0cb5\\u0cbe\\u0c97\\u0ca4 {{STUDENT_NAME}}! \\u0c87\\u0ca2\\u0cc1 \\u0ca8\\u0cbe\\u0cb5\\u0cc1 " + chapter.titleKn + " \\u0ca6 \\u0cac\\u0c97\\u0ccd\\u0c97\\u0cc6 \\u0c95\\u0cb2\\u0cbf\\u0caf\\u0ccb\\u0ca3."
        },
        "concept_explanation": {
          "en": data.conceptEn,
          "hi": data.conceptHi,
          "kn": data.conceptKn
        },
        "worked_example": {
          "problem": data.problem,
          "steps": [
            { "en": data.steps.en[0], "hi": data.steps.hi[0], "kn": data.steps.kn[0] },
            { "en": data.steps.en[1], "hi": data.steps.hi[1], "kn": data.steps.kn[1] },
            { "en": data.steps.en[2], "hi": data.steps.hi[2], "kn": data.steps.kn[2] }
          ],
          "answer": data.answer
        },
        "key_points": {
          "en": data.keyPoints.en,
          "hi": data.keyPoints.hi,
          "kn": data.keyPoints.kn
        },
        "interest_placeholders": {
          "INTEREST_PLACE": {
            "space":   { "en": "inside the control deck of a space shuttle", "hi": "\\u0905\\u0902\\u0924\\u0930\\u093f\\u0915\\u094d\\u0937 \\u092f\\u093e\\u0928 \\u0915\\u0947 \\u0928\\u093f\\u092f\\u0902\\u0924\\u094d\\u0930\\u0923 \\u0921\\u0947\\u0915 \\u0915\\u0947 \\u092d\\u0940\\u0924\\u0930", "kn": "\\u0cac\\u0cbe\\u0cb9\\u0ccd\\u0caf\\u0cbe\\u0c95\\u0cbe\\u0cb6 \\u0ca8\\u0ccc\\u0c96\\u0cc6\\u0caf \\u0ca8\\u0cbf\\u0caf\\u0c28\\u0ccd\\u0ca4\\u0ccd\\u0cb0\\u0ca3 \\u0ca1\\u0cc6\\u0c95\\u0ccd \\u0c92\\u0cb3\\u0c97\\u0cc6" },
            "nature":  { "en": "at the forest wildlife sanctuary camp", "hi": "\\u0935\\u0928\\u094d\\u092f\\u091c\\u0940\\u0935 \\u0905\\u092d\\u094d\\u092f\\u093e\\u0930\\u0923\\u094d\\u092f \\u0936\\u093f\\u0935\\u093f\\u0930 \\u092e\\u0947\\u0902", "kn": "\\u0cb5\\u0ca8\\u0ccd\\u0caf\\u0c9c\\u0cc0\\u0cb5\\u0cbf \\u0ca7\\u0cbe\\u0cae\\u0ca6 \\u0cb6\\u0cbf\\u0cb0\\u0ca6\\u0cb2\\u0ccd\\u0cb2\\u0cbf" },
            "robots":  { "en": "next to the compiler terminal in a robot lab", "hi": "\\u0930\\u094b\\u092c\\u094b\\u091f \\u0932\\u0948\\u092c \\u092e\\u0947\\u0902 \\u0915\\u0902\\u092a\\u093e\\u0907\\u0932\\u0930 \\u091f\\u0930\\u094d\\u092e\\u093f\\u0928\\u0932 \\u0915\\u0947 \\u092a\\u093e\\u0938", "kn": "\\u0cb0\\u0ccb\\u0cac\\u0ccb\\u0c9f\\u0ccd \\u0cb2\\u0ccd\\u0caf\\u0cbe\\u0cac\\u0ccd \\u0ca8\\u0cb2\\u0ccd\\u0cb2\\u0cbf\\u0ca8 \\u0c95\\u0c82\\u0caa\\u0cc8\\u0cb2\\u0cb0\\u0ccd \\u0ca4\\u0cc1\\u0ca6\\u0cbf\\u0caf \\u0cb9\\u0ca4\\u0ccd\\u0ca4\\u0cbf\\u0cb0" },
            "sports":  { "en": "on the stadium practice field", "hi": "\\u0916\\u0947\\u0932 \\u0915\\u0947 \\u092e\\u094d\\u092f\\u093e\\u0928 \\u092e\\u0947\\u0902", "kn": "\\u0c95\\u0ccd\\u0cb0\\u0cc0\\u0ca1\\u0cbe\\u0c82\\u0c97\\u0ca3\\u0ca6 \\u0cae\\u0cc8\\u0ca6\\u0cbe\\u0ca8\\u0ca6\\u0cb2\\u0ccd\\u0cb2\\u0cbf" },
            "stories": { "en": "near the ancient archives desk of the library", "hi": "\\u092a\\u0941\\u0938\\u094d\\u0924\\u0915\\u093e\\u0932\\u092f \\u0915\\u0947 \\u092a\\u094d\\u0930\\u093e\\u091a\\u0940\\u0928 \\u0905\\u092d\\u093f\\u0932\\u0947\\u0916\\u093e\\u0917\\u093e\\u0930 \\u0915\\u0947 \\u092a\\u093e\\u0938", "kn": "\\u0c97\\u0ccd\\u0cb0\\u0c82\\u0ca5\\u0cbe\\u0cb2\\u0caf\\u0ca6 \\u0caa\\u0cc1\\u0cb0\\u0cbe\\u0ca4\\u0ca8 \\u0cb2\\u0cc7\\u0c96\\u0ca8\\u0c97\\u0cb3 \\u0cae\\u0cc7\\u0c9c\\u0cbf\\u0ca8 \\u0cb9\\u0ca4\\u0ccd\\u0ca4\\u0cbf\\u0cb0" },
            "history": { "en": "near the watchtower of Chitradurga Fort", "hi": "\\u091a\\u093f\\u0924\\u094d\\u0930\\u0926\\u0941\\u0930\\u094d\\u0917 \\u0915\\u093f\\u0932\\u0947 \\u0915\\u0947 \\u0935\\u0949\\u091a\\u091f\\u093e\\u0935\\u0930 \\u0915\\u0947 \\u092a\\u093e\\u0938", "kn": "\\u0c9a\\u0cbf\\u0ca4\\u0ccd\\u0cb0\\u0ca6\\u0cc1\\u0cb0\\u0ccd\\u0c97 \\u0c95\\u0ccb\\u0c9f\\u0cc6\\u0caf \\u0c95\\u0cbe\\u0cb5\\u0cb2\\u0cc1 \\u0c97\\u0ccb\\u0caa\\u0cc1\\u0cb0\\u0ca6 \\u0cb9\\u0ca4\\u0ccd\\u0ca4\\u0cbf\\u0cb0" },
            "default": { "en": "in the school study room", "hi": "\\u0938\\u094d\\u0915\\u0942\\u0932 \\u0915\\u0947 \\u0905\\u0927\\u094d\\u092f\\u092f\\u0928 \\u0915\\u0915\\u094d\\u0937 \\u092e\\u0947\\u0902", "kn": "\\u0cb6\\u0cbe\\u0cb2\\u0cc6\\u0caf \\u0c93\\u0ca6\\u0cc1\\u0cb5 \\u0c95\\u0ccb\\u0ca3\\u0cc6\\u0caf\\u0cb2\\u0ccd\\u0cb2\\u0cbf" }
          }
        }
      }
    ]
  };
}

function generateQuizBankJson(grade, subject, chapter) {
  const topicId = subject + "_grade" + grade + "_" + chapter.id + "_basics";
  const data = getTopicSpecificData(grade, subject, chapter);
  const questions = [];
  
  for (let idx = 1; idx <= 10; idx++) {
    const diff = idx <= 3 ? 'easy' : idx <= 7 ? 'medium' : 'hard';
    const baseQuestion = data.checks[(idx - 1) % data.checks.length];
    
    questions.push({
      "id": "q0" + idx,
      "difficulty": diff,
      "question": {
        "en": baseQuestion.question + " (Q" + idx + ")",
        "hi": baseQuestion.question + " (Q" + idx + ")",
        "kn": baseQuestion.question + " (Q" + idx + ")"
      },
      "options": {
        "en": baseQuestion.options,
        "hi": baseQuestion.options,
        "kn": baseQuestion.options
      },
      "correct_index": baseQuestion.correct_index,
      "explanation": {
        "en": baseQuestion.explanation,
        "hi": baseQuestion.explanation,
        "kn": baseQuestion.explanation
      },
      "diagram_ref": null
    });
  }

  return {
    "version": "1.0",
    "topic_id": topicId,
    "questions": questions
  };
}

function generateFlashcardsJson(grade, subject, chapter) {
  const topicId = subject + "_grade" + grade + "_" + chapter.id + "_basics";
  const data = getTopicSpecificData(grade, subject, chapter);
  const cards = [];

  for (let idx = 1; idx <= 5; idx++) {
    const baseFact = data.facts[(idx - 1) % data.facts.length];
    
    cards.push({
      "id": "fc0" + idx,
      "front": {
        "en": baseFact.front + " (FC" + idx + ")",
        "hi": baseFact.front + " (FC" + idx + ")",
        "kn": baseFact.front + " (FC" + idx + ")"
      },
      "back": {
        "en": baseFact.back,
        "hi": baseFact.back,
        "kn": baseFact.back
      },
      "memory_hook": {
        "en": baseFact.hook,
        "hi": baseFact.hook,
        "kn": baseFact.hook
      }
    });
  }

  return {
    "version": "1.0",
    "topic_id": topicId,
    "cards": cards
  };
}
`;

const fileContent = fs.readFileSync(targetFile, 'utf8');

// Find the target to replace: from 'function getTopicSpecificData' down to the end of 'generateFlashcardsJson'
const startIndex = fileContent.indexOf('function getTopicSpecificData');
const endIndex = fileContent.indexOf('// Generate learningContent.ts dynamic data');

if (startIndex === -1 || endIndex === -1) {
  console.error('Could not find injection boundaries in seed_curriculum.js!');
  process.exit(1);
}

const updatedContent = fileContent.slice(0, startIndex) + codeToInject + fileContent.slice(endIndex);
fs.writeFileSync(targetFile, updatedContent, 'utf8');
console.log('Successfully updated seed_curriculum.js with specific educational content generator.');
