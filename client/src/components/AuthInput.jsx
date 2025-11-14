// client/src/components/AuthInput.jsx
import React from 'react';

// This must be a default export
export default function AuthInput({ icon, ...props }) {
  return (
    <div className="relative w-full mb-4">
      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
        {icon}
      </span>
      <input
        {...props}
        className="w-full bg-gray-800 border border-gray-700 text-gray-300 rounded-lg py-3 pr-4 pl-10 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
      />
    </div>
  );
}