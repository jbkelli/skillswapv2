import React, { useState } from 'react';
import LoginForm from '../components/LoginForm';
import SignupForm from '../components/SignupForm';

function AuthPage() {
  const [isLoginView, setIsLoginView] = useState(true);

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 bg-gray-950">
      
      {/* Desktop View - Side by Side */}
      <div className="hidden md:block relative w-full max-w-4xl h-[500px] bg-gray-900 border border-gray-800 rounded-2xl shadow-2xl shadow-blue-500/10 overflow-hidden">

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

        {/* Overlay Panel */}
        <div
          className="absolute top-0 h-full w-1/2 flex items-center justify-center text-center text-white bg-blue-600 transition-all duration-700 ease-in-out z-20"
          style={{ 
            left: isLoginView ? '50%' : '0',
          }}
        >
          {isLoginView ? (
            <div className="p-8">
              <h2 className="text-3xl font-bold mb-4">New Here?</h2>
              <p className="mb-6">Join the SkillSwap network and start exchanging knowledge!</p>
              <button 
                onClick={() => setIsLoginView(false)}
                className="bg-transparent border-2 border-white font-bold py-2 px-6 rounded-full hover:bg-white hover:text-blue-600 transition-colors"
              >
                Sign Up
              </button>
            </div>
          ) : (
            <div className="p-8">
              <h2 className="text-3xl font-bold mb-4">Welcome Back!</h2>
              <p className="mb-6">Already have an account? Log in to see your matches.</p>
              <button 
                onClick={() => setIsLoginView(true)}
                className="bg-transparent border-2 border-white font-bold py-2 px-6 rounded-full hover:bg-white hover:text-blue-600 transition-colors"
              >
                Log In
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Mobile View - Stacked */}
      <div className="md:hidden w-full max-w-md">
        <div className="bg-gray-900 border border-gray-800 rounded-2xl shadow-2xl shadow-blue-500/10 overflow-hidden">
          
          {/* Tab Switcher */}
          <div className="flex border-b border-gray-800">
            <button
              onClick={() => setIsLoginView(true)}
              className={`flex-1 py-4 font-bold text-lg transition-colors ${
                isLoginView 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-800 text-gray-400 hover:text-white'
              }`}
            >
              Log In
            </button>
            <button
              onClick={() => setIsLoginView(false)}
              className={`flex-1 py-4 font-bold text-lg transition-colors ${
                !isLoginView 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-800 text-gray-400 hover:text-white'
              }`}
            >
              Sign Up
            </button>
          </div>

          {/* Form Content */}
          <div className="p-6">
            {isLoginView ? <LoginForm /> : <SignupForm />}
          </div>
        </div>
        
        {/* Mobile Info Text */}
        <div className="mt-6 text-center text-gray-400 px-4">
          <p className="text-sm">
            {isLoginView 
              ? "Don't have an account? Switch to Sign Up above." 
              : "Already have an account? Switch to Log In above."}
          </p>
        </div>
      </div>
      
    </div>
  );
}

export default AuthPage;