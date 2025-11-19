// src/App.jsx
import React, { useState } from 'react';

// Components
import Header from './components/Header';
import TitleBanner from './components/TitleBanner';

// Views
import HomeView from './views/HomeView';
import DashboardView from './views/DashboardView';
import NotificationsView from './views/NotificationsView';
import CheckView from './views/CheckView';
import AboutView from './views/AboutView';
import PPEDetectionView from './views/PPEDetectionView';

// Authentication Views
import LoginView from './views/LoginView';
import SignupView from './views/SignupView';
import ForgotPasswordView from './views/ForgotPasswordView';


const App = () => {
  const [currentPage, setCurrentPage] = useState('Login');
  const [checkType, setCheckType] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null); // Store logged-in user info

  // --- Authentication & Navigation handlers ---
  const handleLoginSuccess = (userData) => {
    setUser(userData);
    setIsLoggedIn(true);
    setCurrentPage('Home');
  };

  const handleLogout = () => {
    setUser(null);
    setIsLoggedIn(false);
    setCurrentPage('Login');
  };

  const handleNavigate = (page) => {
    if (!isLoggedIn && !['Login', 'Signup', 'ForgotPassword', 'About'].includes(page)) {
      setCurrentPage('Login');
      return;
    }
    setCurrentPage(page);
    if (page !== 'CheckPage') {
      setCheckType(null);
    }
  };

  // Handle selection of different check types
  const handleSelectCheck = (type) => {
    if (type === 'PPE') {
      setCurrentPage('PPE'); // Go to PPEDetectionView
    } else {
      setCheckType(type);
      setCurrentPage('CheckPage');
    }
  };

  // --- Render Content based on Auth State and Page ---
  let content;

  if (!isLoggedIn || ['Login', 'Signup', 'ForgotPassword', 'About'].includes(currentPage)) {
    // Public or Auth views
    switch (currentPage) {
      case 'Signup':
        content = <SignupView onNavigate={handleNavigate} />;
        break;
      case 'ForgotPassword':
        content = <ForgotPasswordView onNavigate={handleNavigate} />;
        break;
      case 'About':
        content = <AboutView onNavigate={handleNavigate} />;
        break;
      case 'Login':
      default:
        content = (
          <LoginView
            onNavigate={handleNavigate}
            onLoginSuccess={handleLoginSuccess}
          />
        );
        break;
    }
  } else {
    // Authenticated views
    switch (currentPage) {
      case 'Dashboard':
        content = <DashboardView />;
        break;
      case 'Notifications':
        content = <NotificationsView />;
        break;
      case 'CheckPage':
        content = <CheckView checkType={checkType} />;
        break;
      case 'About':
        content = <AboutView onNavigate={handleNavigate} />;
        break;
      case 'PPE':
        content = <PPEDetectionView />;
        break;
      case 'Home':
      default:
        content = <HomeView onSelectCheck={handleSelectCheck} />;
        break;
    }
  }
  const isAuthView = ['Login', 'Signup', 'ForgotPassword'].includes(currentPage);
  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      <Header
        onNavigate={handleNavigate}
        currentPage={currentPage}
        checkType={checkType}
        user={user}
        isAuthenticated={isLoggedIn}
        onLogout={handleLogout}
      />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {!isAuthView && currentPage !== 'About' && <TitleBanner />}
        <div className="pb-12">{content}</div>
      </main>
    </div>
  );
};

export default App;
