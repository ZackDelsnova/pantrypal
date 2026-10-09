const express = require("express");
const router = express.Router();
const { generateShoppingList } = require("../controllers/shoppingController");
const { protect } = require("../middleware/authMiddleware");

router.post("/generate", protect, generateShoppingList);

module.exports = router;