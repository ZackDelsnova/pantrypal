const express = require("express");
const router = express.Router();
const {
  getRecipes,
  getRecipeById,
  createRecipe,
  updateRecipe,
  deleteRecipe,
  matchRecipes,
} = require("../controllers/recipeController");
const { protect } = require("../middleware/authMiddleware");
const { admin } = require("../middleware/adminMiddleware");

router.get("/", getRecipes);
router.get("/:id", getRecipeById);
router.post("/match", protect, matchRecipes);
router.post("/", protect, admin, createRecipe);
router.put("/:id", protect, admin, updateRecipe);
router.delete("/:id", protect, admin, deleteRecipe);

module.exports = router;