const CarbonRecord = require("../models/CarbonRecord");

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

    // Validate input
    if (!category || amount === undefined || emission === undefined || !date) {
      return res.status(400).json({
        success: false,
        message: "Please provide category, amount, emission, and date",
      });
    }

    if (amount < 0 || emission < 0) {
      return res.status(400).json({
        success: false,
        message: "Amount and emission cannot be negative",
      });
    }

    const record = await CarbonRecord.create({
      userId: req.user._id,
      category,
      icon: icon || "🌱",
      amount: Number(amount),
      emission: Number(emission),
      date,
    });

    res.status(201).json({
      success: true,
      data: record,
    });
  } catch (error) {
    console.error("Create carbon record error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
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
    console.error("Delete carbon record error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};