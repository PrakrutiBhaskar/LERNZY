const User = require("../models/User.model");
const { signAccessToken, signRefreshToken, verifyRefreshToken } = require("../utils/jwt.utils");
const { hashToken } = require("../utils/crypto.utils");
const { successResponse, errorResponse } = require("../utils/response.utils");
const logger = require("../utils/logger");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const { getRedis } = require("../services/cache.service");

const issueAuthTokens = async (user) => {
  const accessToken = signAccessToken({ userId: user._id.toString() });
  const refreshToken = signRefreshToken({
    userId: user._id.toString(),
    tv: user.refreshTokenVersion || 0
  });

  user.refreshTokenHash = hashToken(refreshToken);
  await user.save();

  return { accessToken, refreshToken };
};

const setCookieToken = (res, refreshToken) => {
  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
  });
};

const signup = async (req, res, next) => {
  try {
    const { name, email, password, preferredLanguage, educationLevel, board, grade, interests, accessibility, locationTier } = req.body;

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return errorResponse(res, "Email already exists", 409, { code: "EMAIL_EXISTS" }, null);
    }

    const user = await User.create({
      name,
      email: email.toLowerCase(),
      password,
      preferredLanguage,
      educationLevel,
      board,
      grade,
      interests,
      accessibility,
      locationTier,
      refreshTokenVersion: 0
    });

    const tokens = await issueAuthTokens(user);
    setCookieToken(res, tokens.refreshToken);

    logger.info("user_signed_up", { userId: user._id.toString() });

    return successResponse(
      res,
      {
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
        token: tokens.accessToken,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          preferredLanguage: user.preferredLanguage,
          educationLevel: user.educationLevel,
          board: user.board,
          grade: user.grade,
          interests: user.interests,
          accessibility: user.accessibility,
          locationTier: user.locationTier,
          points: user.points
        }
      },
      "Signup successful",
      201
    );
  } catch (error) {
    return next(error);
  }
};

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email: email.toLowerCase() }).select("+password +refreshTokenHash");
    if (!user) {
      return errorResponse(res, "Invalid email or password", 401, { code: "AUTH_INVALID" }, null);
    }

    // Check account lockout
    if (user.lockUntil && user.lockUntil > new Date()) {
      const remainingTimeMs = user.lockUntil.getTime() - Date.now();
      const remainingMinutes = Math.ceil(remainingTimeMs / (60 * 1000));
      return res.status(423).json({
        success: false,
        message: `Account is temporarily locked. Try again in ${remainingMinutes} minutes.`,
        data: null,
        error: { code: "ACCOUNT_LOCKED", lockUntil: user.lockUntil }
      });
    }

    // If lock expired, clean it up
    if (user.lockUntil && user.lockUntil <= new Date()) {
      user.loginAttempts = 0;
      user.lockUntil = undefined;
      await user.save();
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      user.loginAttempts = (user.loginAttempts || 0) + 1;
      
      if (user.loginAttempts >= 5) {
        user.lockUntil = new Date(Date.now() + 15 * 60 * 1000); // 15 mins
        await user.save();
        return res.status(423).json({
          success: false,
          message: "Too many failed login attempts. Account locked for 15 minutes.",
          data: null,
          error: { code: "ACCOUNT_LOCKED", lockUntil: user.lockUntil }
        });
      }
      
      await user.save();
      return errorResponse(res, "Invalid email or password", 401, { code: "AUTH_INVALID" }, null);
    }

    // Reset login attempts on success
    if (user.loginAttempts > 0 || user.lockUntil) {
      user.loginAttempts = 0;
      user.lockUntil = undefined;
      await user.save();
    }

    const tokens = await issueAuthTokens(user);
    setCookieToken(res, tokens.refreshToken);

    logger.info("user_logged_in", { userId: user._id.toString() });

    return successResponse(res, {
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      token: tokens.accessToken,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        preferredLanguage: user.preferredLanguage,
        educationLevel: user.educationLevel,
        board: user.board,
        grade: user.grade,
        interests: user.interests,
        accessibility: user.accessibility,
        locationTier: user.locationTier,
        points: user.points
      }
    });
  } catch (error) {
    return next(error);
  }
};

const refresh = async (req, res, next) => {
  try {
    const refreshToken = req.cookies?.refreshToken || req.body?.refreshToken;

    if (!refreshToken) {
      return errorResponse(res, "refreshToken is required", 400, { code: "REFRESH_MISSING" }, null);
    }

    let decoded;

    try {
      decoded = verifyRefreshToken(refreshToken);
    } catch (error) {
      return errorResponse(res, "Invalid refresh token", 401, { code: "REFRESH_INVALID" }, null);
    }

    if (decoded.typ !== "refresh") {
      return errorResponse(res, "Invalid refresh token type", 401, { code: "REFRESH_BAD_TYPE" }, null);
    }

    const user = await User.findById(decoded.userId).select("+refreshTokenHash");
    if (!user) {
      return errorResponse(res, "Unauthorized", 401, { code: "USER_MISSING" }, null);
    }

    const incomingHash = hashToken(refreshToken);
    if (!user.refreshTokenHash || user.refreshTokenHash !== incomingHash) {
      return errorResponse(res, "Unauthorized", 401, { code: "REFRESH_MISMATCH" }, null);
    }

    if (decoded.tv !== undefined && decoded.tv !== (user.refreshTokenVersion || 0)) {
      return errorResponse(res, "Unauthorized", 401, { code: "REFRESH_VERSION_MISMATCH" }, null);
    }

    const accessToken = signAccessToken({ userId: user._id.toString() });
    const newRefreshToken = signRefreshToken({
      userId: user._id.toString(),
      tv: user.refreshTokenVersion || 0
    });

    user.refreshTokenHash = hashToken(newRefreshToken);
    await user.save();

    setCookieToken(res, newRefreshToken);

    return successResponse(res, {
      accessToken,
      refreshToken: newRefreshToken,
      token: accessToken
    });
  } catch (error) {
    return next(error);
  }
};

const logout = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).select("+refreshTokenHash");
    if (user) {
      user.refreshTokenHash = undefined;
      user.refreshTokenVersion = (user.refreshTokenVersion || 0) + 1;
      await user.save();
    }

    // Blacklist access token
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith("Bearer ")) {
      const token = authHeader.split(" ")[1];
      try {
        const decoded = jwt.decode(token);
        if (decoded && decoded.exp) {
          const ttlSeconds = Math.max(0, decoded.exp - Math.floor(Date.now() / 1000));
          if (ttlSeconds > 0) {
            const redisClient = getRedis();
            if (redisClient) {
              const tokenHash = crypto.createHash("sha256").update(token).digest("hex");
              await redisClient.set(`blacklist:${tokenHash}`, "1", "EX", ttlSeconds);
            }
          }
        }
      } catch (err) {
        // ignore
      }
    }

    res.clearCookie("refreshToken", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict"
    });

    logger.info("user_logged_out", { userId: req.user._id.toString() });

    return successResponse(res, null, "Logged out");
  } catch (error) {
    return next(error);
  }
};

const serializeUser = (user) => ({
  id: user._id,
  name: user.name,
  email: user.email,
  preferredLanguage: user.preferredLanguage,
  educationLevel: user.educationLevel,
  board: user.board,
  grade: user.grade,
  interests: user.interests,
  accessibility: user.accessibility,
  locationTier: user.locationTier,
  points: user.points
});

const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return errorResponse(res, "User not found", 404, { code: "USER_MISSING" }, null);
    }

    return successResponse(res, { user: serializeUser(user) });
  } catch (error) {
    return next(error);
  }
};

const updateMe = async (req, res, next) => {
  try {
    const { name, preferredLanguage, educationLevel, board, grade, interests, accessibility, locationTier } = req.body;
    const user = await User.findById(req.user._id);

    if (!user) {
      return errorResponse(res, "User not found", 404, { code: "USER_MISSING" }, null);
    }

    if (typeof name === "string" && name.trim().length >= 2) {
      user.name = name.trim();
    }
    if (preferredLanguage) {
      user.preferredLanguage = preferredLanguage;
    }
    if (educationLevel) {
      user.educationLevel = educationLevel;
    }
    if (board !== undefined) user.board = board;
    if (grade !== undefined) user.grade = grade;
    if (interests !== undefined) user.interests = interests;
    if (accessibility !== undefined) user.accessibility = accessibility;
    if (locationTier !== undefined) user.locationTier = locationTier;

    await user.save();

    return successResponse(res, { user: serializeUser(user) }, "Profile updated");
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  signup,
  login,
  refresh,
  logout,
  getMe,
  updateMe
};
