const ChapterTutorSession = require("../models/ChapterTutorSession.model");
const { generateTutorResponse } = require("../services/ai.service");
const { normalizeLanguage } = require("../services/translation.service");
const { sanitizePromptText, sanitizeChapterContext } = require("../services/prompt.service");
const { successResponse } = require("../utils/response.utils");
const logger = require("../utils/logger");

const DIFFICULTIES = new Set(["beginner", "intermediate", "advanced"]);
const PRACTICE_PATTERN = /\b(practice|mcq|multiple choice|short answer|challenge|quiz|test me|exam questions?)\b/i;
const STOP_WORDS = new Set([
  "what", "when", "where", "which", "explain", "give", "show", "solve", "this", "that",
  "chapter", "please", "about", "with", "from", "into", "tell", "does", "mean", "important"
]);

function normalizeDifficulty(value) {
  return DIFFICULTIES.has(value) ? value : "beginner";
}

function normalizeQuestionType(question) {
  if (/\bmcq|multiple choice\b/i.test(question)) return "mcq";
  if (/\bshort answer\b/i.test(question)) return "short-answer";
  if (/\bchallenge\b/i.test(question)) return "challenge";
  if (/\bsummar/i.test(question)) return "summary";
  if (/\bexam\b/i.test(question)) return "exam";
  if (/\btest me|test my understanding|quiz\b/i.test(question)) return "test";
  if (PRACTICE_PATTERN.test(question)) return "practice";
  return "doubt";
}

function extractDoubtTerms(question) {
  return sanitizePromptText(question)
    .toLowerCase()
    .split(/[^a-z0-9]+/i)
    .filter((term) => term.length >= 4 && !STOP_WORDS.has(term))
    .slice(0, 8);
}

function updateCommonDoubts(existing = [], question) {
  const counts = new Map(existing.map((item) => [item.term, item.count]));
  for (const term of extractDoubtTerms(question)) {
    counts.set(term, (counts.get(term) || 0) + 1);
  }
  return Array.from(counts.entries())
    .map(([term, count]) => ({ term, count }))
    .sort((a, b) => b.count - a.count || a.term.localeCompare(b.term))
    .slice(0, 10);
}

async function findOrCreateSession({ userId, subjectId, chapterId, subjectName, chapterTitle }) {
  let session = await ChapterTutorSession.findOne({ userId, subjectId, chapterId });
  if (session) {
    return session;
  }

  session = await ChapterTutorSession.create({
    userId,
    subjectId,
    subjectName,
    chapterId,
    chapterTitle,
    messages: []
  });
  return session;
}

const getChapterTutorSession = async (req, res, next) => {
  try {
    const { subjectId, chapterId } = req.params;
    const session = await ChapterTutorSession.findOne({
      userId: req.user._id,
      subjectId,
      chapterId
    }).lean();

    return successResponse(res, {
      session: session || null,
      messages: session?.messages || [],
      analytics: session?.analytics || {
        questionCount: 0,
        retryCount: 0,
        practiceRequestCount: 0,
        commonDoubts: []
      }
    }, "Chapter tutor session fetched");
  } catch (error) {
    return next(error);
  }
};

const postChapterTutorMessage = async (req, res, next) => {
  try {
    const { subjectId, chapterId } = req.params;
    const {
      question,
      subjectName = subjectId,
      chapterTitle = chapterId,
      chapterContext,
      language = "en",
      board = "state",
      grade,
      difficulty = "beginner",
      retryOfMessageId
    } = req.body;

    const normalizedLanguage = normalizeLanguage(language);
    const normalizedDifficulty = normalizeDifficulty(difficulty);
    const safeQuestion = sanitizePromptText(question);
    const safeContext = sanitizeChapterContext({
      ...(chapterContext || {}),
      subjectName,
      chapterTitle
    });

    const session = await findOrCreateSession({
      userId: req.user._id,
      subjectId,
      chapterId,
      subjectName: safeContext.subjectName || subjectId,
      chapterTitle: safeContext.chapterTitle || chapterId
    });

    const history = session.messages
      .slice(-8)
      .reduce((items, message, index, array) => {
        if (message.role !== "student") return items;
        const tutor = array.slice(index + 1).find((candidate) => candidate.role === "tutor");
        if (tutor) {
          items.push({ question: message.text, responseText: tutor.text });
        }
        return items;
      }, [])
      .slice(-4);

    const abortController = new AbortController();
    req.on("close", () => abortController.abort());

    const aiResult = await generateTutorResponse({
      question: safeQuestion,
      level: normalizedDifficulty,
      language: normalizedLanguage,
      topic: safeContext.chapterTitle || chapterTitle,
      board,
      grade,
      history,
      chapterContext: safeContext,
      abortSignal: abortController.signal
    });

    const questionType = normalizeQuestionType(safeQuestion);
    const now = new Date();
    session.messages.push({
      role: "student",
      text: safeQuestion,
      difficulty: normalizedDifficulty,
      questionType,
      createdAt: now
    });
    session.messages.push({
      role: "tutor",
      text: aiResult.text,
      difficulty: normalizedDifficulty,
      questionType,
      modelMeta: aiResult.modelMeta,
      createdAt: new Date()
    });
    session.analytics.questionCount += 1;
    session.analytics.retryCount += retryOfMessageId ? 1 : 0;
    session.analytics.practiceRequestCount += PRACTICE_PATTERN.test(safeQuestion) ? 1 : 0;
    session.analytics.lastDifficulty = normalizedDifficulty;
    session.analytics.commonDoubts = updateCommonDoubts(session.analytics.commonDoubts, safeQuestion);
    session.analytics.lastAskedAt = now;

    await session.save();

    return successResponse(res, {
      sessionId: session._id,
      messages: session.messages.slice(-2),
      answer: aiResult.text,
      modelMeta: aiResult.modelMeta,
      analytics: session.analytics,
      isVerified: false
    }, "Chapter tutor answer generated");
  } catch (error) {
    logger.error("chapter_tutor_message_failed", { message: error.message });
    return next(error);
  }
};

module.exports = {
  getChapterTutorSession,
  postChapterTutorMessage
};
