const axios = require('axios');

class GeminiAPI {
  constructor(apiKey) {
    this.apiKey = apiKey || process.env.GEMINI_API_KEY;
    this.baseUrl = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent';
  }

  async extractIngredientsFromImage(imageBase64) {
    try {
      const prompt = `Extract the text from the 'Ingredients' section of this food label. Return only a comma-separated list of the ingredients. If no ingredients section is found, return "NO_INGREDIENTS_FOUND".`;

      const requestBody = {
        contents: [{
          parts: [
            { text: prompt },
            {
              inline_data: {
                mime_type: "image/jpeg",
                data: imageBase64
              }
            }
          ]
        }]
      };

      const response = await axios.post(`${this.baseUrl}?key=${this.apiKey}`, requestBody, {
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const text = response.data?.candidates?.[0]?.content?.parts?.[0]?.text;
      
      if (!text || text.trim() === 'NO_INGREDIENTS_FOUND') {
        throw new Error('No ingredients found in the image');
      }

      return text.trim();

    } catch (error) {
      console.error('Gemini OCR error:', error.response?.data || error.message);
      throw new Error('Failed to extract ingredients from image');
    }
  }

  async analyzeIngredient(ingredientName) {
    try {
      const prompt = `Provide a structured JSON data profile for the ingredient: "${ingredientName}". 
      The JSON should have exactly these keys:
      - "type": a brief category (e.g., "preservative", "sweetener", "protein", "carbohydrate", "fat", "vitamin", "mineral", "additive", "natural", "artificial")
      - "tags": an array of relevant tags (e.g., ["gluten_free", "vegan", "contains_dairy", "artificial", "processed", "natural", "high_sodium", "high_sugar", "allergen"])
      - "potential_concerns": an array of objects, each with "condition" and "level" keys, where level is "LOW", "MEDIUM", or "HIGH"
      
      Example format:
      {
        "type": "preservative",
        "tags": ["artificial", "processed"],
        "potential_concerns": [
          {"condition": "Hypertension", "level": "MEDIUM"},
          {"condition": "Heart Disease", "level": "LOW"}
        ]
      }
      
      Return only valid JSON, no additional text.`;

      const requestBody = {
        contents: [{
          parts: [{ text: prompt }]
        }]
      };

      const response = await axios.post(`${this.baseUrl}?key=${this.apiKey}`, requestBody, {
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const text = response.data?.candidates?.[0]?.content?.parts?.[0]?.text;
      
      if (!text) {
        throw new Error('No response from Gemini API');
      }

      // Clean the response to extract JSON
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('No JSON found in response');
      }

      const analysisData = JSON.parse(jsonMatch[0]);
      
      // Validate the structure
      if (!analysisData.type || !Array.isArray(analysisData.tags) || !Array.isArray(analysisData.potential_concerns)) {
        throw new Error('Invalid analysis data structure');
      }

      return analysisData;

    } catch (error) {
      console.error('Gemini analysis error:', error.response?.data || error.message);
      
      // Return a fallback analysis for unknown ingredients
      return {
        type: "unknown",
        tags: ["unanalyzed"],
        potential_concerns: []
      };
    }
  }
}

module.exports = GeminiAPI;

