import React, { useState } from 'react';
import LoginForm from '../components/LoginForm';
import SignupForm from '../components/SignupForm';

function AuthPage() {
  const [isLoginView, setIsLoginView] = useState(true);

  return (
    // Main container, centered
    <div className="min-h-screen w-full flex items-center justify-center p-4">
      
      {/* 2. The main "card", relative container */}
      <div className="relative w-full max-w-4xl h-[500px] bg-gray-900 border border-gray-800 rounded-2xl shadow-2xl shadow-blue-500/10 overflow-hidden">

        {/* --- FORM PANELS --- */}
        
        {/* Login Form Panel */}
        <div 
          className="absolute top-0 left-0 h-full w-1/2 flex items-center justify-center p-10 transition-all duration-700 ease-in-out"
          style={{
            opacity: isLoginView ? 1 : 0,
            zIndex: isLoginView ? 10 : 0,
            pointerEvents: isLoginView ? 'auto' : 'none'
          }}
        >
          <LoginForm />
        </div>

        {/* Signup Form Panel */}
        <div 
          className="absolute top-0 right-0 h-full w-1/2 flex items-center justify-center p-10 transition-all duration-700 ease-in-out"
          style={{
            opacity: isLoginView ? 0 : 1,
            zIndex: isLoginView ? 0 : 10,
            pointerEvents: isLoginView ? 'none' : 'auto'
          }}
        >
          <SignupForm />
        </div>


        {/* --- OVERLAY PANEL --- */}
        <div
          className="absolute top-0 h-full w-1/2 flex items-center justify-center text-center text-white bg-blue-600 transition-all duration-700 ease-in-out z-20"
          style={{ 
            left: isLoginView ? '50%' : '0',
          }}
        >
          {isLoginView ? (
             // Overlay for "Sign Up"
            <div className="p-8">
              <h2 className="text-3xl font-bold mb-4">New Here?</h2>
              <p className="mb-6">Join the SkillSwap network and start exchanging knowledge!</p>
              <button 
                onClick={() => setIsLoginView(false)} // Set to Sign Up view
                className="bg-transparent border-2 border-white font-bold py-2 px-6 rounded-full"
              >
                Sign Up
              </button>
            </div>
          ) : (
            // Overlay for "Log In"
            <div className="p-8">
              <h2 className="text-3xl font-bold mb-4">Welcome Back!</h2>
              <p className="mb-6">Already have an account? Log in to see your matches.</p>
              <button 
                onClick={() => setIsLoginView(true)} // Set to Log In view
                className="bg-transparent border-2 border-white font-bold py-2 px-6 rounded-full"
              >
                Log In
              </button>
            </div>
          )}
        </div>
        
      </div>
    </div>
  );
}

export default AuthPage;