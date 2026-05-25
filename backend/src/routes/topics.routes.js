const express = require("express");
const { getTopicLessons } = require("../controllers/curriculum.controller");
const authMiddleware = require("../middleware/auth.middleware");

const router = express.Router();

router.get("/:id/lessons", authMiddleware, getTopicLessons);

module.exports = router;
