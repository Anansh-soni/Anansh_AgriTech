const Crop = require("../models/crop");
const Farm = require("../models/farm");

// Get crops belonging to the logged-in farmer
exports.getCrops = async (req, res) => {
  try {
    const farms = await Farm.find({ farmer: req.user._id }).select("_id");
    const farmIds = farms.map((farm) => farm._id);

    const crops = await Crop.find({ farm: { $in: farmIds } })
      .populate("farm", "farmName location")
      .sort({ createdAt: -1 });

    res.status(200).json(crops);
  } catch (error) {
    console.error("Get crops error:", error.message);
    res.status(500).json({
      message: "Could not fetch your crops",
    });
  }
};

// Add a crop to one of the logged-in farmer's farms
exports.createCrop = async (req, res) => {
  try {
    const { farm, cropName, variety, plantingDate, status } = req.body;

    if (!farm || !cropName?.trim() || !plantingDate) {
      return res.status(400).json({
        message: "Farm, crop name, and planting date are required",
      });
    }

    const farmerFarm = await Farm.findOne({
      _id: farm,
      farmer: req.user._id,
    });

    if (!farmerFarm) {
      return res.status(404).json({
        message: "Farm not found",
      });
    }

    const crop = await Crop.create({
      farm: farmerFarm._id,
      cropName: cropName.trim(),
      variety: variety?.trim() || "",
      plantingDate,
      status,
    });

    const populatedCrop = await crop.populate("farm", "farmName location");

    res.status(201).json({
      message: "Crop added successfully",
      crop: populatedCrop,
    });
  } catch (error) {
    console.error("Create crop error:", error.message);
    res.status(error.name === "ValidationError" || error.name === "CastError" ? 400 : 500).json({
      message: error.name === "ValidationError" || error.name === "CastError"
        ? "Check the crop details and try again"
        : "Could not add crop",
    });
  }
};

// Update a crop owned by the logged-in farmer
exports.updateCrop = async (req, res) => {
  try {
    const crop = await Crop.findById(req.params.id);

    if (!crop) {
      return res.status(404).json({ message: "Crop not found" });
    }

    const farm = await Farm.findOne({
      _id: crop.farm,
      farmer: req.user._id,
    });

    if (!farm) {
      return res.status(404).json({ message: "Crop not found" });
    }

    const allowedFields = ["cropName", "variety", "plantingDate", "status"];
    for (const field of allowedFields) {
      if (req.body[field] !== undefined) {
        crop[field] = typeof req.body[field] === "string"
          ? req.body[field].trim()
          : req.body[field];
      }
    }

    await crop.save();
    await crop.populate("farm", "farmName location");
    res.status(200).json({ message: "Crop updated successfully", crop });
  } catch (error) {
    console.error("Update crop error:", error.message);
    res.status(400).json({ message: "Could not update crop" });
  }
};

// Delete a crop owned by the logged-in farmer
exports.deleteCrop = async (req, res) => {
  try {
    const farms = await Farm.find({ farmer: req.user._id }).select("_id");
    const farmIds = farms.map((farm) => farm._id);
    const crop = await Crop.findOneAndDelete({
      _id: req.params.id,
      farm: { $in: farmIds },
    });

    if (!crop) {
      return res.status(404).json({ message: "Crop not found" });
    }

    res.status(200).json({ message: "Crop deleted successfully" });
  } catch (error) {
    console.error("Delete crop error:", error.message);
    res.status(500).json({ message: "Could not delete crop" });
  }
};
