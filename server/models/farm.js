
const mongoose = require("mongoose");

const farmSchema = new mongoose.Schema(
  {
    farmer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    farmName: {
      type: String,
      required: true,
      trim: true,
    },
    location: {
      type: String,
      required: true,
    },
    landArea: {
      type: Number,
      required: true,
      min: 0,
    },
    soilType: {
      type: String,
      default: "Not specified",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Farm", farmSchema);
