const { generateJSONResponse } = require("./ai.service");

const generateProblem = async ({ grade, topic, interests, language, difficulty }) => {
  const prompt = `You are an expert Math tutor for K-12 students.
Generate a localized math word problem.
Grade Level: ${grade || 5}
Topic: ${topic || "arithmetic"}
Student Interests: ${interests && interests.length > 0 ? interests.join(", ") : "general daily life"}
Language: ${language === "kn" ? "Kannada" : "English"}
Difficulty: ${difficulty}/5 (1 is very easy, 5 is challenging)

Use local Indian cultural contexts (e.g., local names, Namma Metro, KSRTC buses, cricket, local festivals) where appropriate, especially connecting to the student's interests.

Output MUST be a JSON object with this exact schema:
{
  "topic": "string",
  "emoji": "string",
  "description": "string (the word problem text)",
  "correctAnswer": "string (the final numeric answer)",
  "hint": "string (a helpful hint)",
  "steps": [
    { "number": 1, "label": "string", "detail": "string" }
  ]
}

Ensure the JSON is valid and the problem is mathematically sound.`;

  return generateJSONResponse({ prompt });
};

module.exports = { generateProblem };
