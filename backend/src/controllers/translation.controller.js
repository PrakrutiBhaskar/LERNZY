const { translateToLanguage, normalizeLanguage } = require("../services/translation.service");
const { successResponse } = require("../utils/response.utils");

/**
 * Exposes a translation endpoint backing EN/HI/KN content.
 */
const translateText = async (req, res, next) => {
  try {
    const { text, language } = req.body;
    const targetLanguage = normalizeLanguage(language);

    const translatedText = await translateToLanguage({
      text,
      targetLanguage
    });

    return successResponse(res, {
      originalText: text,
      translatedText,
      language: targetLanguage
    }, "Translation completed");
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  translateText
};
