import React, { useState, useEffect } from 'react';
import Login from './components/Login';
import Register from './components/Register';
import Scanner from './components/Scanner';
import ProfileForm from './components/ProfileForm';
import ConfirmationView from './components/ConfirmationView';
import AnalysisReport from './components/AnalysisReport';
import ScanHistory from './components/ScanHistory';
import { getAuthToken, getUser, authAPI, profileAPI } from './services/api';

function App() {
  const [currentView, setCurrentView] = useState('loading');
  const [user, setUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [analysisData, setAnalysisData] = useState(null);

  useEffect(() => {
    initializeApp();
  }, []);

  const initializeApp = async () => {
    const token = getAuthToken();
    const savedUser = getUser();

    if (token && savedUser) {
      try {
        // Verify token is still valid and get fresh user data
        const response = await authAPI.getCurrentUser();
        const userData = response.data.user;
        
        setUser(userData);
        
        if (userData.hasProfile) {
          // Load user profile
          try {
            const profileResponse = await profileAPI.getProfile();
            setUserProfile(profileResponse.data.profile);
          } catch (profileError) {
            console.error('Error loading profile:', profileError);
          }
        }
        
        setCurrentView('scanner');
      } catch (error) {
        console.error('Token validation failed:', error);
        // Token is invalid, show login
        setCurrentView('login');
      }
    } else {
      setCurrentView('login');
    }
  };

  const handleLogin = (userData) => {
    setUser(userData);
    if (userData.hasProfile) {
      setCurrentView('scanner');
    } else {
      setCurrentView('profile');
    }
  };

  const handleRegister = (userData) => {
    setUser(userData);
    setCurrentView('profile'); // New users always need to create profile
  };

  const handleLogout = () => {
    setUser(null);
    setUserProfile(null);
    setAnalysisData(null);
    setCurrentView('login');
  };

  const handleProfileSaved = (profile) => {
    setUserProfile(profile);
    setUser(prev => ({ ...prev, hasProfile: true }));
    setCurrentView('scanner');
  };

  const handleAnalysisComplete = (data) => {
    setAnalysisData(data);
    if (data.step === 'confirmation') {
      setCurrentView('confirmation');
    } else if (data.step === 'results') {
      setCurrentView('results');
    }
  };

  const handleBackToScanner = () => {
    setAnalysisData(null);
    setCurrentView('scanner');
  };

  const handleNewAnalysis = () => {
    setAnalysisData(null);
    setCurrentView('scanner');
  };

  const handleViewScan = (report) => {
    setAnalysisData({ report });
    setCurrentView('results');
  };

  const switchToRegister = () => {
    setCurrentView('register');
  };

  const switchToLogin = () => {
    setCurrentView('login');
  };

  const goToProfile = () => {
    setCurrentView('profile');
  };

  const goToScanHistory = () => {
    setCurrentView('history');
  };

  if (currentView === 'loading') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading InnerVerse...</p>
        </div>
      </div>
    );
  }

  if (currentView === 'login') {
    return (
      <Login 
        onLogin={handleLogin}
        switchToRegister={switchToRegister}
      />
    );
  }

  if (currentView === 'register') {
    return (
      <Register 
        onRegister={handleRegister}
        switchToLogin={switchToLogin}
      />
    );
  }

  if (currentView === 'profile') {
    return (
      <ProfileForm 
        onBack={user?.hasProfile ? handleBackToScanner : null}
        onProfileSaved={handleProfileSaved}
        existingProfile={userProfile}
      />
    );
  }

  if (currentView === 'scanner') {
    return (
      <Scanner 
        user={user}
        onLogout={handleLogout}
        onProfileEdit={goToProfile}
        onAnalysisComplete={handleAnalysisComplete}
        onViewHistory={goToScanHistory}
      />
    );
  }

  if (currentView === 'history') {
    return (
      <ScanHistory
        onBack={handleBackToScanner}
        onViewScan={handleViewScan}
      />
    );
  }

  if (currentView === 'confirmation' && analysisData) {
    return (
      <ConfirmationView 
        data={analysisData}
        onBack={handleBackToScanner}
        onAnalysisComplete={handleAnalysisComplete}
      />
    );
  }

  if (currentView === 'results' && analysisData) {
    return (
      <AnalysisReport 
        report={analysisData.report}
        onBack={handleBackToScanner}
        onNewAnalysis={handleNewAnalysis}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-50 flex items-center justify-center">
      <div className="text-center">
        <p className="text-gray-600">Something went wrong. Please refresh the page.</p>
      </div>
    </div>
  );
}

export default App;