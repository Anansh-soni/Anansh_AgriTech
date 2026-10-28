
const Booking = require("../models/booking");

// Farmers can see only their own bookings. Admins can see all bookings.
exports.getBookings = async (req, res) => {
  try {
    const query = req.user.role === "admin" ? {} : { farmer: req.user._id };
    const bookings = await Booking.find(query)
      .populate("farmer", "name email")
      .populate("product", "name category price")
      .sort({ createdAt: -1 });

    res.status(200).json(bookings);
  } catch (error) {
    console.error("Get bookings error:", error.message);
    res.status(500).json({
      message: "Could not fetch bookings",
    });
  }
};

// Create an expert consultation booking
exports.createBooking = async (req, res) => {
  try {
    const { bookingType = "consultation", expertName, bookingDate, topic, productId, quantity = 1 } = req.body;
    if (!bookingDate || Number.isNaN(Date.parse(bookingDate))) {
      return res.status(400).json({ message: "A valid booking date is required" });
    }

    let bookingData = {
      bookingType,
      farmer: req.user._id,
      bookingDate,
      status: "Pending",
    };

    if (bookingType === "resource") {
      const parsedQuantity = Number(quantity);
      if (!productId || !Number.isInteger(parsedQuantity) || parsedQuantity < 1) {
        return res.status(400).json({ message: "Choose a product and a valid quantity" });
      }
      const Product = require("../models/product");
      const product = await Product.findById(productId);
      if (!product) return res.status(404).json({ message: "Product not found" });
      if (parsedQuantity > product.quantity) {
        return res.status(400).json({ message: "There is not enough stock for that quantity" });
      }
      bookingData = { ...bookingData, product: product._id, quantity: parsedQuantity };
    } else if (bookingType === "consultation") {
      if (!expertName?.trim() || !topic?.trim()) {
        return res.status(400).json({ message: "Expert name and topic are required" });
      }
      bookingData = { ...bookingData, expertName: expertName.trim(), topic: topic.trim() };
    } else {
      return res.status(400).json({ message: "Invalid booking type" });
    }

    const booking = await Booking.create(bookingData);
    await booking.populate("product", "name category price");

    res.status(201).json({
      message: "Consultation booked successfully",
      booking,
    });
  } catch (error) {
    console.error("Create booking error:", error.message);
    res.status(error.name === "ValidationError" || error.name === "CastError" ? 400 : 500).json({
      message: error.name === "ValidationError" || error.name === "CastError"
        ? "Check the booking details and try again"
        : "Could not create booking",
    });
  }
};

exports.updateBookingStatus = async (req, res) => {
  try {
    const allowedStatuses = ["Pending", "Confirmed", "Completed", "Cancelled"];
    if (!allowedStatuses.includes(req.body.status)) {
      return res.status(400).json({ message: "Invalid booking status" });
    }
    const booking = await Booking.findByIdAndUpdate(
      req.params.id,
      { status: req.body.status },
      { new: true, runValidators: true }
    ).populate("farmer", "name email").populate("product", "name category price");
    if (!booking) return res.status(404).json({ message: "Booking not found" });
    res.status(200).json({ message: "Booking status updated", booking });
  } catch (error) {
    console.error("Update booking status error:", error.message);
    res.status(500).json({ message: "Could not update booking" });
  }
};
