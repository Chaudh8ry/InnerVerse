import React, { useState, useEffect } from 'react';
import { ArrowLeft, AlertTriangle, Heart, Shield, Clock, Save, ChevronDown, ChevronUp } from 'lucide-react';
import { scansAPI } from '../services/api';

const AnalysisReport = ({ report, onBack, onNewAnalysis }) => {
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveModalOpen, setSaveModalOpen] = useState(false);
  const [productName, setProductName] = useState(report.product_name || '');
  const [expandedSections, setExpandedSections] = useState({});
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const toggleSection = (ingredientIndex, sectionName) => {
    const key = `${ingredientIndex}-${sectionName}`;
    setExpandedSections(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const isSectionExpanded = (ingredientIndex, sectionName) => {
    const key = `${ingredientIndex}-${sectionName}`;
    return expandedSections[key] !== false; // Default to expanded
  };

  // Helper function to create doughnut chart
  const createDoughnutChart = (data) => {
    const colors = [
      '#10B981', '#3B82F6', '#8B5CF6', '#F59E0B', '#EF4444',
      '#EC4899', '#06B6D4', '#84CC16', '#F97316', '#6366F1'
    ];
    
    const entries = Object.entries(data).filter(([_, count]) => count > 0);
    const total = entries.reduce((sum, [_, count]) => sum + count, 0);
    
    if (total === 0) return null;
    
    let currentAngle = -90;
    const segments = entries.map(([type, count], index) => {
      const percentage = (count / total) * 100;
      const angle = (percentage / 100) * 360;
      const startAngle = currentAngle;
      currentAngle += angle;
      
      const radius = 80;
      const innerRadius = 50;
      const centerX = 100;
      const centerY = 100;
      
      const startAngleRad = (startAngle * Math.PI) / 180;
      const endAngleRad = (currentAngle * Math.PI) / 180;
      
      const x1 = centerX + radius * Math.cos(startAngleRad);
      const y1 = centerY + radius * Math.sin(startAngleRad);
      const x2 = centerX + radius * Math.cos(endAngleRad);
      const y2 = centerY + radius * Math.sin(endAngleRad);
      
      const x3 = centerX + innerRadius * Math.cos(endAngleRad);
      const y3 = centerY + innerRadius * Math.sin(endAngleRad);
      const x4 = centerX + innerRadius * Math.cos(startAngleRad);
      const y4 = centerY + innerRadius * Math.sin(startAngleRad);
      
      const largeArc = angle > 180 ? 1 : 0;
      
      const path = [
        `M ${x1} ${y1}`,
        `A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2}`,
        `L ${x3} ${y3}`,
        `A ${innerRadius} ${innerRadius} 0 ${largeArc} 0 ${x4} ${y4}`,
        'Z'
      ].join(' ');
      
      return {
        path,
        color: colors[index % colors.length],
        type,
        count,
        percentage: percentage.toFixed(1)
      };
    });
    
    return segments;
  };

  const chartSegments = report.ingredient_profile_data 
    ? createDoughnutChart(report.ingredient_profile_data)
    : null;

  const getRatingColor = (rating) => {
    switch (rating) {
      case 'Healthy':
        return 'text-green-600 bg-green-50 border-green-200';
      case 'Moderately Healthy':
        return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'Unhealthy':
        return 'text-red-600 bg-red-50 border-red-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getHealthRatingColor = (rating) => {
    switch (rating) {
      case 'Healthy':
        return 'text-white bg-emerald-600'; // Primary green
      case 'Moderately Healthy':
        return 'text-white bg-amber-500'; // Secondary amber
      case 'Unhealthy':
        return 'text-white bg-red-600'; // Error red
      default:
        return 'text-white bg-gray-400';
    }
  };

  // Get light pastel colors for ingredient card backgrounds
  const getIngredientCardColor = (index) => {
    const colors = [
      'bg-purple-50 border-purple-200', // Light purple
      'bg-teal-50 border-teal-200',     // Light teal
      'bg-pink-50 border-pink-200',     // Light pink
      'bg-blue-50 border-blue-200',     // Light blue
      'bg-amber-50 border-amber-200',   // Light amber
      'bg-indigo-50 border-indigo-200', // Light indigo
    ];
    return colors[index % colors.length];
  };

  // Get darker shade for content boxes within cards
  const getContentBoxColor = (index) => {
    const colors = [
      'bg-purple-100',   // Slightly darker purple
      'bg-teal-100',     // Slightly darker teal
      'bg-pink-100',     // Slightly darker pink
      'bg-blue-100',     // Slightly darker blue
      'bg-amber-100',    // Slightly darker amber
      'bg-indigo-100',   // Slightly darker indigo
    ];
    return colors[index % colors.length];
  };

  const handleSaveScan = async () => {
    if (!productName.trim()) {
      alert('Please enter a product name');
      return;
    }

    setSaving(true);
    try {
      await scansAPI.saveScan(
        productName,
        report.analysis_result || report,
        report.overall_profile?.overall_rating || 'Unknown',
        report.nutrition_table_data || {}
      );
      setSaveSuccess(true);
      setSaveModalOpen(false);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (error) {
      console.error('Save scan error:', error);
      alert('Failed to save scan. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  // V4/V5: Get data from new structure
  const overallProfile = report.overall_profile || {};
  const itemizedAnalysis = report.itemized_analysis || [];

  return (
    <div className={`min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-50 ${isVisible ? 'fade-in' : 'opacity-0'}`}>
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center">
            <button
              onClick={onBack}
              className="flex items-center text-gray-600 hover:text-gray-800 mr-4 transition-all duration-200"
            >
              <ArrowLeft className="h-5 w-5 mr-2" />
              <span className="text-base font-medium">Back</span>
            </button>
            <h1 className="text-2xl font-semibold text-gray-800" style={{ fontFamily: "'Lexend', 'Inter', sans-serif" }}>
              Analysis Report
            </h1>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSaveModalOpen(true)}
              className="flex items-center px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg"
            >
              <Save className="h-4 w-4 mr-2" />
              <span className="text-sm font-medium">Save Scan</span>
            </button>
            <button
              onClick={onNewAnalysis}
              className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg"
            >
              <span className="text-sm font-medium">New Analysis</span>
            </button>
          </div>
        </div>

        {saveSuccess && (
          <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg text-green-700">
            Scan saved successfully!
          </div>
        )}

        {/* Product Info */}
        <div className="bg-white rounded-xl p-6 mb-6 border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-gray-800 mb-2" style={{ fontFamily: "'Lexend', 'Inter', sans-serif" }}>
                {report.product_name || 'Unknown Product'}
              </h2>
              <div className="flex items-center text-gray-500 text-sm mt-2">
                <Clock className="h-4 w-4 mr-2" />
                Analyzed on {new Date(report.analysis_timestamp || Date.now()).toLocaleDateString()}
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm text-gray-500 mb-1">
                {itemizedAnalysis.length} ingredients analyzed
              </div>
              <div className="flex items-center text-sm text-gray-600">
                <Heart className="h-4 w-4 mr-1" />
                Based on your health profile
              </div>
            </div>
          </div>
        </div>

        {/* Part 1: Overall Summary Card */}
        <div className="bg-white rounded-xl p-6 mb-6 border border-gray-200 shadow-sm">
          <div className="flex items-center mb-4">
            <div className="w-1 h-8 bg-indigo-500 rounded mr-3"></div>
            <h3 className="text-2xl font-semibold text-gray-800" style={{ fontFamily: "'Lexend', 'Inter', sans-serif" }}>Food Package / Meal Profile</h3>
            <div className="ml-auto">
              {overallProfile.overall_rating && (
                <span className={`px-4 py-1.5 rounded-lg text-sm font-semibold ${getHealthRatingColor(overallProfile.overall_rating)}`}>
                  {overallProfile.overall_rating}
                </span>
              )}
            </div>
          </div>

          {/* Summary Paragraph */}
          <div className="text-gray-600 text-base leading-relaxed mb-6" style={{ lineHeight: '1.6' }}>
            {overallProfile.summary_paragraph || 'No summary available.'}
          </div>

          {/* Possible Allergens */}
          {overallProfile.allergens_found && overallProfile.allergens_found.length > 0 && (
            <div className="mt-6">
              <div className="flex items-center mb-3">
                <div className="w-1 h-6 bg-indigo-500 rounded mr-3"></div>
                <h4 className="text-sm font-semibold text-gray-800">Possible Allergens</h4>
              </div>
              <div className="flex flex-wrap gap-2">
                {overallProfile.allergens_found.map((allergen, index) => (
                  <span
                    key={index}
                    className="px-3 py-1.5 bg-red-600 text-white rounded-lg text-sm font-medium"
                  >
                    {allergen}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Part 2: Moderation & Alternatives */}
        {(overallProfile.moderation_advice || overallProfile.alternative_suggestion) && (
          <div className="bg-white rounded-xl p-6 mb-6 border border-gray-200 shadow-sm">
            <h3 className="text-lg font-medium text-gray-800 mb-4 tracking-wide">Part 2: Moderation & Alternatives</h3>
            
            <div className="space-y-4">
              {overallProfile.moderation_advice && (
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="font-medium text-blue-900 mb-2">Moderation Advice:</div>
                  <div className="text-gray-600 text-base leading-relaxed">{overallProfile.moderation_advice}</div>
                </div>
              )}
              
              {overallProfile.alternative_suggestion && (
                <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-lg">
                  <div className="font-medium text-emerald-900 mb-2">Alternative:</div>
                  <div className="text-gray-600 text-base leading-relaxed">{overallProfile.alternative_suggestion}</div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Part 3: Nutritional Facts */}
        {report.nutrition_table_data && Object.keys(report.nutrition_table_data).length > 0 && (
          <div className="bg-white rounded-xl p-6 mb-6 border border-gray-200 shadow-sm">
            <h3 className="text-lg font-medium text-gray-800 mb-4 tracking-wide">Part 3: Nutritional Facts</h3>
            
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="border border-gray-200 px-4 py-3 text-left font-semibold text-gray-800">Nutrient</th>
                    <th className="border border-gray-200 px-4 py-3 text-left font-semibold text-gray-800">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {Object.entries(report.nutrition_table_data).map(([key, value], index) => (
                    <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                      <td className="border border-gray-200 px-4 py-3 font-medium text-gray-800">{key}</td>
                      <td className="border border-gray-200 px-4 py-3 text-gray-700">{value}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Part 4: Ingredient Profile Chart */}
        {report.ingredient_profile_data && chartSegments && (
          <div className="bg-white rounded-xl p-6 mb-6 border border-gray-200 shadow-sm">
            <h3 className="text-lg font-medium text-gray-800 mb-4 flex items-center tracking-wide">
              <Shield className="h-6 w-6 text-emerald-600 mr-3" />
              Part 4: Ingredient Profile
            </h3>
            <div className="flex flex-col md:flex-row items-center gap-8">
              <div className="flex-shrink-0">
                <svg width="200" height="200" viewBox="0 0 200 200">
                  {chartSegments.map((segment, index) => (
                    <path
                      key={index}
                      d={segment.path}
                      fill={segment.color}
                      stroke="white"
                      strokeWidth="2"
                    />
                  ))}
                </svg>
              </div>
              
              <div className="flex-1">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {chartSegments.map((segment, index) => (
                    <div key={index} className="flex items-center">
                      <div
                        className="w-4 h-4 rounded-full mr-2 flex-shrink-0"
                        style={{ backgroundColor: segment.color }}
                      ></div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-gray-800 truncate">
                          {segment.type}
                        </div>
                        <div className="text-xs text-gray-500">
                          {segment.count} ingredient{segment.count !== 1 ? 's' : ''} ({segment.percentage}%)
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Part 5: Itemized Ingredient List */}
        {itemizedAnalysis.length > 0 && (
          <div className="mb-6">
            <div className="mb-4">
              <h3 className="text-lg font-medium text-gray-800 tracking-wide">Part 5: Itemized Ingredient List</h3>
            </div>
            <div className="space-y-4">
              {itemizedAnalysis.map((ingredient, index) => {
                const cardColor = getIngredientCardColor(index);
                const contentBoxColor = getContentBoxColor(index);
                const foodTraitsExpanded = isSectionExpanded(index, 'foodTraits');
                const ingredientDetailsExpanded = isSectionExpanded(index, 'ingredientDetails');
                const nutrientsExpanded = isSectionExpanded(index, 'nutrients');

                return (
                  <div
                    key={index}
                    className={`rounded-xl p-5 border border-gray-200 shadow-sm ${cardColor} stagger-item`}
                    style={{
                      animationDelay: `${index * 50}ms`
                    }}
                  >
                    {/* Top Row: Bullet, Name, Rating, Percentage */}
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <div className="w-2 h-2 bg-gray-500 rounded-full flex-shrink-0"></div>
                        <h4 className="font-semibold text-xl text-gray-800 truncate">
                          {ingredient.ingredient_name}
                        </h4>
                        {ingredient.health_rating && (
                          <span className={`px-3 py-1 rounded-lg text-xs font-semibold whitespace-nowrap flex-shrink-0 ${getHealthRatingColor(ingredient.health_rating)}`}>
                            {ingredient.health_rating}
                          </span>
                        )}
                      </div>
                      {ingredient.percentage && (
                        <span className="px-3 py-1 bg-gray-600 text-white rounded-lg text-sm font-semibold ml-2 flex-shrink-0">
                          {ingredient.percentage}
                        </span>
                      )}
                    </div>

                    {/* Food Traits Section */}
                    {ingredient.food_traits && ingredient.food_traits.length > 0 && (
                      <div className="mb-4">
                        <button
                          onClick={() => toggleSection(index, 'foodTraits')}
                          className="flex items-center w-full text-left mb-2 group"
                        >
                          <div className="w-1 h-5 bg-indigo-500 rounded mr-2"></div>
                          <span className="text-sm font-medium text-gray-700">Food Traits</span>
                          {foodTraitsExpanded ? (
                            <ChevronDown className="w-4 h-4 ml-2 text-gray-500" />
                          ) : (
                            <ChevronDown className="w-4 h-4 ml-2 text-gray-500 rotate-[-90deg]" />
                          )}
                        </button>
                        {foodTraitsExpanded && (
                          <div className="flex flex-wrap gap-2 ml-3">
                            {ingredient.food_traits.map((trait, traitIndex) => (
                              <span
                                key={traitIndex}
                                className="px-3 py-1.5 bg-indigo-100 text-indigo-800 rounded-lg text-sm font-medium"
                              >
                                {trait}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    )}

                    {/* Ingredient Details Section */}
                    {ingredient.ingredient_details && (
                      <div className="mb-4">
                        <button
                          onClick={() => toggleSection(index, 'ingredientDetails')}
                          className="flex items-center w-full text-left mb-2 group"
                        >
                          <div className="w-1 h-5 bg-indigo-500 rounded mr-2"></div>
                          <span className="text-sm font-medium text-gray-700">Ingredient Details</span>
                          {ingredientDetailsExpanded ? (
                            <ChevronDown className="w-4 h-4 ml-2 text-gray-500" />
                          ) : (
                            <ChevronDown className="w-4 h-4 ml-2 text-gray-500 rotate-[-90deg]" />
                          )}
                        </button>
                        {ingredientDetailsExpanded && (
                          <div className={`ml-3 p-4 rounded-lg ${contentBoxColor}`}>
                            {ingredient.ingredient_details.split('\n').map((paragraph, pIndex) => {
                              if (pIndex === 0) {
                                return (
                                  <p key={pIndex} className="font-semibold text-gray-800 mb-2 text-base">
                                    {paragraph}
                                  </p>
                                );
                              }
                              return (
                                <p key={pIndex} className="text-base text-gray-600 leading-relaxed" style={{ lineHeight: '1.6' }}>
                                  {paragraph}
                                </p>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    )}

                    {/* Nutrients Section */}
                    {ingredient.nutrients && ingredient.nutrients.length > 0 && (
                      <div>
                        <button
                          onClick={() => toggleSection(index, 'nutrients')}
                          className="flex items-center w-full text-left mb-2 group"
                        >
                          <div className="w-1 h-5 bg-indigo-500 rounded mr-2"></div>
                          <span className="text-sm font-medium text-gray-700">Nutrients</span>
                          {nutrientsExpanded ? (
                            <ChevronDown className="w-4 h-4 ml-2 text-gray-500" />
                          ) : (
                            <ChevronDown className="w-4 h-4 ml-2 text-gray-500 rotate-[-90deg]" />
                          )}
                        </button>
                        {nutrientsExpanded && (
                          <div className="ml-3 space-y-2">
                            {ingredient.nutrients.map((nutrient, nutrientIndex) => (
                              <div
                                key={nutrientIndex}
                                className={`p-3 rounded-lg ${contentBoxColor} flex items-start justify-between`}
                              >
                                <div className="flex-1">
                                    <p className="font-medium text-gray-800 text-base mb-1">
                                      {nutrient.name}
                                    </p>
                                    <p className="text-sm text-gray-500">
                                      {nutrient.description}
                                    </p>
                                </div>
                                <div className="w-2 h-2 bg-indigo-400 rounded-full ml-3 mt-1 flex-shrink-0"></div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Save Modal */}
        {saveModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 fade-in">
            <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4 border border-gray-200 shadow-sm">
              <h3 className="text-lg font-medium text-gray-800 mb-4 tracking-wide">Save Scan</h3>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Product Name
                </label>
                <input
                  type="text"
                  value={productName}
                  onChange={(e) => setProductName(e.target.value)}
                  placeholder="e.g., Haldiram's Diet Mixture"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  autoFocus
                />
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => setSaveModalOpen(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveScan}
                  disabled={saving || !productName.trim()}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300"
                >
                  {saving ? 'Saving...' : 'Save'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AnalysisReport;

