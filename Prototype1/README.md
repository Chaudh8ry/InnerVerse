# InnerVerse - Personalized Food Analysis App

InnerVerse is a web application that allows users to take a picture of a food's ingredients list and get a personalized report on whether it's suitable for their specific health profile, allergies, and dietary needs.

## Features

- **User Authentication**: Secure signup/login system
- **Health Profile Management**: Comprehensive health profile with allergies, conditions, and dietary preferences
- **Food Label OCR**: Extract ingredients from food label images using AI
- **Ingredient Analysis**: Analyze ingredients with caching for performance
- **Personalized Reports**: Get customized health recommendations based on your profile
- **Rules Engine**: Smart conflict detection between ingredients and health conditions

## Tech Stack

### Backend
- **Node.js** with Express.js
- **MongoDB** with Mongoose
- **JWT** for authentication
- **Google Gemini API** for OCR and ingredient analysis
- **Multer** for file uploads
- **bcryptjs** for password hashing

### Frontend
- **React** with modern hooks
- **Tailwind CSS** for styling
- **Axios** for API calls
- **Lucide React** for icons

## Project Structure

```
Prototype1/
├── backend/                 # Backend server
│   ├── models/             # Database models
│   │   ├── User.js
│   │   ├── HealthProfile.js
│   │   └── Ingredient.js
│   ├── routes/             # API routes
│   │   ├── auth.js
│   │   ├── profile.js
│   │   └── analysis.js
│   ├── middleware/         # Custom middleware
│   │   └── auth.js
│   ├── utils/              # Utility functions
│   │   ├── geminiApi.js
│   │   └── rulesEngine.js
│   ├── uploads/            # Uploaded images
│   └── server.js           # Main server file
├── src/                    # Frontend React app
│   ├── components/         # React components
│   │   ├── Login.jsx
│   │   ├── Register.jsx
│   │   ├── Scanner.jsx
│   │   ├── ProfileForm.jsx
│   │   ├── ConfirmationView.jsx
│   │   └── AnalysisReport.jsx
│   ├── services/           # API service layer
│   │   └── api.js
│   └── App.jsx            # Main App component
└── README.md
```

## Setup Instructions

### Prerequisites

- **Node.js** (v16 or higher)
- **MongoDB** (local installation or MongoDB Atlas)
- **Google Gemini API Key**

### 1. Clone and Install Dependencies

```bash
# Install frontend dependencies
cd Prototype1
npm install

# Install backend dependencies
cd backend
npm install
```

### 2. Environment Configuration

Create a `.env` file in the `backend` directory:

```bash
cd backend
cp env.example .env
```

Edit the `.env` file with your configuration:

```env
# Database
MONGODB_URI=mongodb://localhost:27017/innerverse
# OR for MongoDB Atlas:
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/innerverse

# JWT Secret (generate a secure random string)
JWT_SECRET=your_super_secret_jwt_key_here

# Google Gemini API Key
GEMINI_API_KEY=your_gemini_api_key_here

# Server Configuration
PORT=5000
NODE_ENV=development
```

### 3. Get Google Gemini API Key

1. Go to [Google AI Studio](https://aistudio.google.com/)
2. Sign in with your Google account
3. Create a new API key
4. Copy the API key to your `.env` file

### 4. Set Up MongoDB

**Option A: Local MongoDB**
1. Install MongoDB locally
2. Start MongoDB service
3. Use `mongodb://localhost:27017/innerverse` as your connection string

**Option B: MongoDB Atlas (Cloud)**
1. Create account at [MongoDB Atlas](https://www.mongodb.com/atlas)
2. Create a new cluster
3. Get your connection string
4. Replace the MONGODB_URI in `.env`

### 5. Start the Application

**Terminal 1 - Backend Server:**
```bash
cd backend
npm run dev
```
The backend will start on http://localhost:5000

**Terminal 2 - Frontend Development Server:**
```bash
cd Prototype1
npm run dev
```
The frontend will start on http://localhost:5173

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user

### Profile Management
- `POST /api/profile` - Create/update health profile
- `GET /api/profile` - Get user's health profile

### Analysis
- `POST /api/analysis/extract-ingredients` - Extract ingredients from image
- `POST /api/analysis/analyze-ingredients` - Analyze ingredients and generate report
- `GET /api/analysis/ingredient/:name` - Get cached ingredient analysis

## Database Models

### Users Table
- `email`: User's login email
- `password`: Hashed password
- `health_profile`: Reference to HealthProfile

### Health Profile Table
- `user`: Reference to User
- `age_group`: Selected age group
- `allergies`: Array of food allergies
- `health_conditions`: Array of health conditions with categories
- `dietary_preferences`: Array of dietary preferences
- `additional_info`: Additional notes
- `body_metrics`: Height, weight, BMI data

### Ingredients Table (Cache)
- `ingredient_name`: Unique ingredient name
- `analysis_json`: Structured analysis data from AI
- `last_analyzed`: Timestamp of last analysis

## Core Workflow

1. **User Authentication**: Login/signup with email and password
2. **Health Profile Setup**: Complete comprehensive health questionnaire
3. **Image Upload**: Take photo or upload food label image
4. **OCR Processing**: Extract ingredients text using Gemini AI
5. **User Confirmation**: Review and edit extracted ingredients
6. **Ingredient Analysis**: Analyze each ingredient (with caching)
7. **Personalized Report**: Generate health recommendations based on profile
8. **Results Display**: Show warnings, conflicts, and overall assessment

## Rules Engine

The application includes a sophisticated rules engine that checks for conflicts between ingredients and user health conditions:

- **Allergy Detection**: Matches ingredient tags with user allergies
- **Health Condition Conflicts**: Identifies ingredients that may affect specific health conditions
- **Dietary Preference Violations**: Flags ingredients that don't match dietary choices
- **Priority Levels**: Categorizes warnings as HIGH, MEDIUM, or LOW priority

## Development Notes

### Adding New Health Conditions

1. Update the `nutritionData` object in `ProfileForm.jsx`
2. Add corresponding rules in `utils/rulesEngine.js`
3. Update the database enum in `HealthProfile.js` if needed

### Extending Ingredient Analysis

1. Modify the prompt in `utils/geminiApi.js`
2. Update the rules engine to handle new analysis fields
3. Adjust the frontend components to display new data

### Performance Optimization

- Ingredient analysis results are cached in MongoDB
- Images are processed server-side and then deleted
- JWT tokens include expiration for security

## Troubleshooting

### Common Issues

1. **MongoDB Connection Error**
   - Check if MongoDB is running
   - Verify connection string in `.env`

2. **Gemini API Errors**
   - Verify API key is correct
   - Check if you have sufficient API quota
   - Ensure image format is supported

3. **CORS Issues**
   - Backend includes CORS middleware
   - Check if frontend URL matches expected origin

4. **Image Upload Fails**
   - Check file size (10MB limit)
   - Verify supported formats (jpeg, jpg, png, gif, webp)
   - Ensure uploads directory exists

### Logs and Debugging

- Backend logs are displayed in the terminal
- Check browser console for frontend errors
- MongoDB connection status is logged on startup

## Future Enhancements

- [ ] Multi-language support
- [ ] Barcode scanning
- [ ] Nutrition facts analysis
- [ ] Recipe recommendations
- [ ] Social features (sharing reports)
- [ ] Mobile app version
- [ ] Advanced filtering options
- [ ] Export reports to PDF

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is for educational purposes. Please respect API usage limits and terms of service for all third-party services used.

## Support

For issues and questions:
1. Check the troubleshooting section
2. Review the console logs
3. Verify all environment variables are set correctly
4. Ensure all dependencies are installed