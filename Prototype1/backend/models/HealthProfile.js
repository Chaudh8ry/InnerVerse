const mongoose = require('mongoose');

const healthProfileSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  age_group: {
    type: String,
    required: true,
    enum: ['0-11months', '1-4years', '5-9years', '10-19years', '20-39years', '40-59years', '60+years']
  },
  allergies: [{
    type: String,
    enum: ['Milk/Dairy', 'Eggs', 'Peanuts', 'Tree Nuts', 'Fish', 'Shellfish', 
           'Wheat/Gluten', 'Soy', 'Sesame', 'Sulfites', 'Other']
  }],
  health_conditions: [{
    category: {
      type: String,
      enum: ['undernutrition', 'micronutrientDeficiency', 'overnutrition', 'chronicDiseases', 'lifestyle', 'specialNeeds']
    },
    condition: {
      type: String,
      required: true
    }
  }],
  dietary_preferences: [{
    type: String
  }],
  additional_info: {
    type: String,
    maxlength: 2000
  },
  body_metrics: {
    height: {
      type: Number
    },
    weight: {
      type: Number
    },
    unit: {
      type: String,
      enum: ['metric', 'imperial'],
      default: 'metric'
    },
    bmi: {
      type: Number
    }
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('HealthProfile', healthProfileSchema);

