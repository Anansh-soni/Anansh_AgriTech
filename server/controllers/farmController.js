
const Farm = require("../models/farm");
const Crop = require("../models/crop");

// Get farms belonging to the logged-in farmer
exports.getFarms = async (req, res) => {
  try {
    const farms = await Farm.find({
      farmer: req.user._id,
    }).sort({ createdAt: -1 });

    res.status(200).json(farms);
  } catch (error) {
    console.error("Get farms error:", error.message);
    res.status(500).json({
      message: "Could not fetch your farms",
    });
  }
};

// Create a farm for the logged-in farmer
exports.createFarm = async (req, res) => {
  try {
    const { farmName, location, landArea, soilType } = req.body;

    if (!farmName?.trim() || !location?.trim()) {
      return res.status(400).json({
        message: "Farm name and location are required",
      });
    }

    const parsedLandArea = landArea === undefined || landArea === "" ? 0 : Number(landArea);
    if (!Number.isFinite(parsedLandArea) || parsedLandArea < 0) {
      return res.status(400).json({ message: "Land area must be a valid non-negative number" });
    }

    const farm = await Farm.create({
      farmer: req.user._id,
      farmName: farmName.trim(),
      location: location.trim(),
      landArea: parsedLandArea,
      soilType: soilType?.trim() || "Not specified",
    });

    res.status(201).json({
      message: "Farm created successfully",
      farm,
    });
  } catch (error) {
    console.error("Create farm error:", error.message);
    res.status(error.name === "ValidationError" || error.name === "CastError" ? 400 : 500).json({
      message: error.name === "ValidationError" || error.name === "CastError"
        ? "Check the farm details and try again"
        : "Could not create farm",
    });
  }
};

exports.updateFarm = async (req, res) => {
  try {
    const { farmName, location, landArea, soilType } = req.body;
    const updates = {};

    if (farmName !== undefined) {
      if (!farmName.trim()) return res.status(400).json({ message: "Farm name is required" });
      updates.farmName = farmName.trim();
    }
    if (location !== undefined) {
      if (!location.trim()) return res.status(400).json({ message: "Farm location is required" });
      updates.location = location.trim();
    }
    if (landArea !== undefined && landArea !== "") {
      const parsedLandArea = Number(landArea);
      if (!Number.isFinite(parsedLandArea) || parsedLandArea < 0) {
        return res.status(400).json({ message: "Land area must be a valid non-negative number" });
      }
      updates.landArea = parsedLandArea;
    }
    if (soilType !== undefined) updates.soilType = soilType.trim() || "Not specified";

    const farm = await Farm.findOneAndUpdate(
      { _id: req.params.id, farmer: req.user._id },
      updates,
      { new: true, runValidators: true }
    );

    if (!farm) return res.status(404).json({ message: "Farm not found" });
    res.status(200).json({ message: "Farm updated successfully", farm });
  } catch (error) {
    console.error("Update farm error:", error.message);
    res.status(400).json({ message: "Could not update farm" });
  }
};

exports.deleteFarm = async (req, res) => {
  try {
    const farm = await Farm.findOneAndDelete({
      _id: req.params.id,
      farmer: req.user._id,
    });

    if (!farm) return res.status(404).json({ message: "Farm not found" });

    await Crop.deleteMany({ farm: farm._id });
    res.status(200).json({ message: "Farm and its crop records deleted" });
  } catch (error) {
    console.error("Delete farm error:", error.message);
    res.status(500).json({ message: "Could not delete farm" });
  }
};
