import React from 'react';
import { ArrowLeft, AlertTriangle, CheckCircle, Info, Heart, Shield, Clock } from 'lucide-react';

const AnalysisReport = ({ report, onBack, onNewAnalysis }) => {
  const getStatusIcon = (status) => {
    switch (status) {
      case 'good':
        return <CheckCircle className="h-6 w-6 text-green-500" />;
      case 'not_recommended':
        return <AlertTriangle className="h-6 w-6 text-red-500" />;
      case 'caution':
        return <AlertTriangle className="h-6 w-6 text-orange-500" />;
      case 'minor_concerns':
        return <Info className="h-6 w-6 text-yellow-500" />;
      default:
        return <Info className="h-6 w-6 text-gray-500" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'good':
        return 'bg-green-50 border-green-200 text-green-800';
      case 'not_recommended':
        return 'bg-red-50 border-red-200 text-red-800';
      case 'caution':
        return 'bg-orange-50 border-orange-200 text-orange-800';
      case 'minor_concerns':
        return 'bg-yellow-50 border-yellow-200 text-yellow-800';
      default:
        return 'bg-gray-50 border-gray-200 text-gray-800';
    }
  };

  const getWarningColor = (level) => {
    switch (level) {
      case 'HIGH':
        return 'bg-red-50 border-red-200 text-red-800';
      case 'MEDIUM':
        return 'bg-orange-50 border-orange-200 text-orange-800';
      case 'LOW':
        return 'bg-yellow-50 border-yellow-200 text-yellow-800';
      default:
        return 'bg-gray-50 border-gray-200 text-gray-800';
    }
  };

  const getWarningIcon = (type) => {
    switch (type) {
      case 'allergy':
        return '🚨';
      case 'health_condition':
        return '⚕️';
      case 'dietary_preference':
        return '🥗';
      default:
        return '⚠️';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-50">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center">
            <button
              onClick={onBack}
              className="flex items-center text-gray-600 hover:text-gray-800 mr-4"
            >
              <ArrowLeft className="h-5 w-5 mr-2" />
              Back
            </button>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
              Analysis Report
            </h1>
          </div>
          <button
            onClick={onNewAnalysis}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            New Analysis
          </button>
        </div>

        {/* Product Info */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-800">
                {report.product_name}
              </h2>
              <div className="flex items-center text-gray-500 text-sm mt-2">
                <Clock className="h-4 w-4 mr-2" />
                Analyzed on {new Date(report.analysis_timestamp).toLocaleDateString()}
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm text-gray-500 mb-1">
                {report.total_ingredients} ingredients analyzed
              </div>
              <div className="flex items-center text-sm text-gray-600">
                <Heart className="h-4 w-4 mr-1" />
                Based on your health profile
              </div>
            </div>
          </div>
        </div>

        {/* Overall Summary */}
        <div className={`rounded-xl shadow-lg p-6 mb-6 border ${getStatusColor(report.overall_summary.status)}`}>
          <div className="flex items-center">
            {getStatusIcon(report.overall_summary.status)}
            <div className="ml-4">
              <h3 className="text-xl font-semibold">Overall Assessment</h3>
              <p className="text-lg mt-1">{report.overall_summary.message}</p>
            </div>
          </div>
        </div>

        {/* Warnings Section */}
        {report.warnings && report.warnings.length > 0 && (
          <div className="bg-white rounded-xl shadow-lg p-6 mb-6 border border-gray-100">
            <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
              <AlertTriangle className="h-6 w-6 text-red-500 mr-3" />
              Health Concerns ({report.warnings.length})
            </h3>
            
            <div className="space-y-3">
              {report.warnings.map((warning, index) => (
                <div
                  key={index}
                  className={`p-4 rounded-lg border ${getWarningColor(warning.level)}`}
                >
                  <div className="flex items-start">
                    <span className="text-2xl mr-3 flex-shrink-0">
                      {getWarningIcon(warning.type)}
                    </span>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-semibold">
                          {warning.condition}
                        </h4>
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          warning.level === 'HIGH' ? 'bg-red-100 text-red-800' :
                          warning.level === 'MEDIUM' ? 'bg-orange-100 text-orange-800' :
                          'bg-yellow-100 text-yellow-800'
                        }`}>
                          {warning.level} PRIORITY
                        </span>
                      </div>
                      <p className="text-sm">{warning.message}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Ingredients List */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6 border border-gray-100">
          <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
            <Shield className="h-6 w-6 text-green-500 mr-3" />
            Ingredients Analysis
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {report.ingredients_analyzed.map((ingredient, index) => (
              <div
                key={index}
                className="p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="font-medium text-gray-800 text-sm">
                  {ingredient.name}
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  Type: {ingredient.type}
                </div>
                <div className="flex flex-wrap gap-1 mt-2">
                  {ingredient.tags.slice(0, 3).map((tag, tagIndex) => (
                    <span
                      key={tagIndex}
                      className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs"
                    >
                      {tag}
                    </span>
                  ))}
                  {ingredient.tags.length > 3 && (
                    <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs">
                      +{ingredient.tags.length - 3} more
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Profile Summary */}
        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
          <h3 className="text-xl font-semibold text-gray-800 mb-4">
            Your Health Profile Summary
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">
                {report.user_profile_summary.age_group}
              </div>
              <div className="text-sm text-gray-600">Age Group</div>
            </div>
            <div className="text-center p-4 bg-red-50 rounded-lg">
              <div className="text-2xl font-bold text-red-600">
                {report.user_profile_summary.allergies_count}
              </div>
              <div className="text-sm text-gray-600">Allergies</div>
            </div>
            <div className="text-center p-4 bg-orange-50 rounded-lg">
              <div className="text-2xl font-bold text-orange-600">
                {report.user_profile_summary.conditions_count}
              </div>
              <div className="text-sm text-gray-600">Health Conditions</div>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">
                {report.user_profile_summary.preferences_count}
              </div>
              <div className="text-sm text-gray-600">Dietary Preferences</div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-8 flex justify-center space-x-4">
          <button
            onClick={onBack}
            className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Back to Scanner
          </button>
          <button
            onClick={onNewAnalysis}
            className="px-6 py-3 bg-gradient-to-r from-green-600 to-blue-600 text-white rounded-lg hover:from-green-700 hover:to-blue-700 transition-all duration-200 shadow-lg hover:shadow-xl"
          >
            Analyze Another Product
          </button>
        </div>
      </div>
    </div>
  );
};

export default AnalysisReport;

