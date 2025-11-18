import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Header() {
  const { logout, isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Debug: Log user data
  console.log('Header - User data:', user);
  console.log('Header - Profile Image:', user?.profileImage);

  return (
    <header className="bg-gray-900 border-b border-gray-800 py-4 px-4 sm:px-6">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        <div 
          className="flex items-center gap-3 cursor-pointer" 
          onClick={() => navigate(isAuthenticated ? '/dashboard' : '/')}
        >
          {/* Show user profile image if available, otherwise show favicon */}
          <img 
            src={user?.profileImage || '/skillswap-favicon.svg'} 
            alt={user?.firstName || 'SkillSwap'}
            className="w-10 h-10 rounded-full object-cover border-2 border-blue-500"
            onError={(e) => {
              console.error('Image failed to load:', e.target.src);
              e.target.src = '/skillswap-favicon.svg';
            }}
          />
          <h1 className="text-xl sm:text-2xl font-bold text-blue-500">
            SkillSwap
          </h1>
        </div>
        
        {/* Mobile menu button */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden p-2 rounded-lg hover:bg-gray-800 transition-colors"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            {mobileMenuOpen ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>

        {/* Desktop navigation */}
        <nav className="hidden md:flex gap-4 lg:gap-6 items-center">
          {isAuthenticated ? (
            <>
              <button onClick={() => navigate('/dashboard')} className="hover:text-blue-400 transition-colors">
                Home
              </button>
              <button onClick={() => navigate('/profile')} className="hover:text-blue-400 transition-colors">
                Profile
              </button>
              <button onClick={() => navigate('/requests')} className="hover:text-blue-400 transition-colors">
                Requests
              </button>
              <button onClick={() => navigate('/groups')} className="hover:text-blue-400 transition-colors">
                Groups
              </button>
              <button onClick={() => navigate('/contact')} className="hover:text-blue-400 transition-colors">
                Contact
              </button>
              
              {/* Power Button Logout */}
              <button 
                onClick={logout} 
                className="p-2 rounded-lg hover:bg-red-700 transition-colors"
                style={{ backgroundColor: '#dc2626' }}
                title="Logout"
              >
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.636 18.364a9 9 0 010-12.728m12.728 0a9 9 0 010 12.728m-9.9-2.829a5 5 0 010-7.07m7.072 0a5 5 0 010 7.07M13 12a1 1 0 11-2 0 1 1 0 012 0z" />
                </svg>
              </button>
            </>
          ) : (
            <>
              <button onClick={() => navigate('/contact')} className="hover:text-blue-400 transition-colors">
                Contact
              </button>
              <button onClick={() => navigate('/login')} className="hover:text-blue-400 transition-colors">
                Login
              </button>
              <button onClick={() => navigate('/signup')} className="bg-blue-600 px-4 py-2 rounded-lg hover:bg-blue-500 transition-colors">
                Sign Up
              </button>
            </>
          )}
        </nav>
      </div>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="md:hidden mt-4 pb-4 px-4 border-t border-gray-800">
          <nav className="flex flex-col gap-3 pt-4">
            {isAuthenticated ? (
              <>
                <button onClick={() => { navigate('/dashboard'); setMobileMenuOpen(false); }} className="text-left py-2 hover:text-blue-400 transition-colors">
                  Home
                </button>
                <button onClick={() => { navigate('/profile'); setMobileMenuOpen(false); }} className="text-left py-2 hover:text-blue-400 transition-colors">
                  Profile
                </button>
                <button onClick={() => { navigate('/requests'); setMobileMenuOpen(false); }} className="text-left py-2 hover:text-blue-400 transition-colors">
                  Requests
                </button>
                <button onClick={() => { navigate('/groups'); setMobileMenuOpen(false); }} className="text-left py-2 hover:text-blue-400 transition-colors">
                  Groups
                </button>
                <button onClick={() => { navigate('/contact'); setMobileMenuOpen(false); }} className="text-left py-2 hover:text-blue-400 transition-colors">
                  Contact
                </button>
                <button 
                  onClick={() => { logout(); setMobileMenuOpen(false); }} 
                  className="text-left py-2 text-red-400 hover:text-red-300 transition-colors"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <button onClick={() => { navigate('/contact'); setMobileMenuOpen(false); }} className="text-left py-2 hover:text-blue-400 transition-colors">
                  Contact
                </button>
                <button onClick={() => { navigate('/login'); setMobileMenuOpen(false); }} className="text-left py-2 hover:text-blue-400 transition-colors">
                  Login
                </button>
                <button onClick={() => { navigate('/signup'); setMobileMenuOpen(false); }} className="bg-blue-600 px-4 py-2 rounded-lg hover:bg-blue-500 transition-colors text-center">
                  Sign Up
                </button>
              </>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}
