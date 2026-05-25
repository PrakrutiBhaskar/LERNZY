const { createSpeechPayload } = require("../services/tts.service");
const { successResponse } = require("../utils/response.utils");

/**
 * Exposes a TTS endpoint backed by tts.service.js that returns audio for a given text and language.
 */
const generateSpeech = async (req, res, next) => {
  try {
    const { text, language } = req.body;

    const payload = await createSpeechPayload({
      text,
      language
    });

    return successResponse(res, payload, "TTS generated");
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  generateSpeech
};
