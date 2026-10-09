# SPEC_01_BACKEND.md — Express + MongoDB Backend

> **INPUT:** This file + SPEC_00_OVERVIEW.md
> **OUTPUT:** All files under `server/` EXCEPT the two functions marked
> `[SPEC_02_IMPLEMENTS_THIS]` — those get stub bodies, replaced later by Claude.
> **ORDER:** Generate in the exact order below. Do not skip or reorder.

---

## INSTRUCTION

Read this file and SPEC_00_OVERVIEW.md completely first. Then generate every
file below in order. Use `edit_format: diff`. Commit after each numbered section.

Do NOT invent additional endpoints, models, or files. Do NOT use TypeScript.
Do NOT use ES modules in server — use CommonJS (`require`/`module.exports`).
Client will use ES modules, but server stays CommonJS.

---

## 1. server/package.json

```json
{
  "name": "pantrypal-server",
  "version": "1.0.0",
  "description": "PantryPal backend — Express + MongoDB",
  "main": "server.js",
  "scripts": {
    "start": "node server.js",
    "dev": "nodemon server.js",
    "seed": "node seed/seedRunner.js"
  },
  "dependencies": {
    "bcryptjs": "^2.4.3",
    "cors": "^2.8.5",
    "dotenv": "^16.4.5",
    "express": "^4.19.2",
    "jsonwebtoken": "^9.0.2",
    "mongoose": "^8.6.0",
    "node-fetch": "^2.7.0"
  },
  "devDependencies": {
    "nodemon": "^3.1.4"
  }
}
```

Note: `node-fetch@2` is CommonJS-compatible. Do NOT use v3 (ESM-only).

---

## 2. server/.env

```env
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/pantrypal
JWT_SECRET=pantrypal_super_secret_key_change_me
JWT_EXPIRES_IN=7d
NODE_ENV=development
```

Also create `server/.env.example` with the same content (no secrets change needed for this project).

---

## 3. server/config/db.js

```javascript
const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`[DB] MongoDB connected: ${conn.connection.host}`);
  } catch (err) {
    console.error(`[DB] Connection error: ${err.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
```

---

## 4. server/models/User.js

```javascript
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, "Invalid email format"],
    },
    password: { type: String, required: true, minlength: 6 },
    dietaryPreference: {
      type: String,
      enum: ["veg", "non-veg", "vegan", "any"],
      default: "any",
    },
    allergies: { type: [String], default: [] },
    role: { type: String, enum: ["user", "admin"], default: "user" },
  },
  { timestamps: true },
);

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

userSchema.methods.matchPassword = async function (entered) {
  return bcrypt.compare(entered, this.password);
};

module.exports = mongoose.model("User", userSchema);
```

---

## 5. server/models/PantryItem.js

```javascript
const mongoose = require("mongoose");

const pantryItemSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    name: { type: String, required: true, trim: true, lowercase: true },
    quantity: { type: String, default: "1" },
    category: {
      type: String,
      enum: [
        "protein",
        "vegetable",
        "fruit",
        "dairy",
        "grain",
        "spice",
        "other",
      ],
      default: "other",
    },
    expiryDate: { type: Date, default: null },
  },
  { timestamps: true },
);

pantryItemSchema.index({ userId: 1, name: 1 }, { unique: true });

module.exports = mongoose.model("PantryItem", pantryItemSchema);
```

Note: compound unique index prevents the same user adding "chicken" twice.

---

## 6. server/models/Recipe.js

```javascript
const mongoose = require("mongoose");

const recipeSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, unique: true, trim: true },
    description: { type: String, default: "" },
    imageUrl: { type: String, default: "" },
    cuisine: { type: String, default: "Unknown" },
    category: { type: String, default: "Miscellaneous" },
    instructions: { type: [String], default: [] },
    ingredients: {
      type: [String],
      required: true,
      lowercase: true,
      trim: true,
    },
    youtubeUrl: { type: String, default: "" },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
  },
  { timestamps: true },
);

recipeSchema.index({ title: "text" });

module.exports = mongoose.model("Recipe", recipeSchema);
```

---

## 7. server/models/Favorite.js

```javascript
const mongoose = require("mongoose");

const favoriteSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    recipeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Recipe",
      required: true,
    },
  },
  { timestamps: true },
);

favoriteSchema.index({ userId: 1, recipeId: 1 }, { unique: true });

module.exports = mongoose.model("Favorite", favoriteSchema);
```

---

## 8. server/middleware/authMiddleware.js

```javascript
const jwt = require("jsonwebtoken");
const User = require("../models/User");

const protect = async (req, res, next) => {
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer ")
  ) {
    token = req.headers.authorization.split(" ")[1];
  }
  if (!token) {
    return res.status(401).json({ message: "Not authorized, no token" });
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decoded.id).select("-password");
    if (!req.user) return res.status(401).json({ message: "User not found" });
    next();
  } catch (err) {
    return res.status(401).json({ message: "Not authorized, token failed" });
  }
};

module.exports = { protect };
```

---

## 9. server/middleware/adminMiddleware.js

```javascript
const admin = (req, res, next) => {
  if (req.user && req.user.role === "admin") return next();
  return res.status(403).json({ message: "Admin access required" });
};

module.exports = { admin };
```

---

## 10. server/middleware/errorMiddleware.js

```javascript
const notFound = (req, res, next) => {
  res.status(404);
  next(new Error(`Not Found - ${req.originalUrl}`));
};

const errorHandler = (err, req, res, next) => {
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  console.error(`[ERROR] ${err.message}`);
  res.status(statusCode).json({
    message: err.message,
    stack: process.env.NODE_ENV === "production" ? undefined : err.stack,
  });
};

module.exports = { notFound, errorHandler };
```

---

## 11. server/controllers/authController.js

```javascript
const jwt = require("jsonwebtoken");
const User = require("../models/User");

const generateToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "7d",
  });

// POST /api/auth/register
exports.register = async (req, res, next) => {
  try {
    const { name, email, password, dietaryPreference } = req.body;
    if (!name || !email || !password) {
      return res
        .status(400)
        .json({ message: "Name, email, password required" });
    }
    const exists = await User.findOne({ email });
    if (exists)
      return res.status(400).json({ message: "Email already registered" });

    const user = await User.create({
      name,
      email,
      password,
      dietaryPreference: dietaryPreference || "any",
    });

    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      dietaryPreference: user.dietaryPreference,
      token: generateToken(user._id),
    });
  } catch (err) {
    next(err);
  }
};

// POST /api/auth/login
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({ message: "Invalid email or password" });
    }
    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      dietaryPreference: user.dietaryPreference,
      allergies: user.allergies,
      token: generateToken(user._id),
    });
  } catch (err) {
    next(err);
  }
};

// GET /api/auth/profile
exports.getProfile = async (req, res) => {
  res.json(req.user);
};

// PUT /api/auth/profile
exports.updateProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: "User not found" });

    user.name = req.body.name ?? user.name;
    user.dietaryPreference =
      req.body.dietaryPreference ?? user.dietaryPreference;
    user.allergies = req.body.allergies ?? user.allergies;
    if (req.body.password) user.password = req.body.password;

    const updated = await user.save();
    res.json({
      _id: updated._id,
      name: updated.name,
      email: updated.email,
      role: updated.role,
      dietaryPreference: updated.dietaryPreference,
      allergies: updated.allergies,
    });
  } catch (err) {
    next(err);
  }
};
```

---

## 12. server/controllers/pantryController.js

```javascript
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
```

---

## 13. server/controllers/recipeController.js

```javascript
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
```

---

## 14. server/controllers/favoriteController.js

```javascript
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
```

---

## 15. server/controllers/shoppingController.js

```javascript
// POST /api/shopping/generate  { recipeIds: [] }
// [SPEC_02_IMPLEMENTS_THIS]
// This function body will be REPLACED by SPEC_02_SMART_MATCH.md.
exports.generateShoppingList = async (req, res) => {
  res
    .status(501)
    .json({ message: "generateShoppingList pending SPEC_02 implementation" });
};
```

---

## 16. server/routes/authRoutes.js

```javascript
const express = require("express");
const router = express.Router();
const {
  register,
  login,
  getProfile,
  updateProfile,
} = require("../controllers/authController");
const { protect } = require("../middleware/authMiddleware");

router.post("/register", register);
router.post("/login", login);
router.get("/profile", protect, getProfile);
router.put("/profile", protect, updateProfile);

module.exports = router;
```

---

## 17. server/routes/pantryRoutes.js

```javascript
const express = require("express");
const router = express.Router();
const {
  getPantry,
  addPantryItem,
  updatePantryItem,
  deletePantryItem,
  clearPantry,
} = require("../controllers/pantryController");
const { protect } = require("../middleware/authMiddleware");

router.use(protect);

router.route("/").get(getPantry).post(addPantryItem);
router.delete("/clear", clearPantry);
router.route("/:id").put(updatePantryItem).delete(deletePantryItem);

module.exports = router;
```

Order matters: `/clear` MUST be defined before `/:id` in Express 4.

---

## 18. server/routes/recipeRoutes.js

```javascript
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
```

Order matters: `/match` MUST come BEFORE `/:id` in POST chain? No — `/match` is POST, `/:id` is GET/PUT/DELETE. They don't conflict. Fine as written.

---

## 19. server/routes/favoriteRoutes.js

```javascript
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
```

---

## 20. server/routes/shoppingRoutes.js

```javascript
const express = require("express");
const router = express.Router();
const { generateShoppingList } = require("../controllers/shoppingController");
const { protect } = require("../middleware/authMiddleware");

router.post("/generate", protect, generateShoppingList);

module.exports = router;
```

---

## 21. server/server.js

```javascript
require("dotenv").config();
const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");
const { notFound, errorHandler } = require("./middleware/errorMiddleware");
const runSeedIfEmpty = require("./seed/seedRunner");

const authRoutes = require("./routes/authRoutes");
const pantryRoutes = require("./routes/pantryRoutes");
const recipeRoutes = require("./routes/recipeRoutes");
const favoriteRoutes = require("./routes/favoriteRoutes");
const shoppingRoutes = require("./routes/shoppingRoutes");

const app = express();

app.use(cors({ origin: "http://localhost:5173", credentials: true }));
app.use(express.json({ limit: "2mb" }));

app.get("/api/health", (req, res) => res.json({ status: "ok" }));

app.use("/api/auth", authRoutes);
app.use("/api/pantry", pantryRoutes);
app.use("/api/recipes", recipeRoutes);
app.use("/api/favorites", favoriteRoutes);
app.use("/api/shopping", shoppingRoutes);

app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

const start = async () => {
  await connectDB();
  await runSeedIfEmpty();
  app.listen(PORT, () =>
    console.log(`[SERVER] Running on http://localhost:${PORT}`),
  );
};

start();
```

---

## 22. server/seed/seedRunner.js — STUB ONLY

```javascript
// [SPEC_06_IMPLEMENTS_THIS]
// Full seed logic will be provided by SPEC_06_SEED_SCRIPT.md.
// For now, this stub allows the server to boot without crashing.
module.exports = async function runSeedIfEmpty() {
  console.log("[SEED] Stub — full seed pending SPEC_06");
};
```

---

## GENERATION COMPLETE

After generating all 22 sections above:

1. Run `cd server && npm install`
2. Confirm `node server.js` boots without errors (it will connect to Mongo, run the stub seed, then listen on 5000)
3. Commit with message: `feat(server): backend scaffolding — models, controllers, routes, middleware`

Do NOT touch `client/` yet. That is SPEC_03.

END OF SPEC_01
