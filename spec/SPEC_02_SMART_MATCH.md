# SPEC_02_SMART_MATCH.md - for Claude free tier

You are a senior Node.js backend developer. I need you to write EXACTLY two complete files for a MERN project called PantryPal. Output only the two files. Do not explain. Do not add commentary. Do not ask questions.

PROJECT CONTEXT:
PantryPal is a recipe finder. Users enter ingredients they have at home (their "pantry"). The app matches those ingredients against a recipe database and ranks recipes by how many ingredients the user already has. It also generates a shopping list for missing ingredients when the user wants to cook specific recipes.

EXISTING MODELS (already created, do not redefine):

server/models/PantryItem.js exports a Mongoose model with schema:
{
userId: ObjectId (ref User, required),
name: String (lowercase, trimmed),
quantity: String,
category: String,
expiryDate: Date
}

server/models/Recipe.js exports a Mongoose model with schema:
{
title: String (unique),
description: String,
imageUrl: String,
cuisine: String,
category: String,
instructions: [String],
ingredients: [String], // all lowercase, trimmed, unique per recipe
youtubeUrl: String,
createdBy: ObjectId
}

server/models/Favorite.js also exists but is not used in these two files.

AUTH MIDDLEWARE guarantees req.user exists (with _id) before these controllers are called.

=============================================================
FILE 1: server/controllers/recipeController.js
=============================================================

This file must export FIVE functions. The first four are already trivial CRUD — write them as shown. The fifth is the important one.

Imports:
const Recipe = require('../models/Recipe');
const PantryItem = require('../models/PantryItem');

--- Function 1: getRecipes (GET /api/recipes) ---
Query params: search, cuisine, category, page (default 1), limit (default 20)

- If search, filter by title using case-insensitive regex
- If cuisine, exact match
- If category, exact match
- Return: { recipes, page, pages, total }
- Sort by title ascending
- Use skip/limit for pagination

--- Function 2: getRecipeById (GET /api/recipes/:id) ---

- Find by _id
- 404 if not found
- Return the recipe object

--- Function 3: createRecipe (POST /api/recipes, admin only) ---

- Require title and non-empty ingredients array
- Reject if a recipe with same title exists
- Lowercase + trim all ingredients
- Set createdBy = req.user._id
- Return 201 with created recipe

--- Function 4: updateRecipe (PUT /api/recipes/:id, admin only) ---

- Find by _id, 404 if missing
- Update only allowed fields: title, description, imageUrl, cuisine, category, instructions, youtubeUrl
- If ingredients provided, lowercase + trim them
- Return updated recipe

--- Function 5: deleteRecipe (DELETE /api/recipes/:id, admin only) ---

- Find by _id and delete
- 404 if missing
- Return { message, _id }

=============================================================
--- Function 6 (THE IMPORTANT ONE): matchRecipes ---
POST /api/recipes/match
Requires auth (protect middleware already applied at route level)
=============================================================

This is the core feature of the app. It must use MongoDB's AGGREGATION PIPELINE (not JavaScript filtering) to compute match scores. This is required for the project to demonstrate database aggregation skills.

Logic:

1. Fetch all pantry items for the logged-in user: await PantryItem.find({ userId: req.user._id }).select('name')
2. Build array pantryNames = list of lowercase trimmed names
3. If pantryNames is empty, return: { pantryCount: 0, count: 0, recipes: [], message: 'Add ingredients to your pantry first' }
4. Run this aggregation on Recipe:

Recipe.aggregate([
// Step 1: Add computed fields
{
$addFields: {
      matchedIngredients: { $setIntersection: ['$ingredients', pantryNames] },
      missingIngredients: { $setDifference: ['$ingredients', pantryNames] }
    }
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
              { $divide: [{ $size: '$matchedIngredients' }, { $size: '$ingredients' }] },
100
]
}
]
}
}
},
// Step 3: Round matchScore to 1 decimal place using $round
// Step 4: Filter out recipes with matchScore < 15 (too poor a match to be useful)
// Step 5: Sort by matchScore descending, then by title ascending for stable order
// Step 6: Limit to 50 results

1. Return: { pantryCount, pantryIngredients: pantryNames, count, recipes }

CRITICAL REQUIREMENTS:

- Use $setIntersection and $setDifference (aggregation operators, not JS)
- Use $round with 1 decimal place on matchScore
- Each recipe in the response MUST include: _id, title, imageUrl, cuisine, category, ingredients, matchedIngredients, missingIngredients, matchScore
- Handle errors with try/catch and next(err)

=============================================================
FILE 2: server/controllers/shoppingController.js
=============================================================

This file exports ONE function: generateShoppingList.

Imports:
const Recipe = require('../models/Recipe');
const PantryItem = require('../models/PantryItem');

--- Function: generateShoppingList (POST /api/shopping/generate) ---

Body: { recipeIds: [ObjectId, ...] } (array of recipe IDs the user wants to cook)

Logic:

1. Validate recipeIds exists and is a non-empty array → else 400 with message 'recipeIds array required'
2. Fetch recipes: await Recipe.find({ _id: { $in: recipeIds } }).select('title ingredients')
3. If no recipes found → 404 with message 'No recipes found'
4. Fetch user's pantry: await PantryItem.find({ userId: req.user._id }).select('name')
5. Build a Set pantrySet of lowercase trimmed pantry names
6. Count how many selected recipes need each ingredient:
   - ingredientCount = {} object, key = ingredient name, value = number of recipes needing it
   - Loop through recipes, loop through recipe.ingredients, increment count
7. Compute:
   - allIngredients = Object.keys(ingredientCount)
   - haveIngredients = allIngredients.filter(i => pantrySet.has(i))
   - missingIngredients = allIngredients.filter(i => !pantrySet.has(i))
8. Categorize each missing ingredient using this keyword-based heuristic function (paste it exactly):

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

1. Group missing ingredients by category into an object like:
   { Vegetables: [{ name: 'onion', neededInRecipes: 2 }, ...], Protein: [...] }

2. Return JSON:
   {
   recipesIncluded: recipes.map(r => ({ _id: r._id, title: r.title })),
   pantryCount: pantrySet.size,
   totalIngredientsNeeded: allIngredients.length,
   haveCount: haveIngredients.length,
   missingCount: missingIngredients.length,
   missingByCategory: grouped
   }

3. Wrap in try/catch, call next(err) on failure.

=============================================================
OUTPUT FORMAT — READ CAREFULLY
=============================================================

Output EXACTLY two markdown code blocks, in this order:

1. First block labeled: ### FILE: server/controllers/recipeController.js
   Contents: complete file (all 6 functions, CommonJS require/module.exports, no placeholders)

2. Second block labeled: ### FILE: server/controllers/shoppingController.js
   Contents: complete file (generateShoppingList, CommonJS, no placeholders)

RULES:

- Use CommonJS (require, module.exports). NOT ES modules.
- Use async/await with try/catch on every function that touches the DB.
- Call next(err) in catch blocks.
- No console.log except in errors if needed.
- No extra files. No explanations before or after the code blocks. Just the two labeled blocks.
- Verify: matchRecipes MUST use $setIntersection and $setDifference in the aggregation. This is non-negotiable.
