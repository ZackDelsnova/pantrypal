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