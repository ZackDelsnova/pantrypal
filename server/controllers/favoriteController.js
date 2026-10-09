const Favorite = require("../models/Favorite");

// POST /api/favorites  { recipeId }
exports.addFavorite = async (req, res, next) => {
  try {
    const { recipeId } = req.body;
    if (!recipeId)
      return res.status(400).json({ message: "recipeId required" });

    const existing = await Favorite.findOne({ userId: req.user._id, recipeId });
    if (existing) return res.status(400).json({ message: "Already favorited" });

    const fav = await Favorite.create({ userId: req.user._id, recipeId });
    res.status(201).json(fav);
  } catch (err) {
    next(err);
  }
};

// GET /api/favorites
exports.getFavorites = async (req, res, next) => {
  try {
    const favs = await Favorite.find({ userId: req.user._id })
      .populate("recipeId")
      .sort({ createdAt: -1 });
    res.json(favs);
  } catch (err) {
    next(err);
  }
};

// DELETE /api/favorites/:id
exports.removeFavorite = async (req, res, next) => {
  try {
    const fav = await Favorite.findOneAndDelete({
      _id: req.params.id,
      userId: req.user._id,
    });
    if (!fav) return res.status(404).json({ message: "Favorite not found" });
    res.json({ message: "Removed", _id: fav._id });
  } catch (err) {
    next(err);
  }
};