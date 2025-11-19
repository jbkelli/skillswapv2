import React, { useState } from 'react';

export default function SkillInput({ label, skills, setSkills, placeholder, icon = "⚡" }) {
  const [inputValue, setInputValue] = useState('');

  const capitalizeFirstLetter = (str) => {
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && inputValue.trim()) {
      e.preventDefault();
      
      // Split by comma, trim whitespace, filter empty strings
      const newSkills = inputValue
        .split(',')
        .map(skill => skill.trim())
        .filter(skill => skill.length > 0)
        .map(skill => {
          // Capitalize first letter of each word in the skill
          return skill
            .split(' ')
            .map(word => capitalizeFirstLetter(word))
            .join(' ');
        })
        .filter(skill => !skills.includes(skill)); // Avoid duplicates
      
      setSkills([...skills, ...newSkills]);
      setInputValue('');
    }
  };

  const removeSkill = (skillToRemove) => {
    setSkills(skills.filter(skill => skill !== skillToRemove));
  };

  return (
    <div className="w-full mb-4">
      <label className="block text-gray-300 text-sm mb-2">{label}</label>
      <div className="relative">
        <span className="absolute left-3 top-3 text-gray-500">{icon}</span>
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="w-full bg-gray-800 border border-gray-700 text-gray-300 rounded-lg py-3 pr-4 pl-10 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
        />
      </div>
      
      {/* Display added skills as tags */}
      {skills.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-2">
          {skills.map((skill, index) => (
            <span
              key={index}
              className="inline-flex items-center gap-1 bg-blue-600 text-white px-3 py-1 rounded-full text-sm"
            >
              {skill}
              <button
                type="button"
                onClick={() => removeSkill(skill)}
                className="hover:text-red-300 transition-colors"
              >
                ×
              </button>
            </span>
          ))}
        </div>
      )}
      <p className="text-xs text-gray-500 mt-1">Separate skills with commas, then press Enter</p>
    </div>
  );
}
