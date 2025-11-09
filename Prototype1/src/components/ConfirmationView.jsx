import React, { useState } from 'react';
import { Check, Edit3, ArrowLeft, Scan } from 'lucide-react';
import { analysisAPI } from '../services/api';

const ConfirmationView = ({ data, onBack, onAnalysisComplete }) => {
  // Handle scanned_ingredients_list format (array of {ingredient, percent})
  const initialList = data.scanned_ingredients_list || 
    (data.ingredients_list ? data.ingredients_list.map(ing => ({ ingredient: ing, percent: null })) : []);
  
  // Handle scanned_nutrition_table (object with key-value pairs)
  const initialNutritionTable = data.scanned_nutrition_table || {};
  
  const [scannedIngredients, setScannedIngredients] = useState(initialList);
  const [nutritionTable, setNutritionTable] = useState(initialNutritionTable);
  const [productName, setProductName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Format for display
  const editedText = scannedIngredients
    .map(item => item.percent ? `${item.ingredient} (${item.percent})` : item.ingredient)
    .join(', ');

  const handleConfirmAndAnalyze = async () => {
    setLoading(true);
    setError('');

    try {
      if (scannedIngredients.length === 0) {
        setError('Please provide at least one ingredient');
        setLoading(false);
        return;
      }

      // Send scanned_ingredients_list and scanned_nutrition_table
      const response = await analysisAPI.analyzeIngredients(
        scannedIngredients,
        productName,
        nutritionTable
      );
      
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
          <h1 className="text-2xl font-semibold text-gray-800" style={{ fontFamily: "'Lexend', 'Inter', sans-serif" }}>
            Confirm Ingredients
          </h1>
        </div>

        <div className="grid grid-cols-1 gap-8">
          {/* Original Image */}
          <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
            <h3 className="text-lg font-medium text-gray-800 mb-4 tracking-wide">
              Original Image
            </h3>
            <img
              src={data.imageUrl}
              alt="Food label"
              className="w-full max-w-md rounded-lg shadow-md"
            />
          </div>

          {/* Ingredients Editor */}
          <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
            <div className="flex items-center mb-4">
              <Edit3 className="h-6 w-6 text-blue-500 mr-3" />
              <h3 className="text-lg font-medium text-gray-800 tracking-wide">
                Extracted Ingredients
              </h3>
            </div>

            <p className="text-gray-600 text-base mb-4 leading-relaxed">
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
                onChange={(e) => {
                  // Parse text input back to scanned_ingredients format
                  const text = e.target.value;
                  const items = text.split(',').map(item => {
                    const trimmed = item.trim();
                    const percentMatch = trimmed.match(/^(.*?)\s*\(([^)]+)\)$/);
                    if (percentMatch) {
                      return { ingredient: percentMatch[1].trim(), percent: percentMatch[2].trim() };
                    }
                    return { ingredient: trimmed, percent: null };
                  }).filter(item => item.ingredient.length > 0);
                  setScannedIngredients(items);
                }}
                placeholder="Enter ingredients separated by commas. Include percentages like: Flaked Rice (46%), Sugar, Iodised Salt (1.5%)"
                className="w-full p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                rows="8"
              />
              <p className="text-xs text-gray-500 mt-2">
                Separate each ingredient with a comma. Include percentages in parentheses like: Ingredient (46%)
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
                disabled={loading || scannedIngredients.length === 0}
                className={`flex-1 px-4 py-3 rounded-lg font-medium transition-all duration-200 flex items-center justify-center ${
                  loading || !editedText.trim()
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-emerald-600 text-white hover:bg-emerald-700 hover:-translate-y-0.5 hover:shadow-lg'
                }`}
              >
                {loading ? (
                  <>
                    <Scan className="h-5 w-5 mr-2 animate-spin" />
                    <span className="text-sm">Analyzing...</span>
                  </>
                ) : (
                  <>
                    <Check className="h-5 w-5 mr-2" />
                    <span className="text-sm">Confirm & Analyze</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Nutrition Table Editor */}
          <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
            <div className="flex items-center mb-4">
              <Edit3 className="h-6 w-6 text-purple-500 mr-3" />
              <h3 className="text-lg font-medium text-gray-800 tracking-wide">
                Nutritional Facts Table
              </h3>
            </div>

            <p className="text-gray-600 text-base mb-4 leading-relaxed">
              Review and edit the extracted nutritional facts. Enter each nutrient as "Name: Value" on separate lines.
            </p>

            <textarea
              value={Object.entries(nutritionTable)
                .map(([key, value]) => `${key}: ${value}`)
                .join('\n')}
              onChange={(e) => {
                const text = e.target.value;
                const lines = text.split('\n').filter(line => line.trim());
                const newTable = {};
                lines.forEach(line => {
                  const match = line.match(/^([^:]+):\s*(.+)$/);
                  if (match) {
                    newTable[match[1].trim()] = match[2].trim();
                  }
                });
                setNutritionTable(newTable);
              }}
              placeholder="Energy: 120 kcal
Protein: 2g
Total Fat: 1g
Sodium: 150mg"
              className="w-full p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
              rows="10"
            />
            <p className="text-xs text-gray-500 mt-2">
              Format: Each line should be "Nutrient Name: Value" (e.g., "Energy: 120 kcal")
            </p>
          </div>
        </div>

        {/* Preview Section */}
        <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-6">
          {editedText.trim() && (
            <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
              <h3 className="text-lg font-medium text-gray-800 mb-4 tracking-wide">
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

          {Object.keys(nutritionTable).length > 0 && (
            <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
              <h3 className="text-lg font-medium text-gray-800 mb-4 tracking-wide">
                Nutrition Facts Preview
              </h3>
              <div className="space-y-2">
                {Object.entries(nutritionTable).map(([key, value], index) => (
                  <div key={index} className="flex justify-between items-center p-2 bg-purple-50 rounded">
                    <span className="font-medium text-gray-800">{key}:</span>
                    <span className="text-gray-600">{value}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ConfirmationView;

