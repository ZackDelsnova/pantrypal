const Recipe = require("../models/Recipe");

// GET /api/recipes?search=&cuisine=&category=&page=1&limit=20
exports.getRecipes = async (req, res, next) => {
  try {
    const { search, cuisine, category, page = 1, limit = 20 } = req.query;
    const query = {};
    if (search) query.title = { $regex: search, $options: "i" };
    if (cuisine) query.cuisine = cuisine;
    if (category) query.category = category;

    const skip = (Number(page) - 1) * Number(limit);
    const [recipes, total] = await Promise.all([
      Recipe.find(query).skip(skip).limit(Number(limit)).sort({ title: 1 }),
      Recipe.countDocuments(query),
    ]);

    res.json({
      recipes,
      page: Number(page),
      pages: Math.ceil(total / Number(limit)),
      total,
    });
  } catch (err) {
    next(err);
  }
};

// GET /api/recipes/:id
exports.getRecipeById = async (req, res, next) => {
  try {
    const recipe = await Recipe.findById(req.params.id);
    if (!recipe) return res.status(404).json({ message: "Recipe not found" });
    res.json(recipe);
  } catch (err) {
    next(err);
  }
};

// POST /api/recipes  (admin)
exports.createRecipe = async (req, res, next) => {
  try {
    const {
      title,
      description,
      imageUrl,
      cuisine,
      category,
      instructions,
      ingredients,
      youtubeUrl,
    } = req.body;
    if (!title || !ingredients || !ingredients.length) {
      return res
        .status(400)
        .json({ message: "Title and ingredients are required" });
    }
    const exists = await Recipe.findOne({ title });
    if (exists)
      return res.status(400).json({ message: "Recipe with this title exists" });

    const recipe = await Recipe.create({
      title,
      description,
      imageUrl,
      cuisine,
      category,
      instructions: instructions || [],
      ingredients: ingredients.map((i) => i.toLowerCase().trim()),
      youtubeUrl,
      createdBy: req.user._id,
    });
    res.status(201).json(recipe);
  } catch (err) {
    next(err);
  }
};

// PUT /api/recipes/:id  (admin)
exports.updateRecipe = async (req, res, next) => {
  try {
    const recipe = await Recipe.findById(req.params.id);
    if (!recipe) return res.status(404).json({ message: "Recipe not found" });

    const fields = [
      "title",
      "description",
      "imageUrl",
      "cuisine",
      "category",
      "instructions",
      "youtubeUrl",
    ];
    fields.forEach((f) => {
      if (req.body[f] !== undefined) recipe[f] = req.body[f];
    });
    if (req.body.ingredients) {
      recipe.ingredients = req.body.ingredients.map((i) =>
        i.toLowerCase().trim(),
      );
    }

    const updated = await recipe.save();
    res.json(updated);
  } catch (err) {
    next(err);
  }
};

// DELETE /api/recipes/:id  (admin)
exports.deleteRecipe = async (req, res, next) => {
  try {
    const recipe = await Recipe.findByIdAndDelete(req.params.id);
    if (!recipe) return res.status(404).json({ message: "Recipe not found" });
    res.json({ message: "Recipe deleted", _id: recipe._id });
  } catch (err) {
    next(err);
  }
};

// POST /api/recipes/match
// [SPEC_02_IMPLEMENTS_THIS]
// This function body will be REPLACED by SPEC_02_SMART_MATCH.md.
// Generate this stub EXACTLY as written — do not implement logic yet.
exports.matchRecipes = async (req, res) => {
  res
    .status(501)
    .json({ message: "matchRecipes pending SPEC_02 implementation" });
};