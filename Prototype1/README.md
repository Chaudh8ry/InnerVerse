# 🍎 InnerVerse: Personalized Nutrition Scanner

**InnerVerse** is a smart web application built on the MERN stack that acts as a personal nutrition coach. It scans a food label's ingredients and nutritional facts, then provides a hyper-personalized analysis based on your unique health profile, body metrics, and dietary goals.

<!-- **Live Demo:** `[Link to your deployed project]` -->
---

## ✨ Core Features

* **Complete User Authentication:** Secure signup (First Name, Last Name, Email, Pass) and login using Node.js, Express, and JWT.
* **Hyper-Personalized Health Profile:** Users build a detailed profile including:
    * **Body Metrics:** Age, Height, Weight.
    * **Activity Level:** From Sedentary to Very Active.
    * **Health Data:** Chronic conditions (e.g., Diabetes, Hypertension) and allergies.
* **AI-Powered Scanning:**
    * A single-image upload extracts *both* the ingredients list and the full nutritional facts table using the Gemini AI.
    * A confirmation step allows the user to verify and correct any OCR errors before analysis.
* **Multi-Part Analysis Report:** A rich, multi-component report that includes:
    * **Overall Verdict:** A clear "Healthy," "Moderate," or "Unhealthy" rating.
    * **Personalized Summary:** A concise, AI-generated paragraph explaining the verdict based on the user's profile.
    * **DRI-Based Moderation Advice:** The app's "killer feature"—it provides quantitative advice (e.g., "A 30g serving is a better choice...") by calculating the user's Daily Recommended Intake (DRI) against the product's nutrition data.
    * **Alternative Suggestions:** Actionable suggestions for healthier alternatives if the product is a poor fit.
    * **Ingredient Profile Chart:** A `react-chartjs-2` doughnut chart visualizing the product's composition (e.g., "Natural" vs. "Additive").
    * **Itemized Ingredient Breakdown:** A detailed, card-based list for *every* ingredient, showing its own rating, traits, and personalized details.
* **Scan History:** Users can name, save, review, and delete all their past scans.

---

## 🛠️ Tech Stack & Architecture

This project is built on the **MERN** stack, treating the Google Gemini AI as an intelligent microservice for analysis.

### Frontend (Client)
* **React 19**
* **Vite** (Build Tool)
* **Tailwind CSS** (Styling)
* **`react-chartjs-2`** (Data Visualization)
* **`axios`** (API Communication)

### Backend (Server)
* **Node.js**
* **Express.js** (RESTful API Framework)
* **MongoDB** (NoSQL Database)
* **`mongoose`** (Object Data Modeling)
* **`bcrypt.js`** (Password Hashing)
* **`jsonwebtoken`** (User Auth)
* **`multer`** (Image File Uploads)

### External Services
* **Google Gemini API:** Used for all intelligent data extraction (OCR) and personalized analysis.

### Architecture
The app runs a "single-call" analysis model. Instead of caching data, it leverages the power of LLMs by sending the *entire context* (User Profile + Ingredients + Nutrition Table) in a single, complex API call. This results in a superior, holistic, and deeply personalized analysis that a traditional rules engine or caching model could not achieve.

---

## 🚀 Getting Started

To get a local copy up and running, follow these steps.

### Prerequisites

* Node.js (v18+)
* MongoDB (local instance or a cloud URI)
* A Google Gemini API Key

### Installation

1.  **Clone the repo:**
    ```sh
    git clone https://github.com/Chaudh8ry/InnerVerse.git
    cd InnerVerse
    ```

2.  **Install Backend Dependencies:**
    ```sh
    cd server # Or your backend folder
    npm install
    ```
    Create a `.env` file and add your variables:
    ```
    MONGO_URI=your_mongodb_connection_string
    JWT_SECRET=your_jwt_secret
    GEMINI_API_KEY=your_gemini_api_key
    ```

3.  **Install Frontend Dependencies:**
    ```sh
    cd client # Or your frontend folder
    npm install
    ```

4.  **Run the app:**
    * Start the backend: `npm run dev` (in the server folder)
    * Start the frontend: `npm run dev` (in the client folder)
    * Open `http://localhost:5173` (or your Vite port) in your browser.

---