
const express = require("express");
const router = express.Router();
const protect = require("../middleware/authMiddleware");
const requireAdmin = require("../middleware/adminMiddleware");

const {
  getProducts,
  createProduct,
  updateProduct,
  deleteProduct,
} = require("../controllers/productController");

router.get("/", getProducts);
router.post("/", protect, requireAdmin, createProduct);
router.patch("/:id", protect, requireAdmin, updateProduct);
router.delete("/:id", protect, requireAdmin, deleteProduct);

module.exports = router;
