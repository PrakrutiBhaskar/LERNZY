const express = require("express");
const { getLessonById } = require("../controllers/curriculum.controller");
const authMiddleware = require("../middleware/auth.middleware");

const router = express.Router();

router.get("/:id", authMiddleware, getLessonById);

module.exports = router;
