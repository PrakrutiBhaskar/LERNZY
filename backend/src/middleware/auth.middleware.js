const User = require("../models/User.model");
const { verifyAccessToken } = require("../utils/jwt.utils");
const { getRedis } = require("../services/cache.service");
const crypto = require("crypto");

const authMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized. Missing or invalid token.",
        data: null,
        error: { code: "UNAUTHORIZED" }
      });
    }

    const token = authHeader.split(" ")[1];

    // Check Redis blacklist
    const redisClient = getRedis();
    if (redisClient) {
      const tokenHash = crypto.createHash("sha256").update(token).digest("hex");
      const isBlacklisted = await redisClient.get(`blacklist:${tokenHash}`);
      if (isBlacklisted) {
        return res.status(401).json({
          success: false,
          message: "Unauthorized. Token has been revoked.",
          data: null,
          error: { code: "TOKEN_REVOKED" }
        });
      }
    }

    const decoded = verifyAccessToken(token);

    if (decoded.typ && decoded.typ !== "access") {
      return res.status(401).json({
        success: false,
        message: "Unauthorized. Invalid token type.",
        data: null,
        error: { code: "INVALID_TOKEN_TYPE" }
      });
    }

    const userId = decoded.userId || decoded.sub;
    const user = await User.findById(userId).select("-password");

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized. User no longer exists.",
        data: null,
        error: { code: "USER_MISSING" }
      });
    }

    req.user = user;
    return next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Unauthorized. Token is invalid or expired.",
      data: null,
      error: { code: "TOKEN_INVALID" }
    });
  }
};

const restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: "Forbidden. You do not have permission to perform this action.",
        data: null,
        error: { code: "FORBIDDEN" }
      });
    }
    next();
  };
};

module.exports = authMiddleware;
module.exports.restrictTo = restrictTo;
