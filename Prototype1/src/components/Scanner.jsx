import React, { useState } from 'react';
import { Camera, Upload, Scan, LogOut, User } from 'lucide-react';
import { analysisAPI, logout } from '../services/api';

const Scanner = ({ user, onLogout, onProfileEdit, onAnalysisComplete }) => {
  const [selectedImage, setSelectedImage] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      setImageFile(file);
      
      const reader = new FileReader();
      reader.onload = (e) => {
        setSelectedImage(e.target.result);
      };
      reader.readAsDataURL(file);
      setError('');
    }
  };

  const handleAnalyze = async () => {
    if (!imageFile) {
      setError('Please select an image first');
      return;
    }

    if (!user.hasProfile) {
      setError('Please complete your health profile first');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Step 1: Extract ingredients from image
      const response = await analysisAPI.extractIngredients(imageFile);
      
      // Navigate to confirmation view with extracted data
      onAnalysisComplete({
        step: 'confirmation',
        extractedText: response.data.extracted_text,
        ingredientsList: response.data.ingredients_list,
        imageUrl: selectedImage
      });
      
    } catch (error) {
      console.error('Analysis error:', error);
      setError(error.response?.data?.message || 'Failed to analyze image. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    onLogout();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-50">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
              InnerVerse
            </h1>
          </div>
          <div className="flex items-center space-x-4">
            <button
              onClick={onProfileEdit}
              className="flex items-center px-4 py-2 text-blue-600 hover:text-blue-700 font-medium"
            >
              <User className="h-5 w-5 mr-2" />
              {user.hasProfile ? 'Edit Profile' : 'Create Profile'}
            </button>
            <button
              onClick={handleLogout}
              className="flex items-center px-4 py-2 text-red-600 hover:text-red-700 font-medium"
            >
              <LogOut className="h-5 w-5 mr-2" />
              Logout
            </button>
          </div>
        </div>

        {/* Welcome Section */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8 border border-gray-100">
          <h2 className="text-2xl font-semibold text-gray-800 mb-2">
            Welcome back, {user.email}!
          </h2>
          <p className="text-gray-600">
            Upload a food label image to get personalized health recommendations based on your profile.
          </p>
          
          {!user.hasProfile && (
            <div className="mt-4 p-4 bg-orange-50 border border-orange-200 rounded-lg">
              <p className="text-orange-800 font-medium">
                📋 Complete your health profile first to get personalized analysis!
              </p>
              <button
                onClick={onProfileEdit}
                className="mt-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
              >
                Create Profile Now
              </button>
            </div>
          )}
        </div>

        {/* Image Upload Section */}
        <div className="bg-white rounded-xl shadow-lg p-8 mb-8 border border-gray-100">
          <h3 className="text-xl font-semibold text-gray-800 mb-6 flex items-center">
            <Camera className="h-6 w-6 text-purple-500 mr-3" />
            Food Label Scanner
          </h3>

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
              {error}
            </div>
          )}

          {/* Upload Area */}
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-purple-400 transition-colors">
            {selectedImage ? (
              <div className="space-y-4">
                <img
                  src={selectedImage}
                  alt="Selected food label"
                  className="max-w-full max-h-64 mx-auto rounded-lg shadow-md"
                />
                <div className="flex justify-center space-x-4">
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedImage(null);
                      setImageFile(null);
                      setError('');
                    }}
                    className="px-4 py-2 text-red-600 hover:text-red-700 font-medium"
                  >
                    Remove Image
                  </button>
                  <label className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors cursor-pointer">
                    Replace Image
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <Upload className="h-16 w-16 text-gray-400 mx-auto" />
                <div>
                  <p className="text-lg font-medium text-gray-700 mb-2">
                    Upload Food Label Image
                  </p>
                  <p className="text-gray-500 mb-4">
                    Take a photo or upload an image of the ingredients list
                  </p>
                  <div className="flex justify-center space-x-4">
                    <label className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors cursor-pointer flex items-center">
                      <Upload className="h-5 w-5 mr-2" />
                      Upload Image
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                      />
                    </label>
                    <label className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors cursor-pointer flex items-center">
                      <Camera className="h-5 w-5 mr-2" />
                      Take Photo
                      <input
                        type="file"
                        accept="image/*"
                        capture="environment"
                        onChange={handleImageUpload}
                        className="hidden"
                      />
                    </label>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Analyze Button */}
          {selectedImage && (
            <div className="mt-6 text-center">
              <button
                onClick={handleAnalyze}
                disabled={loading || !user.hasProfile}
                className={`px-8 py-4 rounded-xl font-semibold text-lg transition-all duration-200 flex items-center mx-auto ${
                  loading || !user.hasProfile
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-gradient-to-r from-green-600 to-blue-600 text-white hover:from-green-700 hover:to-blue-700 shadow-lg hover:shadow-xl transform hover:-translate-y-1'
                }`}
              >
                <Scan className="h-6 w-6 mr-3" />
                {loading ? 'Analyzing...' : 'Analyze Ingredients'}
              </button>
            </div>
          )}
        </div>

        {/* Instructions */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl p-6 text-white">
          <h3 className="font-semibold mb-2">How to get the best results:</h3>
          <ul className="text-blue-100 text-sm space-y-1">
            <li>• Make sure the ingredients list is clearly visible and well-lit</li>
            <li>• Avoid glare or shadows on the label</li>
            <li>• Keep the camera steady and close enough to read the text</li>
            <li>• Ensure your health profile is complete for personalized analysis</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Scanner;

