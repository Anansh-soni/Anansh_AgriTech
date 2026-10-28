
const express = require("express");
const router = express.Router();
const protect = require("../middleware/authMiddleware");

const {
  registerUser,
  loginUser,
  getUsers,
  getCurrentUser,
} = require("../controllers/userController");

router.post("/register", registerUser);
router.post("/login", loginUser);
router.get("/me", protect, getCurrentUser);

// Keep this endpoint disabled until admin authentication is implemented.

module.exports = router;
