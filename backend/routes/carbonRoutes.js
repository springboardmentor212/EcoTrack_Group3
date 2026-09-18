const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const {
  getCarbonRecords,
  createCarbonRecord,
  deleteCarbonRecord,
} = require("../controllers/carbonController");

// All carbon record routes require authentication
router.get("/", auth, getCarbonRecords);
router.post("/", auth, createCarbonRecord);
router.delete("/:id", auth, deleteCarbonRecord);

module.exports = router;