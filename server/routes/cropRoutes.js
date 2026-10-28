const express = require("express");
const router = express.Router();

const protect = require("../middleware/authMiddleware");

const {
  getCrops,
  createCrop,
  updateCrop,
  deleteCrop,
} = require("../controllers/cropController");

router.get("/", protect, getCrops);
router.post("/", protect, createCrop);
router.patch("/:id", protect, updateCrop);
router.delete("/:id", protect, deleteCrop);

module.exports = router;
