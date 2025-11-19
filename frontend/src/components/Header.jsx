// src/components/Header.jsx
import React, { useState } from 'react';
// Assuming you have 'lucide-react' installed for icons (used in AboutView)

/**
 * Header Component with conditional navigation and profile/auth icon.
 */
const Header = ({ onNavigate, currentPage, checkType, isAuthenticated, onLogout }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const navItems = [
    { page: 'Dashboard', label: 'Dashboard' },
    { page: 'Home', label: 'Home' },
    { page: 'Notifications', label: 'Notifications' },
  ];

  const handleMenuClick = (action) => {
    setIsMenuOpen(false);
    if (action === 'Login') {
      onNavigate('Login');
    } else if (action === 'Logout') {
      onLogout();
    } else if (action === 'About') {
      onNavigate('About');
    }
  };

  // Determine the display label for the main navigation links
  const getNavLinkLabel = (itemPage) => {
    if (itemPage === 'Home' && currentPage === 'CheckPage') {
      // Display the specific check type name (Machine/PPE) instead of 'Home'
      return checkType === 'Machine' ? 'Machine' : checkType === 'PPE' ? 'PPE' : 'Home';
    }
    return itemPage;
  };

  const getNavLinkIsActive = (itemPage) => {
    // Standard pages
    if (currentPage === itemPage) return true;
    
    // Special case: When on CheckPage, highlight the 'Home' link 
    // which serves as the base for Machine/PPE checks
    if (currentPage === 'CheckPage' && itemPage === 'Home') return true;
    
    return false;
  };
  
  // Define links that should always be available to non-logged-in users
  const publicNavItems = [
      { page: 'About', label: 'About' },
  ];

  return (
    <header className="bg-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          
          {/* Logo/Brand */}
          <div className="flex items-center">
            <span 
              className="text-2xl font-bold text-gray-800 cursor-pointer"
              onClick={() => onNavigate(isAuthenticated ? 'Home' : 'Login')}
            >
              TEIM
            </span>
          </div>

          {/* Navigation Links */}
          <nav className="hidden md:flex space-x-8 h-full items-center">
            {isAuthenticated ? (
                // Logged In Navigation (Dashboard, Home/Machine/PPE, Notifications, About)
                <>
                {navItems.map((item) => (
                    <button
                      key={item.page}
                      onClick={() => onNavigate(item.page)}
                      className={`
                        h-full flex items-center px-2 border-b-2 font-medium transition duration-150 ease-in-out
                        ${getNavLinkIsActive(item.page)
                          ? 'border-indigo-600 text-indigo-600'
                          : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                        }
                      `}
                    >
                      {getNavLinkLabel(item.label)}
                    </button>
                ))}
                
                {/* Always show About link in main nav */}
                <button
                    onClick={() => onNavigate('About')}
                    className={`
                        h-full flex items-center px-2 border-b-2 font-medium transition duration-150 ease-in-out
                        ${currentPage === 'About' 
                          ? 'border-indigo-600 text-indigo-600'
                          : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                        }
                    `}
                >
                    About
                </button>
                </>

            ) : (
                // Logged Out Navigation (Only About is visible)
                publicNavItems.map((item) => (
                    <button
                        key={item.page}
                        onClick={() => onNavigate(item.page)}
                        className={`
                            h-full flex items-center px-2 border-b-2 font-medium transition duration-150 ease-in-out
                            ${currentPage === item.page 
                              ? 'border-indigo-600 text-indigo-600'
                              : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                            }
                        `}
                    >
                        {item.label}
                    </button>
                ))
            )}
          </nav>
          
          {/* Profile/Auth Icon and Dropdown */}
          <div className="relative">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center text-white font-bold text-sm shadow-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
              aria-expanded={isMenuOpen}
              aria-controls="profile-menu"
            >
              T
            </button>
            
            {/* Dropdown Menu */}
            {isMenuOpen && (
              <div
                id="profile-menu"
                className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-md shadow-lg py-1 z-50"
              >
                {!isAuthenticated ? (
                    <>
                    <button 
                      onClick={() => handleMenuClick('Login')}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      Login
                    </button>
                    {/* About is in the main nav for desktop, but useful here for mobile */}
                    <button 
                        onClick={() => handleMenuClick('About')}
                        className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 md:hidden"
                    >
                        About
                    </button>
                    </>
                ) : (
                  <>
                    <button 
                      onClick={() => handleMenuClick('Logout')}
                      className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                    >
                      Logout
                    </button>
                  </>
                )}
              </div>
            )}
          </div>
          
        </div>
      </div>
    </header>
  );
};

export default Header;