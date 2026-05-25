const express = require("express");
const { getSubjectTopics } = require("../controllers/curriculum.controller");
const authMiddleware = require("../middleware/auth.middleware");

const router = express.Router();

router.get("/:id/topics", authMiddleware, getSubjectTopics);

module.exports = router;
