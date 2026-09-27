const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const {
  getChallenges,
  createChallenge,
  updateChallenge,
  deleteChallenge,
} = require("../controllers/challengeController");

// All challenge routes require authentication
router.get("/", auth, getChallenges);
router.post("/", auth, createChallenge);
router.put("/:id", auth, updateChallenge);
router.delete("/:id", auth, deleteChallenge);

module.exports = router;