# SPEC_06_SEED_SCRIPT.md - for Claude free tier

You are a senior Node.js developer. Output ONE complete file. No explanations, no commentary, no text outside the single code block.

PROJECT: PantryPal — MERN recipe finder.
TASK: Write the complete `server/seed/seedRunner.js` file.

This file is `require`d by `server/server.js` as:
const runSeedIfEmpty = require('./seed/seedRunner');
await runSeedIfEmpty();

It runs ONCE on server startup. It must be IDEMPOTENT — if data already exists, it does nothing and returns quickly.

===== REQUIREMENTS =====

1. Use CommonJS (`require`, `module.exports`). Not ES modules.

2. Imports:
   const fetch = require('node-fetch'); // v2 (CJS compatible)
   const bcrypt = require('bcryptjs');
   const Recipe = require('../models/Recipe');
   const User = require('../models/User');
   const PantryItem = require('../models/PantryItem');

3. Main exported function:
   module.exports = async function runSeedIfEmpty() { ... }

4. LOGIC FLOW:

   STEP A — Check if already seeded:
   const recipeCount = await Recipe.estimatedDocumentCount();
   if (recipeCount >= 100) {
   console.log(`[SEED] Skipped — ${recipeCount} recipes already in DB`);
   await seedUsers(); // still ensure demo users exist
   return;
   }

   STEP B — Fetch recipes from TheMealDB:
   - Base URL: <https://www.themealdb.com/api/json/v1/1/>
   - Endpoint to use: search.php?f={letter} (search by first letter)
   - Iterate letters 'a' through 'z' (lowercase)
   - For each letter, fetch, parse `data.meals` (may be null)
   - Collect all meals into a Map keyed by `idMeal` to dedupe
   - Stop early once the Map has >= 120 meals (buffer before final 100 cut)
   - Wrap each fetch in try/catch — if a letter fails, log and continue
   - Add a 150ms delay between requests to be polite to the API
   - Use a timeout of 10000ms on each fetch (fetch has no default timeout — wrap with Promise.race or use AbortController)

   STEP C — Transform each meal into our Recipe schema:
   For each meal object: - title: meal.strMeal - description: `A ${meal.strArea || 'delicious'} ${meal.strCategory || 'dish'}.` (short) - imageUrl: meal.strMealThumb - cuisine: meal.strArea || 'Unknown' - category: meal.strCategory || 'Miscellaneous' - youtubeUrl: meal.strYoutube || '' - instructions: array of steps — split meal.strInstructions by /\r?\n+/ and filter empties - ingredients: array of cleaned ingredient names from strIngredient1..strIngredient20: *Loop i = 1 to 20* Read meal[`strIngredient${i}`] *If value is truthy AND trimmed non-empty, add to array* Lowercase + trim each *Also lowercased + trimmed, dedupe within the recipe* Also skip ingredients whose name is longer than 60 chars (data hygiene) - Skip the meal entirely if ingredients.length === 0 or title is empty - createdBy: null

   STEP D — Cap at 100 recipes:
   const recipes = Array.from(mealMap.values()).map(transform).filter(Boolean).slice(0, 100);

   STEP E — Insert recipes:
   - Use `Recipe.insertMany(recipes, { ordered: false })` inside try/catch
   - If duplicate key errors occur (E11000), swallow them — the unique index on `title` prevents dupes
   - Log: `[SEED] Inserted ${result.length} recipes` or log skipped count

   STEP F — Call seedUsers():
   - Check if <admin@pantrypal.com> exists (User.findOne). If not:
     Create admin user:
     name: 'Admin'
     email: '<admin@pantrypal.com>'
     password: 'admin123' // will be hashed by User model's pre-save hook
     role: 'admin'
     dietaryPreference: 'any'
   - Check if <demo@pantrypal.com> exists. If not:
     Create demo user:
     name: 'Demo User'
     email: '<demo@pantrypal.com>'
     password: 'demo123'
     role: 'user'
     dietaryPreference: 'any'
   - IMPORTANT: Do NOT create the user with `User.insertMany` or `User.create` with already-hashed password. Use `new User({...}); await user.save();` OR `User.create({...})` — either works because the pre-save hook hashes.

   STEP G — Seed demo user's pantry (only if user has 0 pantry items):
   - Find demo user
   - const count = await PantryItem.countDocuments({ userId: demoUser._id });
   - If count === 0, insert these pantry items (each with userId = demoUser._id):
     [
     { name: 'chicken', quantity: '500g', category: 'protein' },
     { name: 'rice', quantity: '1kg', category: 'grain' },
     { name: 'onion', quantity: '3', category: 'vegetable' },
     { name: 'garlic', quantity: '1 bulb', category: 'vegetable' },
     { name: 'egg', quantity: '6', category: 'protein' },
     { name: 'soy sauce',quantity: '200ml', category: 'other' },
     { name: 'tomato', quantity: '4', category: 'vegetable' },
     { name: 'pasta', quantity: '500g', category: 'grain' },
     { name: 'cheese', quantity: '200g', category: 'dairy' },
     { name: 'butter', quantity: '100g', category: 'dairy' }
     ]
   - Use insertMany with ordered: false to skip any dupes from the compound unique index

===== ERROR HANDLING =====

- The whole exported function must be wrapped in try/catch at the outer level
- On outer catch: log `[SEED] Fatal error: ${err.message}` and DO NOT throw (server should still boot)
- Every network call must have its own try/catch so one failed letter doesn't kill the seed
- Log prefix everything with `[SEED]`

===== LOGGING STYLE =====

Examples (use these exact formats where applicable):
[SEED] Starting seed check...
[SEED] DB has 0 recipes — fetching from TheMealDB...
[SEED] Fetched 127 unique meals from TheMealDB
[SEED] Inserted 100 recipes
[SEED] Admin user already exists
[SEED] Created demo user
[SEED] Demo pantry already seeded (10 items)
[SEED] Done in 8.4s
[SEED] Skipped — 100 recipes already in DB
[SEED] Letter 'x' fetch failed: timeout

===== TIMEOUT HELPER =====

Since node-fetch@2 doesn't support AbortController timeouts natively in older versions, implement a small wrapper:

const fetchWithTimeout = (url, ms = 10000) => {
return Promise.race([
fetch(url),
new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), ms))
]);
};

===== OUTPUT FORMAT =====

Output EXACTLY one markdown code block:

### FILE: server/seed/seedRunner.js

```javascript
<complete file>
```

Rules:

- No text before or after the block.
- CommonJS only.
- No placeholders, no // TODO.
- Under 220 lines total.
- Comments ONLY where logic is non-obvious (transformation, dedup, timeouts).
- Must run without errors on a fresh MongoDB with zero collections.
