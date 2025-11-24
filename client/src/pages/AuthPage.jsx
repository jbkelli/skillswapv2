import React, { useState } from 'react';
import LoginForm from '../components/LoginForm';
import SignupForm from '../components/SignupForm';
import NeuralBackground from '../components/NeuralBackground';

function AuthPage() {
  const [isLoginView, setIsLoginView] = useState(true);

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 relative overflow-hidden" style={{ backgroundColor: '#030712' }}>
      <NeuralBackground />
      
      {/* Desktop View - Side by Side */}
      <div className="hidden md:block relative w-full max-w-4xl h-[500px] bg-gray-900/80 backdrop-blur-xl border border-cyan-500/30 rounded-2xl shadow-2xl shadow-cyan-500/20 overflow-hidden z-10">

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

        {/* Overlay Panel - Cyber Tech Style */}
        <div
          className="absolute top-0 h-full w-1/2 flex items-center justify-center text-center text-white transition-all duration-700 ease-in-out z-20"
          style={{ 
            left: isLoginView ? '50%' : '0',
            background: 'linear-gradient(135deg, #0ea5e9 0%, #06b6d4 50%, #8b5cf6 100%)',
          }}
        >
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAwIDEwIEwgNDAgMTAgTSAxMCAwIEwgMTAgNDAgTSAwIDIwIEwgNDAgMjAgTSAyMCAwIEwgMjAgNDAgTSAwIDMwIEwgNDAgMzAgTSAzMCAwIEwgMzAgNDAiIGZpbGw9Im5vbmUiIHN0cm9rZT0icmdiYSgyNTUsMjU1LDI1NSwwLjEpIiBzdHJva2Utd2lkdGg9IjEiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JpZCkiLz48L3N2Zz4=')] opacity-20"></div>
          {isLoginView ? (
            <div className="p-8 relative z-10">
              <div className="mb-4 inline-block">
                <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center border-2 border-white/40 shadow-lg">
                  <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                  </svg>
                </div>
              </div>
              <h2 className="text-3xl font-bold mb-3 text-white drop-shadow-lg">New Here?</h2>
              <p className="mb-6 text-white/90 text-sm">Join the SkillSwap network and start exchanging knowledge!</p>
              <button 
                onClick={() => setIsLoginView(false)}
                className="bg-white/10 backdrop-blur-sm border-2 border-white/80 font-bold py-3 px-8 rounded-full hover:bg-white hover:text-cyan-600 transition-all duration-300 shadow-lg hover:shadow-white/50 hover:scale-105"
              >
                Sign Up
              </button>
            </div>
          ) : (
            <div className="p-8 relative z-10">
              <div className="mb-4 inline-block">
                <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center border-2 border-white/40 shadow-lg">
                  <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                  </svg>
                </div>
              </div>
              <h2 className="text-3xl font-bold mb-3 text-white drop-shadow-lg">Welcome Back!</h2>
              <p className="mb-6 text-white/90 text-sm">Already have an account? Log in to see your matches.</p>
              <button 
                onClick={() => setIsLoginView(true)}
                className="bg-white/10 backdrop-blur-sm border-2 border-white/80 font-bold py-3 px-8 rounded-full hover:bg-white hover:text-cyan-600 transition-all duration-300 shadow-lg hover:shadow-white/50 hover:scale-105"
              >
                Log In
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Mobile View - Stacked */}
      <div className="md:hidden w-full max-w-md z-10">
        <div className="bg-gray-900/90 backdrop-blur-xl border border-cyan-500/30 rounded-2xl shadow-2xl shadow-cyan-500/20 overflow-hidden">
          
          {/* Tab Switcher - Cyber Style */}
          <div className="flex border-b border-cyan-500/30 bg-gray-950/50">
            <button
              onClick={() => setIsLoginView(true)}
              className={`flex-1 py-4 font-bold text-lg transition-all duration-300 relative ${
                isLoginView 
                  ? 'text-white' 
                  : 'text-gray-400 hover:text-cyan-400'
              }`}
            >
              {isLoginView && (
                <div className="absolute inset-0 bg-linear-to-r from-cyan-500 to-blue-500 opacity-100"></div>
              )}
              <span className="relative z-10">Log In</span>
            </button>
            <button
              onClick={() => setIsLoginView(false)}
              className={`flex-1 py-4 font-bold text-lg transition-all duration-300 relative ${
                !isLoginView 
                  ? 'text-white' 
                  : 'text-gray-400 hover:text-cyan-400'
              }`}
            >
              {!isLoginView && (
                <div className="absolute inset-0 bg-linear-to-r from-cyan-500 to-blue-500 opacity-100"></div>
              )}
              <span className="relative z-10">Sign Up</span>
            </button>
          </div>

          {/* Form Content */}
          <div className="p-6">
            {isLoginView ? <LoginForm /> : <SignupForm />}
          </div>
        </div>
        
        {/* Mobile Info Text */}
        <div className="mt-6 text-center text-cyan-300/60 px-4">
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