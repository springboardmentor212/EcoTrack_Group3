const CarbonRecord = require("../models/CarbonRecord");
const { toFiniteNumber, sendModelError } = require("../utils/api");

// @desc    Get all carbon records for logged-in user
// @route   GET /api/carbon-records
exports.getCarbonRecords = async (req, res) => {
  try {
    const records = await CarbonRecord.find({ userId: req.user._id })
      .sort({ date: -1, createdAt: -1 });

    res.json({
      success: true,
      count: records.length,
      data: records,
    });
  } catch (error) {
    console.error("Get carbon records error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// @desc    Create a new carbon record
// @route   POST /api/carbon-records
exports.createCarbonRecord = async (req, res) => {
  try {
    const { category, icon, amount, emission, date } = req.body;
    const parsedAmount = toFiniteNumber(amount);
    const parsedEmission = toFiniteNumber(emission);

    if (
      !category ||
      parsedAmount === null ||
      parsedEmission === null ||
      !date
    ) {
      return res.status(400).json({
        success: false,
        message: "Please provide category, amount, emission, and date",
      });
    }

    if (parsedAmount <= 0 || parsedEmission < 0) {
      return res.status(400).json({
        success: false,
        message: "Amount must be greater than zero and emission cannot be negative",
      });
    }

    if (Number.isNaN(Date.parse(date))) {
      return res.status(400).json({
        success: false,
        message: "Please provide a valid record date",
      });
    }

    const record = await CarbonRecord.create({
      userId: req.user._id,
      category,
      icon: icon || "🌱",
      amount: parsedAmount,
      emission: parsedEmission,
      date,
    });

    res.status(201).json({
      success: true,
      data: record,
    });
  } catch (error) {
    return sendModelError(res, error, "Server error while creating carbon record");
  }
};

// @desc    Delete a carbon record
// @route   DELETE /api/carbon-records/:id
exports.deleteCarbonRecord = async (req, res) => {
  try {
    const record = await CarbonRecord.findById(req.params.id);

    if (!record) {
      return res.status(404).json({
        success: false,
        message: "Carbon record not found",
      });
    }

    // Make sure user owns the record
    if (record.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to delete this record",
      });
    }

    await CarbonRecord.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: "Carbon record deleted successfully",
    });
  } catch (error) {
    return sendModelError(res, error, "Server error while deleting carbon record");
  }
};