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

/**
 * Safely evaluates student coding exercise submissions and returns structured pass/fail results.
 */
const evaluateCode = async (req, res, next) => {
  try {
    const { code, problemId } = req.body;

    let passed = false;
    let feedback = "Code structure did not meet the requirements.";
    const results = [];

    const normalizedProblem = String(problemId || "").toLowerCase().trim();

    if (normalizedProblem === "hello-world") {
      const match = (code || "").match(/console\.log\s*\(\s*(['"`])Hello,\s*World!\1\s*\)/i);
      passed = !!match;
      feedback = passed
        ? "Excellent! You successfully printed 'Hello, World!' to the console."
        : "Make sure you call console.log('Hello, World!') exactly.";
      results.push({
        testCase: "Print exactly 'Hello, World!'",
        passed,
        expected: "Hello, World!",
        actual: passed ? "Hello, World!" : "Incorrect output structure"
      });
    } else if (normalizedProblem === "sum-two") {
      const match = (code || "").match(/function\s+\w+\s*\(\s*\w+\s*,\s*\w+\s*\)\s*\{\s*return\s+\w+\s*\+\s*\w+/i);
      passed = !!match;
      feedback = passed
        ? "Awesome job! You defined a function that sums two inputs."
        : "Make sure you return the sum of the two function arguments.";
      results.push({
        testCase: "Function returns sum",
        passed,
        expected: "Sum of two numbers",
        actual: passed ? "Sum returned" : "No sum function found"
      });
    } else {
      passed = (code || "").length > 5;
      feedback = passed ? "Submission evaluated." : "Code is too short to evaluate.";
      results.push({
        testCase: "Minimum length check",
        passed,
        expected: "> 5 characters",
        actual: `${(code || "").length} characters`
      });
    }

    return successResponse(res, {
      passed,
      score: passed ? 100 : 0,
      feedback,
      results
    }, "Code submission evaluated");
  } catch (error) {
    return next(error);
  }
};

module.exports = { explainCode, evaluateCode };
