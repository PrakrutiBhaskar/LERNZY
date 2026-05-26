const express = require("express");
const { getTopicLessons, getTopicById } = require("../controllers/curriculum.controller");
const authMiddleware = require("../middleware/auth.middleware");

const router = express.Router();

router.get("/:id/lessons", authMiddleware, getTopicLessons);
router.get("/:id", authMiddleware, getTopicById);

module.exports = router;
