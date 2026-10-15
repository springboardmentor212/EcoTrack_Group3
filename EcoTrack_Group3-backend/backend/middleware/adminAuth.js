const jwt = require("jsonwebtoken");
const Admin = require("../models/Admin");

const adminAuth = async (req, res, next) => {
  try {
    const authorization = req.header("Authorization") || "";
    const match = authorization.match(/^Bearer\s+(.+)$/i);
    const token = match?.[1];

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "No token provided, access denied",
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (decoded.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Admin access required",
      });
    }

    const admin = await Admin.findById(decoded.id);

    if (!admin) {
      return res.status(401).json({
        success: false,
        message: "Admin no longer exists",
      });
    }

    req.admin = admin;
    next();
  } catch (error) {
    res.status(401).json({
      success: false,
      message: "Admin token is not valid",
    });
  }
};

module.exports = adminAuth;