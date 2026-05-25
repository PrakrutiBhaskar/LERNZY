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

module.exports = {
  getCurriculum
};
