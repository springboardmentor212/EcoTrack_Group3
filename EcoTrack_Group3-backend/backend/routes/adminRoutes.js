const express = require("express");
const router = express.Router();

const adminAuth = require("../middleware/adminAuth");
const { getAllUsers,getAllChallenges,} = require("../controllers/adminController");

router.use(adminAuth);

// Get all users
router.get("/users", getAllUsers);
// Get all Challenges
router.get("/challenges",getAllChallenges);

module.exports = router;