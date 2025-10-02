const express = require('express');
const HealthProfile = require('../models/HealthProfile');
const User = require('../models/User');
const auth = require('../middleware/auth');

const router = express.Router();

// @route   POST /api/profile
// @desc    Create or update health profile
// @access  Private
router.post('/', auth, async (req, res) => {
  try {
    const {
      age_group,
      allergies,
      health_conditions,
      dietary_preferences,
      additional_info,
      body_metrics
    } = req.body;

    // Validation
    if (!age_group) {
      return res.status(400).json({ message: 'Age group is required' });
    }

    // Calculate BMI if height and weight are provided
    let bmi = null;
    if (body_metrics?.height && body_metrics?.weight) {
      const { height, weight, unit } = body_metrics;
      
      let heightInM, weightInKg;
      if (unit === 'metric') {
        heightInM = parseFloat(height) / 100;
        weightInKg = parseFloat(weight);
      } else {
        heightInM = parseFloat(height) * 0.3048;
        weightInKg = parseFloat(weight) * 0.453592;
      }
      
      bmi = weightInKg / (heightInM * heightInM);
      bmi = parseFloat(bmi.toFixed(1));
    }

    // Check if profile already exists
    let profile = await HealthProfile.findOne({ user: req.user._id });

    const profileData = {
      user: req.user._id,
      age_group,
      allergies: allergies || [],
      health_conditions: health_conditions || [],
      dietary_preferences: dietary_preferences || [],
      additional_info: additional_info || '',
      body_metrics: {
        ...body_metrics,
        bmi
      }
    };

    if (profile) {
      // Update existing profile
      profile = await HealthProfile.findOneAndUpdate(
        { user: req.user._id },
        profileData,
        { new: true }
      );
    } else {
      // Create new profile
      profile = new HealthProfile(profileData);
      await profile.save();

      // Update user with profile reference
      await User.findByIdAndUpdate(req.user._id, {
        health_profile: profile._id
      });
    }

    res.json({
      message: 'Profile saved successfully',
      profile
    });

  } catch (error) {
    console.error('Profile save error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/profile
// @desc    Get user's health profile
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    const profile = await HealthProfile.findOne({ user: req.user._id });
    
    if (!profile) {
      return res.status(404).json({ message: 'Profile not found' });
    }

    res.json({ profile });

  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;

