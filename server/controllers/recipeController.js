const Recipe = require('../models/Recipe');
const PantryItem = require('../models/PantryItem');

const escapeRegex = (str) => str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const normalizeIngredients = (arr) => {
  const cleaned = arr
    .filter((i) => typeof i === 'string')
    .map((i) => i.toLowerCase().trim())
    .filter((i) => i.length > 0);
  return [...new Set(cleaned)];
};

// GET /api/recipes
const getRecipes = async (req, res, next) => {
  try {
    const { search, cuisine, category } = req.query;
    const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
    const limit = Math.max(parseInt(req.query.limit, 10) || 20, 1);

    const filter = {};
    if (search) {
      filter.title = { $regex: escapeRegex(String(search)), $options: 'i' };
    }
    if (cuisine) {
      filter.cuisine = cuisine;
    }
    if (category) {
      filter.category = category;
    }

    const total = await Recipe.countDocuments(filter);
    const recipes = await Recipe.find(filter)
      .sort({ title: 1 })
      .skip((page - 1) * limit)
      .limit(limit);

    res.json({
      recipes,
      page,
      pages: Math.ceil(total / limit),
      total,
    });
  } catch (err) {
    next(err);
  }
};

// GET /api/recipes/:id
const getRecipeById = async (req, res, next) => {
  try {
    const recipe = await Recipe.findById(req.params.id);
    if (!recipe) {
      return res.status(404).json({ message: 'Recipe not found' });
    }
    res.json(recipe);
  } catch (err) {
    next(err);
  }
};

// POST /api/recipes (admin only)
const createRecipe = async (req, res, next) => {
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

    if (!title || !Array.isArray(ingredients) || ingredients.length === 0) {
      return res
        .status(400)
        .json({ message: 'Title and non-empty ingredients array are required' });
    }

    const cleanedIngredients = normalizeIngredients(ingredients);
    if (cleanedIngredients.length === 0) {
      return res
        .status(400)
        .json({ message: 'Title and non-empty ingredients array are required' });
    }

    const existing = await Recipe.findOne({ title });
    if (existing) {
      return res
        .status(400)
        .json({ message: 'A recipe with this title already exists' });
    }

    const recipe = await Recipe.create({
      title,
      description,
      imageUrl,
      cuisine,
      category,
      instructions,
      ingredients: cleanedIngredients,
      youtubeUrl,
      createdBy: req.user._id,
    });

    res.status(201).json(recipe);
  } catch (err) {
    next(err);
  }
};

// PUT /api/recipes/:id (admin only)
const updateRecipe = async (req, res, next) => {
  try {
    const recipe = await Recipe.findById(req.params.id);
    if (!recipe) {
      return res.status(404).json({ message: 'Recipe not found' });
    }

    const allowedFields = [
      'title',
      'description',
      'imageUrl',
      'cuisine',
      'category',
      'instructions',
      'youtubeUrl',
    ];

    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        recipe[field] = req.body[field];
      }
    });

    if (req.body.ingredients !== undefined) {
      if (!Array.isArray(req.body.ingredients)) {
        return res.status(400).json({ message: 'ingredients must be an array' });
      }
      recipe.ingredients = normalizeIngredients(req.body.ingredients);
    }

    const updated = await recipe.save();
    res.json(updated);
  } catch (err) {
    next(err);
  }
};

// DELETE /api/recipes/:id (admin only)
const deleteRecipe = async (req, res, next) => {
  try {
    const recipe = await Recipe.findByIdAndDelete(req.params.id);
    if (!recipe) {
      return res.status(404).json({ message: 'Recipe not found' });
    }
    res.json({ message: 'Recipe deleted', _id: recipe._id });
  } catch (err) {
    next(err);
  }
};

// POST /api/recipes/match
const matchRecipes = async (req, res, next) => {
  try {
    const pantryItems = await PantryItem.find({ userId: req.user._id }).select(
      'name'
    );

    const pantryNames = [
      ...new Set(
        pantryItems
          .map((item) => (item.name || '').toLowerCase().trim())
          .filter((name) => name.length > 0)
      ),
    ];

    if (pantryNames.length === 0) {
      return res.json({
        pantryCount: 0,
        count: 0,
        recipes: [],
        message: 'Add ingredients to your pantry first',
      });
    }

    const recipes = await Recipe.aggregate([
      // Step 1: Add computed fields
      {
        $addFields: {
          matchedIngredients: { $setIntersection: ['$ingredients', pantryNames] },
          missingIngredients: { $setDifference: ['$ingredients', pantryNames] },
        },
      },
      // Step 2: Compute matchScore as percentage (0-100)
      {
        $addFields: {
          matchScore: {
            $cond: [
              { $eq: [{ $size: '$ingredients' }, 0] },
              0,
              {
                $multiply: [
                  {
                    $divide: [
                      { $size: '$matchedIngredients' },
                      { $size: '$ingredients' },
                    ],
                  },
                  100,
                ],
              },
            ],
          },
        },
      },
      // Step 3: Round matchScore to 1 decimal place
      {
        $addFields: {
          matchScore: { $round: ['$matchScore', 1] },
        },
      },
      // Step 4: Filter out poor matches
      {
        $match: { matchScore: { $gte: 15 } },
      },
      // Step 5: Sort by matchScore desc, then title asc
      {
        $sort: { matchScore: -1, title: 1 },
      },
      // Step 6: Limit to 50 results
      {
        $limit: 50,
      },
      // Project only required fields
      {
        $project: {
          _id: 1,
          title: 1,
          imageUrl: 1,
          cuisine: 1,
          category: 1,
          ingredients: 1,
          matchedIngredients: 1,
          missingIngredients: 1,
          matchScore: 1,
        },
      },
    ]);

    res.json({
      pantryCount: pantryNames.length,
      pantryIngredients: pantryNames,
      count: recipes.length,
      recipes,
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getRecipes,
  getRecipeById,
  createRecipe,
  updateRecipe,
  deleteRecipe,
  matchRecipes,
};