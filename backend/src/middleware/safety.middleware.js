const PROFANITY_BLOCKLIST = [
  // A basic list of blocked terms (could be extended or moved to DB/Config later)
  'fuck', 'shit', 'bitch', 'asshole', 'cunt', 'dick', 'pussy', 'porn', 'sex'
];

/**
 * Middleware to check incoming text payloads against a basic blocklist.
 * Ensures an added layer of child-safety before hitting AI providers.
 */
const safetyMiddleware = (req, res, next) => {
  const { question, code, errorText } = req.body;

  // Aggregate possible text inputs to check
  const textToCheck = [question, code, errorText].filter(Boolean).join(' ').toLowerCase();

  if (!textToCheck) {
    return next();
  }

  // Check against blocklist
  const isUnsafe = PROFANITY_BLOCKLIST.some((word) => {
    // Regex boundary check to avoid substring matching on safe words
    const regex = new RegExp(`\\b${word}\\b`, 'i');
    return regex.test(textToCheck);
  });

  if (isUnsafe) {
    return res.status(400).json({
      error: {
        message: 'Your request contains language that goes against our community guidelines. Please rephrase and try again.',
      },
    });
  }

  next();
};

module.exports = safetyMiddleware;
