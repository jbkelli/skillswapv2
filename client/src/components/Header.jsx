import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

export default function Header() {
  const { logout, isAuthenticated } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  return (
    <header className="bg-gray-900 border-b border-gray-800 py-4 px-6">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        <h1 
          className="text-2xl font-bold text-blue-500 cursor-pointer" 
          onClick={() => navigate(isAuthenticated ? '/dashboard' : '/')}
        >
          SkillSwap
        </h1>
        <nav className="flex gap-6 items-center">
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
              
              {/* Theme Toggle */}
              <button
                onClick={toggleTheme}
                className="p-2 rounded-lg hover:bg-gray-800 transition-colors"
                title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
              >
                {theme === 'dark' ? (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                  </svg>
                )}
              </button>
              
              {/* Power Button Logout */}
              <button 
                onClick={logout} 
                className="bg-red-600 p-2 rounded-lg hover:bg-red-700 transition-colors"
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
              <button
                onClick={toggleTheme}
                className="p-2 rounded-lg hover:bg-gray-800 transition-colors"
                title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
              >
                {theme === 'dark' ? (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                  </svg>
                )}
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
    </header>
  );
}
