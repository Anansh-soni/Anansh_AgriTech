const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");

dotenv.config();

const connectDB = require("./config/db");
const userRoutes = require("./routes/userRoutes");
const productRoutes = require("./routes/productRoutes");
const farmRoutes = require("./routes/farmRoutes");
const cropRoutes = require("./routes/cropRoutes");
const bookingRoutes = require("./routes/bookingRoutes");
const adminRoutes = require("./routes/adminRoutes");

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Database connection
connectDB();

// Health check
app.get("/", (req, res) => {
  res.json({
    message: "AgriTech backend is running successfully! 🌱",
  });
});

// API routes
app.use("/api/users", userRoutes);

app.use("/api/products", productRoutes);
app.use("/api/farms", farmRoutes);
app.use("/api/crops", cropRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/admin", adminRoutes);

const PORT = process.env.PORT || 8000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
