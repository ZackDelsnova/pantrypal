const PantryItem = require("../models/PantryItem");

// GET /api/pantry
exports.getPantry = async (req, res, next) => {
  try {
    const items = await PantryItem.find({ userId: req.user._id }).sort({
      createdAt: -1,
    });
    res.json(items);
  } catch (err) {
    next(err);
  }
};

// POST /api/pantry
exports.addPantryItem = async (req, res, next) => {
  try {
    const { name, quantity, category, expiryDate } = req.body;
    if (!name)
      return res.status(400).json({ message: "Ingredient name is required" });

    const existing = await PantryItem.findOne({
      userId: req.user._id,
      name: name.toLowerCase().trim(),
    });
    if (existing)
      return res.status(400).json({ message: "Ingredient already in pantry" });

    const item = await PantryItem.create({
      userId: req.user._id,
      name: name.toLowerCase().trim(),
      quantity: quantity || "1",
      category: category || "other",
      expiryDate: expiryDate || null,
    });
    res.status(201).json(item);
  } catch (err) {
    next(err);
  }
};

// PUT /api/pantry/:id
exports.updatePantryItem = async (req, res, next) => {
  try {
    const item = await PantryItem.findOne({
      _id: req.params.id,
      userId: req.user._id,
    });
    if (!item) return res.status(404).json({ message: "Item not found" });

    if (req.body.name) item.name = req.body.name.toLowerCase().trim();
    if (req.body.quantity !== undefined) item.quantity = req.body.quantity;
    if (req.body.category) item.category = req.body.category;
    if (req.body.expiryDate !== undefined)
      item.expiryDate = req.body.expiryDate;

    const updated = await item.save();
    res.json(updated);
  } catch (err) {
    next(err);
  }
};

// DELETE /api/pantry/:id
exports.deletePantryItem = async (req, res, next) => {
  try {
    const item = await PantryItem.findOneAndDelete({
      _id: req.params.id,
      userId: req.user._id,
    });
    if (!item) return res.status(404).json({ message: "Item not found" });
    res.json({ message: "Item removed", _id: item._id });
  } catch (err) {
    next(err);
  }
};

// DELETE /api/pantry/clear
exports.clearPantry = async (req, res, next) => {
  try {
    const result = await PantryItem.deleteMany({ userId: req.user._id });
    res.json({ message: "Pantry cleared", deletedCount: result.deletedCount });
  } catch (err) {
    next(err);
  }
};