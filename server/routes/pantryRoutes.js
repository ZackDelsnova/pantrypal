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