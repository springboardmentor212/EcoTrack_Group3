const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const {
  getCarbonRecords,
  createCarbonRecord,
  updateCarbonRecord,
  deleteCarbonRecord,
  getCarbonCategories,
} = require("../controllers/carbonController");

router.get("/", auth, getCarbonRecords);
router.get("/categories", auth, getCarbonCategories);
router.post("/", auth, createCarbonRecord);
router.put("/:id", auth, updateCarbonRecord);
router.delete("/:id", auth, deleteCarbonRecord);

module.exports = router;
