const { generateCodeExplanation } = require("../services/code.service");
const { successResponse } = require("../utils/response.utils");

const explainCode = async (req, res, next) => {
  try {
    const { code, errorText, output, language = "en" } = req.body;
    const { educationLevel, preferredLanguage, interests, board, grade } = req.user;

    const explanation = await generateCodeExplanation({
      code,
      errorText,
      output,
      language: language || preferredLanguage,
      interests,
      board,
      grade
    });

    return successResponse(res, { explanation }, "Code explanation generated");
  } catch (error) {
    next(error);
  }
};

module.exports = { explainCode };
