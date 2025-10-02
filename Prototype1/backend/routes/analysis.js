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

    // Extract ingredients using Gemini API
    const extractedText = await geminiApi.extractIngredientsFromImage(imageBase64);

    // Clean up the uploaded file
    await fs.unlink(imagePath);

    // Parse ingredients list
    const ingredientsList = extractedText
      .split(',')
      .map(ingredient => ingredient.trim())
      .filter(ingredient => ingredient.length > 0);

    res.json({
      message: 'Ingredients extracted successfully',
      extracted_text: extractedText,
      ingredients_list: ingredientsList,
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
// @desc    Analyze confirmed ingredients list and generate personalized report
// @access  Private
router.post('/analyze-ingredients', auth, async (req, res) => {
  try {
    const { ingredients_list, product_name } = req.body;

    if (!ingredients_list || !Array.isArray(ingredients_list) || ingredients_list.length === 0) {
      return res.status(400).json({ message: 'Valid ingredients list is required' });
    }

    // Get user's health profile
    const healthProfile = await HealthProfile.findOne({ user: req.user._id });
    if (!healthProfile) {
      return res.status(400).json({ message: 'Health profile not found. Please complete your profile first.' });
    }

    const ingredientDataForReport = [];

    // Process each ingredient (Cache-and-Curate Logic)
    for (const ingredientName of ingredients_list) {
      const normalizedName = ingredientName.toLowerCase().trim();
      
      // Step 3a: Check cache
      let cachedIngredient = await Ingredient.findOne({ 
        ingredient_name: normalizedName 
      });

      if (cachedIngredient) {
        // Step 3c: Cache hit - use existing data
        ingredientDataForReport.push({
          ingredient_name: ingredientName,
          analysis_json: cachedIngredient.analysis_json
        });
      } else {
        // Step 3b: Cache miss - fetch from AI
        try {
          const analysisData = await geminiApi.analyzeIngredient(ingredientName);
          
          // Save to cache
          const newIngredient = new Ingredient({
            ingredient_name: normalizedName,
            analysis_json: analysisData,
            last_analyzed: new Date()
          });
          
          await newIngredient.save();
          
          ingredientDataForReport.push({
            ingredient_name: ingredientName,
            analysis_json: analysisData
          });
        } catch (analysisError) {
          console.error(`Failed to analyze ingredient ${ingredientName}:`, analysisError);
          
          // Add with minimal data if analysis fails
          ingredientDataForReport.push({
            ingredient_name: ingredientName,
            analysis_json: {
              type: "unknown",
              tags: ["unanalyzed"],
              potential_concerns: []
            }
          });
        }
      }
    }

    // Personalize the report using rules engine
    const warnings = rulesEngine.analyzeIngredientConflicts(healthProfile, ingredientDataForReport);
    const overallSummary = rulesEngine.generateOverallSummary(warnings);

    // Prepare final report
    const analysisReport = {
      product_name: product_name || 'Unknown Product',
      overall_summary: overallSummary,
      warnings: warnings,
      ingredients_analyzed: ingredientDataForReport.map(item => ({
        name: item.ingredient_name,
        type: item.analysis_json.type,
        tags: item.analysis_json.tags
      })),
      total_ingredients: ingredientDataForReport.length,
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

