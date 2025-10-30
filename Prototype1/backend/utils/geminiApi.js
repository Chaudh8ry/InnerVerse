const axios = require('axios');

class GeminiAPI {
  constructor(apiKey) {
    this.apiKey = apiKey || process.env.GEMINI_API_KEY;
    // URL for the multimodal model (image + text)
    this.visionApiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent`;
    // URL for the text-only model
    this.textApiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent`;
  }

  async extractIngredientsFromImage(imageBase64) {
    try {
      const prompt = `From the image of this food label, extract only the text from the 'Ingredients' section. Return only a single, comma-separated list of the ingredients. If you cannot find an ingredients list, return the exact string "NO_INGREDIENTS_FOUND".`;

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

      const response = await axios.post(`${this.visionApiUrl}?key=${this.apiKey}`, requestBody, {
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const text = response.data?.candidates?.[0]?.content?.parts?.[0]?.text;
      
      if (!text || text.trim().toUpperCase() === 'NO_INGREDIENTS_FOUND') {
        throw new Error('No ingredients found in the image');
      }

      return text.trim();

    } catch (error) {
      console.error('Gemini OCR error:', error.response?.data?.error || error.message);
      throw new Error('Failed to extract ingredients from image. The AI model could not find an ingredients list.');
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
      
      Return only valid JSON, no additional text or markdown formatting.`;

      const requestBody = {
        contents: [{
          parts: [{ text: prompt }]
        }]
      };

      const response = await axios.post(`${this.textApiUrl}?key=${this.apiKey}`, requestBody, {
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const text = response.data?.candidates?.[0]?.content?.parts?.[0]?.text;
      
      if (!text) {
        throw new Error('No response from Gemini API');
      }

      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        console.error("Gemini Response did not contain JSON:", text);
        throw new Error('No JSON found in response');
      }

      const analysisData = JSON.parse(jsonMatch[0]);
      
      if (!analysisData.type || !Array.isArray(analysisData.tags) || !Array.isArray(analysisData.potential_concerns)) {
        throw new Error('Invalid analysis data structure from AI');
      }

      return analysisData;

    } catch (error) {
      console.error('Gemini analysis error:', error.response?.data?.error || error.message);
      
      return {
        type: "unknown",
        tags: ["unanalyzed"],
        potential_concerns: []
      };
    }
  }
}

module.exports = GeminiAPI;