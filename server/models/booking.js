
const mongoose = require("mongoose");

const bookingSchema = new mongoose.Schema(
  {
    bookingType: {
      type: String,
      enum: ["consultation", "resource"],
      default: "consultation",
    },
    farmer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    expertName: {
      type: String,
      default: "",
      trim: true,
    },
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      default: null,
    },
    quantity: {
      type: Number,
      min: 1,
      default: 1,
    },
    bookingDate: {
      type: Date,
      required: true,
    },
    topic: {
      type: String,
      default: "",
      trim: true,
    },
    status: {
      type: String,
      enum: ["Pending", "Confirmed", "Completed", "Cancelled"],
      default: "Pending",
    },
  },
  { timestamps: true }
);

bookingSchema.path("expertName").required(function () {
  return this.bookingType === "consultation";
});
bookingSchema.path("topic").required(function () {
  return this.bookingType === "consultation";
});
bookingSchema.path("product").required(function () {
  return this.bookingType === "resource";
});

module.exports = mongoose.model("Booking", bookingSchema);
