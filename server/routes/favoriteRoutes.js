const express = require("express");
const router = express.Router();
const {
  addFavorite,
  getFavorites,
  removeFavorite,
} = require("../controllers/favoriteController");
const { protect } = require("../middleware/authMiddleware");

router.use(protect);

router.route("/").get(getFavorites).post(addFavorite);
router.delete("/:id", removeFavorite);

module.exports = router;