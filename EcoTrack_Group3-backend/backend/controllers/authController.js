const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const User = require("../models/User");

const EMAIL_PATTERN = /^\S+@\S+\.\S+$/;

// Generate JWT token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "7d",
  });
};

// Format user response (remove password and private reset fields)
const formatUser = (user) => {
  const userObj = user.toObject();
  return {
    _id: userObj._id,
    name: userObj.name,
    email: userObj.email,
    role: userObj.role,
    avatar: userObj.avatar,
    level: userObj.level,
    totalPoints: userObj.totalPoints,
    currentStreak: userObj.currentStreak,
    lastActiveDate: userObj.lastActiveDate,
    createdAt: userObj.createdAt,
    updatedAt: userObj.updatedAt,
  };
};

const normalizeEmail = (email) => String(email || "").trim().toLowerCase();

const isValidationError = (error) => error?.name === "ValidationError";

const sendValidationError = (res, error) => {
  const message = Object.values(error.errors || {})
    .map((fieldError) => fieldError.message)
    .join(", ");

  return res.status(400).json({
    success: false,
    message: message || "Please check the submitted data",
  });
};

// @desc    Register a new user
// @route   POST /api/auth/register
exports.register = async (req, res) => {
  try {
    const name = String(req.body.name || "").trim();
    const email = normalizeEmail(req.body.email);
    const password = String(req.body.password || "");

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "Please provide name, email, and password",
      });
    }

    if (!EMAIL_PATTERN.test(email)) {
      return res.status(400).json({
        success: false,
        message: "Please provide a valid email address",
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 6 characters",
      });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "User already exists with this email",
      });
    }

    const user = await User.create({ name, email, password });
    await user.updateStreak();
    await user.save();

    res.status(201).json({
      success: true,
      token: generateToken(user._id),
      user: formatUser(user),
    });
  } catch (error) {
    if (error?.code === 11000) {
      return res.status(400).json({
        success: false,
        message: "User already exists with this email",
      });
    }

    if (isValidationError(error)) {
      return sendValidationError(res, error);
    }

    console.error("Register error:", error);
    res.status(500).json({
      success: false,
      message: "Server error during registration",
    });
  }
};

// @desc    Login user
// @route   POST /api/auth/login
exports.login = async (req, res) => {
  try {
    const email = normalizeEmail(req.body.email);
    const password = String(req.body.password || "");

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Please provide email and password",
      });
    }

    const user = await User.findOne({ email }).select("+password");
    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    await user.updateStreak();
    await user.save();

    res.json({
      success: true,
      token: generateToken(user._id),
      user: formatUser(user),
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({
      success: false,
      message: "Server error during login",
    });
  }
};

// @desc    Get current user profile
// @route   GET /api/auth/profile
exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.json({
      success: true,
      user: formatUser(user),
    });
  } catch (error) {
    console.error("Get profile error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// @desc    Update user profile
// @route   PUT /api/auth/profile
exports.updateProfile = async (req, res) => {
  try {
    const updateFields = {};
    const name = req.body.name;
    const avatar = req.body.avatar;

    if (name !== undefined) {
      const trimmedName = String(name).trim();
      if (!trimmedName) {
        return res.status(400).json({
          success: false,
          message: "Name cannot be empty",
        });
      }
      updateFields.name = trimmedName;
    }

    if (avatar !== undefined) {
      updateFields.avatar = String(avatar);
    }

    const user = await User.findByIdAndUpdate(req.user._id, updateFields, {
      returnDocument: "after",
      runValidators: true,
    }).select("-password");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.json({
      success: true,
      user: formatUser(user),
    });
  } catch (error) {
    if (isValidationError(error)) {
      return sendValidationError(res, error);
    }

    console.error("Update profile error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// @desc    Request a password reset
// @route   POST /api/auth/forgot-password
exports.forgotPassword = async (req, res) => {
  try {
    const email = normalizeEmail(req.body.email);
    const genericMessage =
      "If that email exists, a reset link has been sent";

    if (!email || !EMAIL_PATTERN.test(email)) {
      return res.status(400).json({
        success: false,
        message: "Please provide a valid email address",
      });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(200).json({
        success: true,
        message: genericMessage,
      });
    }

    const resetToken = user.createPasswordResetToken();
    await user.save({ validateBeforeSave: false });

    const response = {
      success: true,
      message: genericMessage,
    };

    // No email provider is configured in this repository. Expose the token
    // only in non-production environments so the flow can be tested locally.
    if (process.env.NODE_ENV !== "production") {
      response.resetToken = resetToken;
    }

    res.json(response);
  } catch (error) {
    console.error("Forgot password error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// @desc    Reset password using a token from forgot-password
// @route   POST /api/auth/reset-password
exports.resetPassword = async (req, res) => {
  try {
    const token = String(req.body.token || "");
    const password = String(req.body.password || "");

    if (!token || !password) {
      return res.status(400).json({
        success: false,
        message: "Please provide a reset token and new password",
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 6 characters",
      });
    }

    const hashedToken = crypto
      .createHash("sha256")
      .update(token)
      .digest("hex");

    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpires: { $gt: Date.now() },
    }).select("+resetPasswordToken +resetPasswordExpires +password");

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Password reset token is invalid or has expired",
      });
    }

    user.password = password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    res.json({
      success: true,
      message: "Password has been reset successfully",
    });
  } catch (error) {
    if (isValidationError(error)) {
      return sendValidationError(res, error);
    }

    console.error("Reset password error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// @desc    Google login/register
// @route   POST /api/auth/google
exports.googleAuth = async (req, res) => {
  try {
    const email = normalizeEmail(req.body.email);
    const name = String(req.body.name || "").trim();
    const googleId = String(req.body.googleId || "").trim();

    if (!email || !EMAIL_PATTERN.test(email)) {
      return res.status(400).json({
        success: false,
        message: "Please provide a valid email address",
      });
    }

    if (!googleId) {
      return res.status(400).json({
        success: false,
        message: "Google ID is required",
      });
    }

    let user = await User.findOne({ googleId });
    if (!user) {
      user = await User.findOne({ email });
    }

    if (user) {
      if (!user.googleId) {
        user.googleId = googleId;
      }
      await user.updateStreak();
      await user.save();

      return res.json({
        success: true,
        token: generateToken(user._id),
        user: formatUser(user),
      });
    }

    const dummyPassword = `${googleId}-${crypto.randomBytes(16).toString("hex")}`;
    user = await User.create({
      name: name || "Google User",
      email,
      password: dummyPassword,
      googleId,
    });

    await user.updateStreak();
    await user.save();

    res.status(201).json({
      success: true,
      token: generateToken(user._id),
      user: formatUser(user),
    });
  } catch (error) {
    if (error?.code === 11000) {
      return res.status(400).json({
        success: false,
        message: "Google account is already linked to another user",
      });
    }

    if (isValidationError(error)) {
      return sendValidationError(res, error);
    }

    console.error("Google auth error:", error);
    res.status(500).json({
      success: false,
      message: "Server error during Google authentication",
    });
  }
};