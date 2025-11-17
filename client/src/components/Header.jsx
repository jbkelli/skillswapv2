import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Header() {
  const { logout, isAuthenticated } = useAuth();
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
              
              {/* Power Button Logout */
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
    </header>
  );
}
