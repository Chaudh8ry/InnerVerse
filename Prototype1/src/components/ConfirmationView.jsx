import React, { useState } from 'react';
import { Check, Edit3, ArrowLeft, Scan } from 'lucide-react';
import { analysisAPI } from '../services/api';

const ConfirmationView = ({ data, onBack, onAnalysisComplete }) => {
  const [editedText, setEditedText] = useState(data.extractedText);
  const [productName, setProductName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleConfirmAndAnalyze = async () => {
    setLoading(true);
    setError('');

    try {
      // Parse the edited ingredients text
      const ingredientsList = editedText
        .split(',')
        .map(ingredient => ingredient.trim())
        .filter(ingredient => ingredient.length > 0);

      if (ingredientsList.length === 0) {
        setError('Please provide at least one ingredient');
        setLoading(false);
        return;
      }

      // Step 2: Analyze the confirmed ingredients
      const response = await analysisAPI.analyzeIngredients(ingredientsList, productName);
      
      // Navigate to results page
      onAnalysisComplete({
        step: 'results',
        report: response.data.report
      });

    } catch (error) {
      console.error('Analysis error:', error);
      setError(error.response?.data?.message || 'Failed to analyze ingredients. Please try again.');
    } finally {
      setLoading(false);
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
          <h1 className="text-3xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
            Confirm Ingredients
          </h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Original Image */}
          <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">
              Original Image
            </h3>
            <img
              src={data.imageUrl}
              alt="Food label"
              className="w-full rounded-lg shadow-md"
            />
          </div>

          {/* Extracted Text Editor */}
          <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
            <div className="flex items-center mb-4">
              <Edit3 className="h-6 w-6 text-blue-500 mr-3" />
              <h3 className="text-xl font-semibold text-gray-800">
                Extracted Ingredients
              </h3>
            </div>

            <p className="text-gray-600 text-sm mb-4">
              Please review and edit the extracted ingredients list. Make any necessary corrections before proceeding.
            </p>

            {/* Product Name Input */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Product Name (Optional)
              </label>
              <input
                type="text"
                value={productName}
                onChange={(e) => setProductName(e.target.value)}
                placeholder="e.g., Organic Granola Bar"
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Ingredients Text Area */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Ingredients List
              </label>
              <textarea
                value={editedText}
                onChange={(e) => setEditedText(e.target.value)}
                placeholder="Enter ingredients separated by commas..."
                className="w-full p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                rows="8"
              />
              <p className="text-xs text-gray-500 mt-2">
                Separate each ingredient with a comma. Example: Wheat flour, sugar, salt, vanilla extract
              </p>
            </div>

            {/* Error Message */}
            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                {error}
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex space-x-4">
              <button
                onClick={onBack}
                className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Back to Scanner
              </button>
              <button
                onClick={handleConfirmAndAnalyze}
                disabled={loading || !editedText.trim()}
                className={`flex-1 px-4 py-3 rounded-lg font-semibold transition-all duration-200 flex items-center justify-center ${
                  loading || !editedText.trim()
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-gradient-to-r from-green-600 to-blue-600 text-white hover:from-green-700 hover:to-blue-700 shadow-lg hover:shadow-xl'
                }`}
              >
                {loading ? (
                  <>
                    <Scan className="h-5 w-5 mr-2 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    <Check className="h-5 w-5 mr-2" />
                    Confirm & Analyze
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Preview Section */}
        {editedText.trim() && (
          <div className="mt-8 bg-white rounded-xl shadow-lg p-6 border border-gray-100">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              Ingredients Preview ({editedText.split(',').filter(i => i.trim()).length} items)
            </h3>
            <div className="flex flex-wrap gap-2">
              {editedText.split(',').map((ingredient, index) => {
                const trimmed = ingredient.trim();
                if (!trimmed) return null;
                return (
                  <span
                    key={index}
                    className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                  >
                    {trimmed}
                  </span>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ConfirmationView;

