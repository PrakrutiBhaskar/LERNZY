const express = require("express");
const { getCurriculum } = require("../controllers/curriculum.controller");
const authMiddleware = require("../middleware/auth.middleware");

const router = express.Router();

router.get("/", authMiddleware, getCurriculum);

module.exports = router;
