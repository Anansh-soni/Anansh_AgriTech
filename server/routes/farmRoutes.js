
const express = require("express");
const router = express.Router();

const protect = require("../middleware/authMiddleware");

const {
  getFarms,
  createFarm,
  updateFarm,
  deleteFarm,
} = require("../controllers/farmController");

// Require a valid login token for both routes
router.get("/", protect, getFarms);
router.post("/", protect, createFarm);
router.patch("/:id", protect, updateFarm);
router.delete("/:id", protect, deleteFarm);

module.exports = router;
