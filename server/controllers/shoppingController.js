const Recipe = require('../models/Recipe');
const PantryItem = require('../models/PantryItem');

const categorize = (name) => {
  const n = name.toLowerCase();
  const veg = ['onion','garlic','tomato','potato','carrot','spinach','pepper','chili','ginger','lemon','lime','cabbage','broccoli','cauliflower','cucumber','lettuce','mushroom','peas','corn'];
  const protein = ['chicken','beef','pork','fish','shrimp','prawn','egg','tofu','paneer','lamb','turkey','bacon','sausage'];
  const dairy = ['milk','cheese','butter','yogurt','cream'];
  const grain = ['rice','pasta','bread','flour','noodle','oat','quinoa','wheat','tortilla'];
  const spice = ['salt','pepper','cumin','turmeric','coriander','paprika','oregano','thyme','basil','cinnamon','clove','cardamom','garam masala'];
  const fruit = ['apple','banana','orange','mango','grape','berry','strawberry','blueberry','pineapple','watermelon'];
  if (veg.some(v => n.includes(v))) return 'Vegetables';
  if (protein.some(p => n.includes(p))) return 'Protein';
  if (dairy.some(d => n.includes(d))) return 'Dairy';
  if (grain.some(g => n.includes(g))) return 'Grains';
  if (spice.some(s => n.includes(s))) return 'Spices';
  if (fruit.some(f => n.includes(f))) return 'Fruits';
  return 'Other';
};

// POST /api/shopping/generate
const generateShoppingList = async (req, res, next) => {
  try {
    const { recipeIds } = req.body;

    if (!recipeIds || !Array.isArray(recipeIds) || recipeIds.length === 0) {
      return res.status(400).json({ message: 'recipeIds array required' });
    }

    const recipes = await Recipe.find({ _id: { $in: recipeIds } }).select(
      'title ingredients'
    );

    if (!recipes || recipes.length === 0) {
      return res.status(404).json({ message: 'No recipes found' });
    }

    const pantryItems = await PantryItem.find({ userId: req.user._id }).select(
      'name'
    );

    const pantrySet = new Set(
      pantryItems
        .map((item) => (item.name || '').toLowerCase().trim())
        .filter((name) => name.length > 0)
    );

    const ingredientCount = {};
    for (const recipe of recipes) {
      for (const ingredient of recipe.ingredients) {
        ingredientCount[ingredient] = (ingredientCount[ingredient] || 0) + 1;
      }
    }

    const allIngredients = Object.keys(ingredientCount);
    const haveIngredients = allIngredients.filter((i) => pantrySet.has(i));
    const missingIngredients = allIngredients.filter((i) => !pantrySet.has(i));

    const grouped = {};
    for (const name of missingIngredients) {
      const category = categorize(name);
      if (!grouped[category]) {
        grouped[category] = [];
      }
      grouped[category].push({
        name,
        neededInRecipes: ingredientCount[name],
      });
    }

    res.json({
      recipesIncluded: recipes.map((r) => ({ _id: r._id, title: r.title })),
      pantryCount: pantrySet.size,
      totalIngredientsNeeded: allIngredients.length,
      haveCount: haveIngredients.length,
      missingCount: missingIngredients.length,
      missingByCategory: grouped,
    });
  } catch (err) {
    next(err);
  }
};

module.exports = { generateShoppingList };