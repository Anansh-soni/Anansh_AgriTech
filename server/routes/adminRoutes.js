const express = require("express");
const router = express.Router();

const protect = require("../middleware/authMiddleware");
const requireAdmin = require("../middleware/adminMiddleware");
const {
  getDashboardStats,
  getUsers,
  updateUserRole,
} = require("../controllers/adminController");
const { getBookings, updateBookingStatus } = require("../controllers/bookingController");

router.use(protect, requireAdmin);
router.get("/stats", getDashboardStats);
router.get("/users", getUsers);
router.patch("/users/:id/role", updateUserRole);
router.get("/bookings", getBookings);
router.patch("/bookings/:id/status", updateBookingStatus);

module.exports = router;
