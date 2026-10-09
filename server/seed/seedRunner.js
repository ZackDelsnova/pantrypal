const fetch = require('node-fetch'); // v2 (CJS compatible)
const bcrypt = require('bcryptjs');
const Recipe = require('../models/Recipe');
const User = require('../models/User');
const PantryItem = require('../models/PantryItem');

const BASE_URL = 'https://www.themealdb.com/api/json/v1/1/';
const TARGET_RECIPES = 100;
const FETCH_BUFFER = 120;
const DELAY_MS = 150;

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// node-fetch v2 has no native timeout support in older versions, so race against a timer
const fetchWithTimeout = (url, ms = 10000) => {
  let timer;
  const timeout = new Promise((_, reject) => {
    timer = setTimeout(() => reject(new Error('timeout')), ms);
  });
  return Promise.race([fetch(url), timeout]).finally(() => clearTimeout(timer));
};

const transformMeal = (meal) => {
  const title = (meal.strMeal || '').trim();
  if (!title) return null;

  // Collect ingredient names; lowercase + trim, dedupe within recipe, drop overlong names
  const ingredientSet = new Set();
  for (let i = 1; i <= 20; i++) {
    const raw = meal[`strIngredient${i}`];
    if (!raw || !String(raw).trim()) continue;
    const name = String(raw).toLowerCase().trim();
    if (name.length > 60) continue;
    ingredientSet.add(name);
  }
  const ingredients = Array.from(ingredientSet);
  if (ingredients.length === 0) return null;

  const instructions = (meal.strInstructions || '')
    .split(/\r?\n+/)
    .map((step) => step.trim())
    .filter(Boolean);

  return {
    title,
    description: `A ${meal.strArea || 'delicious'} ${meal.strCategory || 'dish'}.`,
    imageUrl: meal.strMealThumb,
    cuisine: meal.strArea || 'Unknown',
    category: meal.strCategory || 'Miscellaneous',
    youtubeUrl: meal.strYoutube || '',
    instructions,
    ingredients,
    createdBy: null,
  };
};

const fetchAllMeals = async () => {
  const mealMap = new Map(); // keyed by idMeal to dedupe
  const letters = 'abcdefghijklmnopqrstuvwxyz'.split('');

  for (const letter of letters) {
    if (mealMap.size >= FETCH_BUFFER) break;
    try {
      const res = await fetchWithTimeout(`${BASE_URL}search.php?f=${letter}`, 10000);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      (data.meals || []).forEach((meal) => {
        if (meal && meal.idMeal) mealMap.set(meal.idMeal, meal);
      });
    } catch (err) {
      console.log(`[SEED] Letter '${letter}' fetch failed: ${err.message}`);
    }
    await sleep(DELAY_MS);
  }
  return mealMap;
};

const seedRecipes = async () => {
  console.log('[SEED] DB has 0 recipes — fetching from TheMealDB...');
  const mealMap = await fetchAllMeals();
  console.log(`[SEED] Fetched ${mealMap.size} unique meals from TheMealDB`);

  const recipes = Array.from(mealMap.values())
    .map(transformMeal)
    .filter(Boolean)
    .slice(0, TARGET_RECIPES);

  if (recipes.length === 0) {
    console.log('[SEED] No valid recipes to insert');
    return;
  }

  try {
    const result = await Recipe.insertMany(recipes, { ordered: false });
    console.log(`[SEED] Inserted ${result.length} recipes`);
  } catch (err) {
    // With ordered:false, duplicate-key (E11000) errors are expected and swallowed
    const inserted = err.insertedDocs ? err.insertedDocs.length : 0;
    const isDupe = err.code === 11000 || (err.writeErrors && err.writeErrors.every((e) => e.code === 11000));
    if (isDupe) {
      console.log(`[SEED] Inserted ${inserted} recipes, skipped ${recipes.length - inserted} duplicates`);
    } else {
      console.log(`[SEED] Recipe insert error: ${err.message}`);
    }
  }
};

const ensureUser = async (label, fields) => {
  const existing = await User.findOne({ email: fields.email });
  if (existing) {
    console.log(`[SEED] ${label} user already exists`);
    return existing;
  }
  // Plain password here — the User model's pre-save hook hashes it
  const user = new User(fields);
  await user.save();
  console.log(`[SEED] Created ${label.toLowerCase()} user`);
  return user;
};

const seedPantry = async (demoUser) => {
  const count = await PantryItem.countDocuments({ userId: demoUser._id });
  if (count > 0) {
    console.log(`[SEED] Demo pantry already seeded (${count} items)`);
    return;
  }

  const items = [
    { name: 'chicken', quantity: '500g', category: 'protein' },
    { name: 'rice', quantity: '1kg', category: 'grain' },
    { name: 'onion', quantity: '3', category: 'vegetable' },
    { name: 'garlic', quantity: '1 bulb', category: 'vegetable' },
    { name: 'egg', quantity: '6', category: 'protein' },
    { name: 'soy sauce', quantity: '200ml', category: 'other' },
    { name: 'tomato', quantity: '4', category: 'vegetable' },
    { name: 'pasta', quantity: '500g', category: 'grain' },
    { name: 'cheese', quantity: '200g', category: 'dairy' },
    { name: 'butter', quantity: '100g', category: 'dairy' },
  ].map((item) => ({ ...item, userId: demoUser._id }));

  try {
    const result = await PantryItem.insertMany(items, { ordered: false });
    console.log(`[SEED] Seeded demo pantry (${result.length} items)`);
  } catch (err) {
    console.log(`[SEED] Pantry seed warning: ${err.message}`);
  }
};

const seedUsers = async () => {
  await ensureUser('Admin', {
    name: 'Admin',
    email: 'admin@pantrypal.com',
    password: 'admin123',
    role: 'admin',
    dietaryPreference: 'any',
  });

  const demoUser = await ensureUser('Demo', {
    name: 'Demo User',
    email: 'demo@pantrypal.com',
    password: 'demo123',
    role: 'user',
    dietaryPreference: 'any',
  });

  await seedPantry(demoUser);
};

module.exports = async function runSeedIfEmpty() {
  const start = Date.now();
  try {
    console.log('[SEED] Starting seed check...');

    const recipeCount = await Recipe.estimatedDocumentCount();
    if (recipeCount >= TARGET_RECIPES) {
      console.log(`[SEED] Skipped — ${recipeCount} recipes already in DB`);
      await seedUsers(); // still ensure demo users exist
      return;
    }

    await seedRecipes();
    await seedUsers();

    console.log(`[SEED] Done in ${((Date.now() - start) / 1000).toFixed(1)}s`);
  } catch (err) {
    console.log(`[SEED] Fatal error: ${err.message}`);
  }
};