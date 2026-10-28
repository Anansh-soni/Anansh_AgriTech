
const mongoose = require("mongoose");

const cropSchema = new mongoose.Schema(
  {
    farm: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Farm",
      required: true,
    },
    cropName: {
      type: String,
      required: true,
      trim: true,
    },
    variety: {
      type: String,
      default: "",
    },
    plantingDate: {
      type: Date,
      required: true,
    },
    status: {
      type: String,
      enum: ["Planned", "Growing", "Harvested"],
      default: "Planned",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Crop", cropSchema);
