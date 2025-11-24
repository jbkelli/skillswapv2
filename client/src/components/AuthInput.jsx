// client/src/components/AuthInput.jsx
import React from 'react';

// This must be a default export
export default function AuthInput({ icon, ...props }) {
  return (
    <div className="relative w-full mb-4">
      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-cyan-400">
        {icon}
      </span>
      <input
        {...props}
        className="w-full bg-gray-800/50 backdrop-blur-sm border border-cyan-500/30 text-white placeholder-gray-500 rounded-lg py-3 pr-4 pl-10 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 focus:shadow-lg focus:shadow-cyan-500/30 transition-all duration-300 hover:border-cyan-500/50"
      />
    </div>
  );
}