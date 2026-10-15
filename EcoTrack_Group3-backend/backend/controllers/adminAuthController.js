const jwt = require("jsonwebtoken");
const Admin = require("../models/Admin");

const EMAIL_PATTERN = /^\S+@\S+\.\S+$/;

// Generate JWT token for admin
const generateAdminToken = (id) => {
  return jwt.sign(
    {
      id,
      role: "admin",
    },
    process.env.JWT_SECRET,
    {
      expiresIn: process.env.JWT_EXPIRES_IN || "7d",
    }
  );
};

const normalizeEmail = (email) => String(email || "").trim().toLowerCase();

// Format admin response
const formatAdmin = (admin) => {
  const adminObj = admin.toObject();

  return {
    _id: adminObj._id,
    name: adminObj.name,
    email: adminObj.email,
    createdAt: adminObj.createdAt,
    updatedAt: adminObj.updatedAt,
  };
};

// @desc    Login admin
// @route   POST /api/admin/auth/login
exports.loginAdmin = async (req, res) => {
  try {
    const email = normalizeEmail(req.body.email);
    const password = String(req.body.password || "");

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Please provide email and password",
      });
    }

    if (!EMAIL_PATTERN.test(email)) {
      return res.status(400).json({
        success: false,
        message: "Please provide a valid email address",
      });
    }

    const admin = await Admin.findOne({ email }).select("+password");

    if (!admin) {
      return res.status(400).json({
        success: false,
        message: "Invalid admin credentials",
      });
    }

    const isMatch = await admin.comparePassword(password);

    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: "Invalid admin credentials",
      });
    }

    res.json({
      success: true,
      token: generateAdminToken(admin._id),
      admin: formatAdmin(admin),
    });
  } catch (error) {
    console.error("Admin login error:", error);

    res.status(500).json({
      success: false,
      message: "Server error during admin login",
    });
  }
};