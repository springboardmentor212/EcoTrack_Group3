const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const {
  getActivities,
  createActivity,
  deleteActivity,
} = require("../controllers/activityController");

// All activity routes require authentication
router.get("/", auth, getActivities);
router.post("/", auth, createActivity);
router.delete("/:id", auth, deleteActivity);

module.exports = router;