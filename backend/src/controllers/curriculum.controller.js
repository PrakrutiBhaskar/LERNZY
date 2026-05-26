const CurriculumNode = require("../models/CurriculumNode.model");
const { successResponse } = require("../utils/response.utils");

/**
 * Fetches all curriculum nodes populated with their parent structures.
 */
const getCurriculum = async (req, res, next) => {
  try {
    const nodes = await CurriculumNode.find().populate("parent").lean();
    return successResponse(res, nodes, "Curriculum nodes fetched successfully");
  } catch (error) {
    return next(error);
  }
};

/**
 * Fetches topics under a subject concept.
 */
const getSubjectTopics = async (req, res, next) => {
  try {
    const { id } = req.params;
    const topics = await CurriculumNode.find({
      parent: id,
      nodeType: "topic"
    }).lean();
    return successResponse(res, topics, "Subject topics fetched successfully");
  } catch (error) {
    return next(error);
  }
};

/**
 * Fetches lessons/examples under a topic.
 */
const getTopicLessons = async (req, res, next) => {
  try {
    const { id } = req.params;
    const lessons = await CurriculumNode.find({
      parent: id,
      nodeType: "example"
    }).lean();
    return successResponse(res, lessons, "Topic lessons fetched successfully");
  } catch (error) {
    return next(error);
  }
};

/**
 * Fetches a single lesson node by its ID.
 */
const getLessonById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const lesson = await CurriculumNode.findById(id).populate("parent").lean();
    if (!lesson) {
      return res.status(404).json({
        success: false,
        message: "Lesson node not found",
        error: { code: "NOT_FOUND" }
      });
    }
    return successResponse(res, lesson, "Lesson fetched successfully");
  } catch (error) {
    return next(error);
  }
};

/**
 * Fetches a single topic node by its ID.
 */
const getTopicById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const topic = await CurriculumNode.findById(id).lean();
    if (!topic) {
      return res.status(404).json({
        success: false,
        message: "Topic node not found",
        error: { code: "NOT_FOUND" }
      });
    }
    return successResponse(res, topic, "Topic fetched successfully");
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  getCurriculum,
  getSubjectTopics,
  getTopicLessons,
  getLessonById,
  getTopicById
};
