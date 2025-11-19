import React, { useState, useRef, useEffect } from 'react';
import techSkills from '../data/techSkills';

export default function SkillInput({ label, skills, setSkills, placeholder, icon = "⚡" }) {
  const [inputValue, setInputValue] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const [filteredSkills, setFilteredSkills] = useState([]);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const dropdownRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    // Filter skills based on input
    if (inputValue.trim()) {
      const filtered = techSkills
        .filter(skill => 
          skill.toLowerCase().includes(inputValue.toLowerCase()) &&
          !skills.includes(skill)
        )
        .slice(0, 10); // Limit to 10 suggestions
      setFilteredSkills(filtered);
      setShowDropdown(filtered.length > 0);
    } else {
      setFilteredSkills([]);
      setShowDropdown(false);
    }
  }, [inputValue, skills]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const addSkill = (skill) => {
    if (!skills.includes(skill)) {
      setSkills([...skills, skill]);
    }
    setInputValue('');
    setShowDropdown(false);
    setSelectedIndex(-1);
    inputRef.current?.focus();
  };

  const handleKeyDown = (e) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => 
        prev < filteredSkills.length - 1 ? prev + 1 : prev
      );
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => prev > 0 ? prev - 1 : -1);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      
      if (selectedIndex >= 0 && filteredSkills[selectedIndex]) {
        addSkill(filteredSkills[selectedIndex]);
      } else if (inputValue.trim()) {
        // Split by comma, trim whitespace, filter empty strings
        const newSkills = inputValue
          .split(',')
          .map(skill => skill.trim())
          .filter(skill => skill.length > 0)
          .filter(skill => !skills.includes(skill)); // Avoid duplicates
        
        setSkills([...skills, ...newSkills]);
        setInputValue('');
        setShowDropdown(false);
      }
    } else if (e.key === 'Escape') {
      setShowDropdown(false);
      setSelectedIndex(-1);
    }
  };

  const removeSkill = (skillToRemove) => {
    setSkills(skills.filter(skill => skill !== skillToRemove));
  };

  return (
    <div className="w-full mb-4" ref={dropdownRef}>
      <label className="block text-gray-300 text-sm mb-2">{label}</label>
      <div className="relative">
        <span className="absolute left-3 top-3 text-gray-500 z-10">{icon}</span>
        <input
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => inputValue && setShowDropdown(filteredSkills.length > 0)}
          placeholder={placeholder}
          className="w-full bg-gray-800 border border-gray-700 text-gray-300 rounded-lg py-3 pr-4 pl-10 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
          autoComplete="off"
        />
        
        {/* Dropdown */}
        {showDropdown && filteredSkills.length > 0 && (
          <div className="absolute z-50 w-full mt-1 bg-gray-800 border border-gray-700 rounded-lg shadow-2xl max-h-60 overflow-y-auto">
            {filteredSkills.map((skill, index) => (
              <div
                key={skill}
                onClick={() => addSkill(skill)}
                className={`px-4 py-2 cursor-pointer transition-colors ${
                  index === selectedIndex
                    ? 'bg-blue-600 text-white'
                    : 'hover:bg-gray-700 text-gray-300'
                }`}
              >
                {skill}
              </div>
            ))}
          </div>
        )}
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
      <p className="text-xs text-gray-500 mt-1">
        Start typing to see suggestions, or separate multiple skills with commas
      </p>
    </div>
  );
}