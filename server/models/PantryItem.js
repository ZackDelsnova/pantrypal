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