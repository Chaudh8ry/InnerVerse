const express = require('express');
const SavedScan = require('../models/SavedScan');
const auth = require('../middleware/auth');

const router = express.Router();

// @route   POST /api/scans
// @desc    Save a scan
// @access  Private
router.post('/', auth, async (req, res) => {
  try {
    const { product_name, analysis_result, overall_rating, nutrition_table_data } = req.body;

    if (!product_name || !analysis_result || !overall_rating) {
      return res.status(400).json({ message: 'Product name, analysis result, and overall rating are required' });
    }

    const savedScan = new SavedScan({
      user: req.user._id,
      product_name,
      analysis_result,
      overall_rating,
      nutrition_table_data: nutrition_table_data || {}
    });

    await savedScan.save();

    res.json({
      message: 'Scan saved successfully',
      scan: savedScan
    });

  } catch (error) {
    console.error('Save scan error:', error);
    res.status(500).json({ 
      message: 'Failed to save scan',
      error: error.message 
    });
  }
});

// @route   GET /api/scans
// @desc    Get all saved scans for current user
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    const scans = await SavedScan.find({ user: req.user._id })
      .sort({ scan_date: -1 })
      .select('product_name scan_date overall_rating');

    res.json({
      scans
    });

  } catch (error) {
    console.error('Get scans error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/scans/:id
// @desc    Get a specific saved scan by ID
// @access  Private
router.get('/:id', auth, async (req, res) => {
  try {
    const scan = await SavedScan.findOne({ 
      _id: req.params.id,
      user: req.user._id 
    });

    if (!scan) {
      return res.status(404).json({ message: 'Scan not found' });
    }

    res.json({
      scan
    });

  } catch (error) {
    console.error('Get scan error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   DELETE /api/scans/:id
// @desc    Delete a saved scan
// @access  Private
router.delete('/:id', auth, async (req, res) => {
  try {
    const scan = await SavedScan.findOneAndDelete({
      _id: req.params.id,
      user: req.user._id
    });

    if (!scan) {
      return res.status(404).json({ message: 'Scan not found' });
    }

    res.json({
      message: 'Scan deleted successfully'
    });

  } catch (error) {
    console.error('Delete scan error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;

