const express = require("express");
const router = express.Router();

const auth = require("../middleware/auth");
const admin = require("../middleware/admin");
const { getAllUsers,getAllChallenges,} = require("../controllers/adminController");

router.use(auth, admin);

// Get all users
router.get("/users", getAllUsers);
// Get all Challenges
router.get("/challenges",getAllChallenges);

module.exports = router;