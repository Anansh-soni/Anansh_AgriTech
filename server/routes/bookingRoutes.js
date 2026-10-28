
const express = require("express");
const router = express.Router();
const protect = require("../middleware/authMiddleware");

const {
  getBookings,
  createBooking,
} = require("../controllers/bookingController");

router.get("/", protect, getBookings);
router.post("/", protect, createBooking);

module.exports = router;
