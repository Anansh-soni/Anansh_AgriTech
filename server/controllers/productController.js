
const Product = require("../models/product");

// Get all products
exports.getProducts = async (req, res) => {
  try {
    const products = await Product.find().sort({ createdAt: -1 });
    res.status(200).json(products);
  } catch (error) {
    console.error("Get products error:", error.message);
    res.status(500).json({ message: "Could not fetch products" });
  }
};

// Add a product
exports.createProduct = async (req, res) => {
  try {
    const { name, description, category, price, quantity, image } = req.body;

    if (!name?.trim() || !category?.trim() || price === undefined || quantity === undefined) {
      return res.status(400).json({
        message: "Name, category, price and quantity are required",
      });
    }

    const product = await Product.create({
      name: name.trim(),
      description: description?.trim() || "",
      category: category.trim(),
      price: Number(price),
      quantity: Number(quantity),
      image: image?.trim() || "",
    });

    res.status(201).json({
      message: "Product created successfully",
      product,
    });
  } catch (error) {
    console.error("Create product error:", error.message);
    res.status(error.name === "ValidationError" || error.name === "CastError" ? 400 : 500).json({
      message: error.name === "ValidationError" || error.name === "CastError"
        ? "Check the product details and try again"
        : "Could not create product",
    });
  }
};

exports.updateProduct = async (req, res) => {
  try {
    const updates = {};
    for (const field of ["name", "description", "category", "image"]) {
      if (req.body[field] !== undefined) updates[field] = String(req.body[field]).trim();
    }
    for (const field of ["price", "quantity"]) {
      if (req.body[field] !== undefined) updates[field] = Number(req.body[field]);
    }

    const product = await Product.findByIdAndUpdate(req.params.id, updates, {
      new: true,
      runValidators: true,
    });
    if (!product) return res.status(404).json({ message: "Product not found" });
    res.status(200).json({ message: "Product updated successfully", product });
  } catch (error) {
    console.error("Update product error:", error.message);
    res.status(400).json({ message: "Could not update product" });
  }
};

exports.deleteProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) return res.status(404).json({ message: "Product not found" });
    res.status(200).json({ message: "Product deleted successfully" });
  } catch (error) {
    console.error("Delete product error:", error.message);
    res.status(500).json({ message: "Could not delete product" });
  }
};
