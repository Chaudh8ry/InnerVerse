const mongoose = require('mongoose');

const ingredientSchema = new mongoose.Schema({
  ingredient_name: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  analysis_json: {
    type: mongoose.Schema.Types.Mixed,
    required: true,
    // Structure: {
    //   type: String,
    //   tags: [String], // e.g., ["gluten_free", "vegan", "contains_dairy"]
    //   potential_concerns: [{ 
    //     condition: String, 
    //     level: String // "LOW", "MEDIUM", "HIGH"
    //   }]
    // }
  },
  last_analyzed: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Index for faster lookups
ingredientSchema.index({ ingredient_name: 1 });

module.exports = mongoose.model('Ingredient', ingredientSchema);

