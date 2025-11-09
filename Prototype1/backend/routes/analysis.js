const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs').promises;
const Ingredient = require('../models/Ingredient');
const HealthProfile = require('../models/HealthProfile');
const GeminiAPI = require('../utils/geminiApi');
const RulesEngine = require('../utils/rulesEngine');
const auth = require('../middleware/auth');

const router = express.Router();

// Configure multer for image uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'food-label-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  }
});

// Initialize APIs
const geminiApi = new GeminiAPI();
const rulesEngine = new RulesEngine();

// @route   POST /api/analysis/extract-ingredients
// @desc    Extract ingredients from uploaded food label image
// @access  Private
router.post('/extract-ingredients', auth, upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No image file uploaded' });
    }

    // Read the uploaded image
    const imagePath = req.file.path;
    const imageBuffer = await fs.readFile(imagePath);
    const imageBase64 = imageBuffer.toString('base64');

    // Step 1: Smart OCR - Extract ingredients and nutrition table
    const scannedData = await geminiApi.extractIngredientsFromImage(imageBase64);

    // Clean up the uploaded file
    await fs.unlink(imagePath);

    // Format ingredients for frontend display
    const extractedText = scannedData.ingredients_list.map(item => 
      item.percent ? `${item.ingredient} (${item.percent})` : item.ingredient
    ).join(', ');

    res.json({
      message: 'Data extracted successfully',
      scanned_ingredients_list: scannedData.ingredients_list,
      scanned_nutrition_table: scannedData.nutrition_table,
      extracted_text: extractedText,
      ingredients_list: scannedData.ingredients_list.map(item => item.ingredient),
      image_processed: true
    });

  } catch (error) {
    // Clean up file if it exists
    if (req.file) {
      try {
        await fs.unlink(req.file.path);
      } catch (unlinkError) {
        console.error('Error cleaning up file:', unlinkError);
      }
    }

    console.error('Ingredient extraction error:', error);
    res.status(500).json({ 
      message: 'Failed to extract ingredients from image',
      error: error.message 
    });
  }
});

// @route   POST /api/analysis/analyze-ingredients
// @desc    Analyze confirmed ingredients list and nutrition table, generate personalized report with DRI
// @access  Private
router.post('/analyze-ingredients', auth, async (req, res) => {
  try {
    const { scanned_ingredients_list, scanned_nutrition_table, product_name } = req.body;

    // Expect scanned_ingredients_list to be an array of {ingredient, percent} objects
    if (!scanned_ingredients_list || !Array.isArray(scanned_ingredients_list) || scanned_ingredients_list.length === 0) {
      return res.status(400).json({ message: 'Valid scanned ingredients list is required' });
    }

    // Get user's health profile
    const healthProfile = await HealthProfile.findOne({ user: req.user._id });
    if (!healthProfile) {
      return res.status(400).json({ message: 'Health profile not found. Please complete your profile first.' });
    }

    // Step 3: The "Main Analysis" AI Call with nutrition data and activity_level for DRI calculations
    let analysisResult;
    try {
      analysisResult = await geminiApi.performMainAnalysis(healthProfile, scanned_ingredients_list, scanned_nutrition_table || {});
    } catch (analysisError) {
      console.error('Main analysis error:', analysisError);
      return res.status(500).json({ 
        message: 'Failed to analyze ingredients',
        error: analysisError.message 
      });
    }

    // V5 Step 4: Process AI Response & Generate Chart Data
    const ingredient_profile_data = {};
    analysisResult.itemized_analysis.forEach(ingredient => {
      const foodType = ingredient.food_type || 'Other';
      ingredient_profile_data[foodType] = (ingredient_profile_data[foodType] || 0) + 1;
    });

    // Step 5: Prepare Final Report
    const analysisReport = {
      product_name: product_name || 'Unknown Product',
      // Overall profile from AI
      overall_profile: analysisResult.overall_profile,
      // Itemized analysis from AI
      itemized_analysis: analysisResult.itemized_analysis,
      // Chart data
      ingredient_profile_data: ingredient_profile_data,
      // Nutrition table data (user-confirmed)
      nutrition_table_data: scanned_nutrition_table || {},
      // Full AI JSON for saving
      analysis_result: analysisResult,
      // Metadata
      total_ingredients: analysisResult.itemized_analysis.length,
      analysis_timestamp: new Date().toISOString(),
      user_profile_summary: {
        age_group: healthProfile.age_group,
        allergies_count: healthProfile.allergies?.length || 0,
        conditions_count: healthProfile.health_conditions?.length || 0,
        preferences_count: healthProfile.dietary_preferences?.length || 0
      }
    };

    res.json({
      message: 'Analysis completed successfully',
      report: analysisReport
    });

  } catch (error) {
    console.error('Ingredient analysis error:', error);
    res.status(500).json({ 
      message: 'Failed to analyze ingredients',
      error: error.message 
    });
  }
});

// @route   GET /api/analysis/ingredient/:name
// @desc    Get cached analysis for a specific ingredient
// @access  Private
router.get('/ingredient/:name', auth, async (req, res) => {
  try {
    const ingredientName = req.params.name.toLowerCase().trim();
    
    const ingredient = await Ingredient.findOne({ 
      ingredient_name: ingredientName 
    });

    if (!ingredient) {
      return res.status(404).json({ message: 'Ingredient not found in cache' });
    }

    res.json({
      ingredient: {
        name: ingredient.ingredient_name,
        analysis: ingredient.analysis_json,
        last_analyzed: ingredient.last_analyzed
      }
    });

  } catch (error) {
    console.error('Get ingredient error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;

