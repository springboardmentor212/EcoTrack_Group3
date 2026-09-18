const mongoose = require("mongoose");

const carbonRecordSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User ID is required"],
      index: true,
    },
    category: {
      type: String,
      required: [true, "Category is required"],
      enum: {
        values: [
          "Transportation",
          "Electricity Usage",
          "Fuel Consumption",
          "Food Consumption",
          "Waste Generation",
          "Water Usage",
          "Online Shopping",
          "Travel Activities",
        ],
        message: "{VALUE} is not a valid category",
      },
    },
    icon: {
      type: String,
      required: [true, "Icon is required"],
    },
    amount: {
      type: Number,
      required: [true, "Amount is required"],
      min: [0, "Amount cannot be negative"],
    },
    emission: {
      type: Number,
      required: [true, "Emission is required"],
      min: [0, "Emission cannot be negative"],
    },
    date: {
      type: String,
      required: [true, "Date is required"],
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

// Index for efficient querying
carbonRecordSchema.index({ userId: 1, date: -1 });
carbonRecordSchema.index({ userId: 1, category: 1 });

module.exports = mongoose.model("CarbonRecord", carbonRecordSchema);