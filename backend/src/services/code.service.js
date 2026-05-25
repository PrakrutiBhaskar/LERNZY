const { generateTextResponse } = require("./ai.service");
const { normalizeLanguage, maybeTranslate } = require("./translation.service");

const generateCodeExplanation = async ({ code, errorText, output, language, interests, board, grade }) => {
  const normalizedLanguage = normalizeLanguage(language);
  const langLabels = {
    en: "English",
    hi: "Hindi",
    ta: "Tamil",
    te: "Telugu",
    bn: "Bengali",
    kn: "Kannada"
  };
  const languageLabel = langLabels[normalizedLanguage] || "English";

  const prompt = `You are a beginner-friendly coding tutor (KodeMaadi) for Indian K-12 students.
Curriculum Context: ${board || "General"} Board, Grade ${grade || 8}.
Student Interests: ${interests && interests.length > 0 ? interests.join(", ") : "general daily life"}.

The student has written some JavaScript code.
Code:
\`\`\`javascript
${code}
\`\`\`

${errorText ? `They encountered this runtime error: ${errorText}` : ""}
${output ? `The output of the code was: ${output}` : ""}

Task:
1. Explain what the code is doing or why it failed.
2. Use analogies based on the student's interests or local Indian examples (e.g., KSRTC buses, local sports, Metro).
3. Do NOT give them the exact copy-paste answer if they have an error. Give them a strong hint.
4. Keep your answer brief (under 4 sentences) and encouraging.
5. Respond ONLY in ${languageLabel}.`;

  // We ask the model to generate in English, and we use maybeTranslate for reliability,
  // or we can just tell the model to output in the target language.
  // Using translation service is more reliable for regional Indian languages if the model is small.
  const aiText = await generateTextResponse({ prompt });

  return maybeTranslate({ text: aiText, language: normalizedLanguage });
};

module.exports = { generateCodeExplanation };
