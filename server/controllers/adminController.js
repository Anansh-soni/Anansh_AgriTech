
const User = require("../models/user");
const Farm = require("../models/farm");
const Crop = require("../models/crop");
const Product = require("../models/product");
const Booking = require("../models/booking");

// Get dashboard statistics
exports.getDashboardStats = async (req, res) => {
  try {
    const [users, farms, crops, products, bookings] =
      await Promise.all([
        User.countDocuments(),
        Farm.countDocuments(),
        Crop.countDocuments(),
        Product.countDocuments(),
        Booking.countDocuments(),
      ]);

    res.status(200).json({
      success: true,
      stats: {
        totalUsers: users,
        totalFarms: farms,
        totalCrops: crops,
        totalProducts: products,
        totalBookings: bookings,
      },
    });
  } catch (error) {
    console.error("Dashboard statistics error:", error.message);

    res.status(500).json({
      success: false,
      message: "Could not load dashboard statistics",
    });
  }
};

exports.getUsers = async (req, res) => {
  try {
    const users = await User.find().select("name email role createdAt").sort({ createdAt: -1 });
    res.status(200).json(users);
  } catch (error) {
    console.error("Admin user list error:", error.message);
    res.status(500).json({ message: "Could not load users" });
  }
};

exports.updateUserRole = async (req, res) => {
  try {
    const { role } = req.body;
    if (!["farmer", "admin"].includes(role)) {
      return res.status(400).json({ message: "Choose farmer or admin" });
    }
    if (String(req.user._id) === req.params.id && role !== "admin") {
      return res.status(400).json({ message: "You cannot remove your own admin access" });
    }

    const target = await User.findById(req.params.id);
    if (!target) return res.status(404).json({ message: "User not found" });
    if (target.role === "admin" && role === "farmer") {
      const adminCount = await User.countDocuments({ role: "admin" });
      if (adminCount <= 1) {
        return res.status(400).json({ message: "The last admin account cannot be demoted" });
      }
    }

    target.role = role;
    await target.save();
    res.status(200).json({
      message: "User role updated",
      user: { id: target._id, name: target.name, email: target.email, role: target.role },
    });
  } catch (error) {
    console.error("Admin role update error:", error.message);
    res.status(500).json({ message: "Could not update user role" });
  }
};
