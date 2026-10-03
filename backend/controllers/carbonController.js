const CarbonRecord = require("../models/CarbonRecord");
const {
  calculateEmission,
  getCategories,
  CATEGORY_ICONS,
} = require("../services/carbonCalculator");
const { toFiniteNumber, sendModelError } = require("../utils/api");

const buildFilters = (userId, query) => {
  const filter = { userId };

  if (query.category) {
    filter.category = query.category;
  }

  if (query.startDate || query.endDate) {
    filter.date = {};
    if (query.startDate) filter.date.$gte = query.startDate;
    if (query.endDate) filter.date.$lte = query.endDate;
  }

  if (query.minEmission !== undefined || query.maxEmission !== undefined) {
    filter.emission = {};
    const min = toFiniteNumber(query.minEmission);
    const max = toFiniteNumber(query.maxEmission);

    if (query.minEmission !== undefined && min === null) {
      throw new Error("minEmission must be a valid number");
    }
    if (query.maxEmission !== undefined && max === null) {
      throw new Error("maxEmission must be a valid number");
    }

    if (min !== null) filter.emission.$gte = min;
    if (max !== null) filter.emission.$lte = max;
  }

  if (query.search) {
    filter.$or = [
      { category: { $regex: query.search.trim(), $options: "i" } },
    ];
  }

  return filter;
};

// GET /api/carbon-records
// Supports: category, search, startDate, endDate, minEmission, maxEmission,
// sortBy (date|emission|amount), order (asc|desc), page, limit.
exports.getCarbonRecords = async (req, res) => {
  try {
    const filter = buildFilters(req.user._id, req.query);

    const page = Math.max(Number.parseInt(req.query.page || "1", 10), 1);
    const limit = Math.min(
      Math.max(Number.parseInt(req.query.limit || "50", 10), 1),
      100
    );

    const allowedSorts = new Set(["date", "emission", "amount", "createdAt"]);
    const sortBy = allowedSorts.has(req.query.sortBy)
      ? req.query.sortBy
      : "date";
    const sortDirection = req.query.order === "asc" ? 1 : -1;

    const [records, total] = await Promise.all([
      CarbonRecord.find(filter)
        .sort({ [sortBy]: sortDirection, createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit),
      CarbonRecord.countDocuments(filter),
    ]);

    res.json({
      success: true,
      count: records.length,
      total,
      page,
      pages: Math.ceil(total / limit),
      filters: {
        category: req.query.category || null,
        search: req.query.search || null,
        startDate: req.query.startDate || null,
        endDate: req.query.endDate || null,
      },
      data: records,
    });
  } catch (error) {
    if (error.message?.includes("must be a valid number")) {
      return res.status(400).json({ success: false, message: error.message });
    }
    console.error("Get carbon records error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// GET /api/carbon-records/categories
exports.getCarbonCategories = async (req, res) => {
  res.json({
    success: true,
    data: getCategories(),
  });
};

// POST /api/carbon-records
exports.createCarbonRecord = async (req, res) => {
  try {
    const { category, icon, amount, date } = req.body;
    const parsedAmount = toFiniteNumber(amount);

    if (!category || parsedAmount === null || !date) {
      return res.status(400).json({
        success: false,
        message: "Please provide category, amount, and date",
      });
    }

    if (parsedAmount <= 0) {
      return res.status(400).json({
        success: false,
        message: "Amount must be greater than zero",
      });
    }

    if (Number.isNaN(Date.parse(date))) {
      return res.status(400).json({
        success: false,
        message: "Please provide a valid record date",
      });
    }

    let emission;
    try {
      // The server is the source of truth for the calculation.
      emission = calculateEmission(category, parsedAmount);
    } catch (calculationError) {
      return res.status(400).json({
        success: false,
        message: calculationError.message,
      });
    }

    const record = await CarbonRecord.create({
      userId: req.user._id,
      category,
      icon: icon || CATEGORY_ICONS[category] || "🌱",
      amount: parsedAmount,
      emission,
      date,
    });

    res.status(201).json({
      success: true,
      message: "Carbon record calculated and saved successfully",
      data: record,
      calculation: {
        amount: parsedAmount,
        emissionFactor: emission / parsedAmount,
        emission,
        unit: "kg CO₂e",
      },
    });
  } catch (error) {
    return sendModelError(
      res,
      error,
      "Server error while creating carbon record"
    );
  }
};

// PUT /api/carbon-records/:id
exports.updateCarbonRecord = async (req, res) => {
  try {
    const record = await CarbonRecord.findById(req.params.id);

    if (!record) {
      return res.status(404).json({
        success: false,
        message: "Carbon record not found",
      });
    }

    if (record.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to update this record",
      });
    }

    const category = req.body.category ?? record.category;
    const amount =
      req.body.amount === undefined ? record.amount : toFiniteNumber(req.body.amount);
    const date = req.body.date ?? record.date;

    if (amount === null || amount <= 0) {
      return res.status(400).json({
        success: false,
        message: "Amount must be greater than zero",
      });
    }

    if (Number.isNaN(Date.parse(date))) {
      return res.status(400).json({
        success: false,
        message: "Please provide a valid record date",
      });
    }

    let emission;
    try {
      emission = calculateEmission(category, amount);
    } catch (calculationError) {
      return res.status(400).json({
        success: false,
        message: calculationError.message,
      });
    }

    record.category = category;
    record.amount = amount;
    record.emission = emission;
    record.date = date;
    if (req.body.icon !== undefined) record.icon = req.body.icon;

    await record.save();

    res.json({
      success: true,
      message: "Carbon record updated and recalculated successfully",
      data: record,
    });
  } catch (error) {
    return sendModelError(
      res,
      error,
      "Server error while updating carbon record"
    );
  }
};

// DELETE /api/carbon-records/:id
exports.deleteCarbonRecord = async (req, res) => {
  try {
    const record = await CarbonRecord.findById(req.params.id);

    if (!record) {
      return res.status(404).json({
        success: false,
        message: "Carbon record not found",
      });
    }

    if (record.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to delete this record",
      });
    }

    await record.deleteOne();

    res.json({
      success: true,
      message: "Carbon record deleted successfully",
    });
  } catch (error) {
    return sendModelError(
      res,
      error,
      "Server error while deleting carbon record"
    );
  }
};
