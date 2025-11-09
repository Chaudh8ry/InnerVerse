import React, { useState, useEffect } from 'react';
import { ArrowLeft, Trash2, Clock } from 'lucide-react';
import { scansAPI } from '../services/api';

const ScanHistory = ({ onBack, onViewScan }) => {
  const [scans, setScans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadScans();
  }, []);

  const loadScans = async () => {
    try {
      setLoading(true);
      const response = await scansAPI.getScans();
      setScans(response.data.scans);
    } catch (error) {
      console.error('Load scans error:', error);
      setError('Failed to load scan history');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (scanId) => {
    if (!window.confirm('Are you sure you want to delete this scan?')) {
      return;
    }

    try {
      await scansAPI.deleteScan(scanId);
      setScans(scans.filter(scan => scan._id !== scanId));
    } catch (error) {
      console.error('Delete scan error:', error);
      alert('Failed to delete scan');
    }
  };

  const handleViewScan = async (scanId) => {
    try {
      const response = await scansAPI.getScan(scanId);
      const scan = response.data.scan;
      
      // Reconstruct report from saved analysis_result
      const report = {
        product_name: scan.product_name,
        overall_profile: scan.analysis_result.overall_profile,
        itemized_analysis: scan.analysis_result.itemized_analysis,
        ingredient_profile_data: {}, // Will be regenerated from itemized_analysis
        nutrition_table_data: scan.nutrition_table_data || {}, // Include saved nutrition table data
        analysis_result: scan.analysis_result,
        analysis_timestamp: scan.scan_date,
        total_ingredients: scan.analysis_result.itemized_analysis?.length || 0
      };

      // Regenerate chart data
      if (scan.analysis_result.itemized_analysis) {
        scan.analysis_result.itemized_analysis.forEach(ingredient => {
          const foodType = ingredient.food_type || 'Other';
          report.ingredient_profile_data[foodType] = (report.ingredient_profile_data[foodType] || 0) + 1;
        });
      }

      onViewScan(report);
    } catch (error) {
      console.error('View scan error:', error);
      alert('Failed to load scan');
    }
  };

  const getRatingColor = (rating) => {
    switch (rating) {
      case 'Healthy':
        return 'bg-emerald-100 text-emerald-700 border-emerald-300';
      case 'Moderately Healthy':
        return 'bg-amber-100 text-amber-700 border-amber-300';
      case 'Unhealthy':
        return 'bg-red-100 text-red-700 border-red-300';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-300';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-50">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="flex items-center mb-8">
          <button
            onClick={onBack}
            className="flex items-center text-gray-600 hover:text-gray-800 mr-4"
          >
            <ArrowLeft className="h-5 w-5 mr-2" />
            Back
          </button>
          <h1 className="text-2xl font-semibold text-gray-800" style={{ fontFamily: "'Lexend', 'Inter', sans-serif" }}>
            Scan History
          </h1>
        </div>

        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
            {error}
          </div>
        )}

        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto mb-4"></div>
            <p className="text-gray-600 text-base">Loading scan history...</p>
          </div>
        ) : scans.length === 0 ? (
          <div className="bg-white rounded-xl p-12 text-center border border-gray-200 shadow-sm">
            <p className="text-gray-600 text-base">No saved scans yet.</p>
            <p className="text-gray-500 text-sm mt-2">Save your first scan to see it here!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {scans.map((scan) => (
              <div
                key={scan._id}
                className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm hover:shadow-md hover:scale-[1.02] transition-all duration-200 cursor-pointer"
                onClick={() => handleViewScan(scan._id)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold text-gray-800 mb-2" style={{ fontFamily: "'Lexend', 'Inter', sans-serif" }}>
                      {scan.product_name}
                    </h3>
                    <div className="flex items-center text-gray-500 text-sm mb-3">
                      <Clock className="h-4 w-4 mr-2" />
                      {new Date(scan.scan_date).toLocaleDateString()}
                    </div>
                    <div className={`inline-block px-3 py-1 rounded-lg border ${getRatingColor(scan.overall_rating)}`}>
                      <span className="text-sm font-medium">{scan.overall_rating}</span>
                    </div>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(scan._id);
                    }}
                    className="ml-4 p-2 text-red-600 hover:bg-red-50 rounded-full transition-all duration-200"
                    title="Delete scan"
                  >
                    <Trash2 className="h-5 w-5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ScanHistory;

