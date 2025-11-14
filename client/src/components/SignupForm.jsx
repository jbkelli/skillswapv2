// client/src/components/SignupForm.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import AuthInput from './AuthInput';
import SkillInput from './SkillInput';

// This MUST be a default export
export default function SignupForm() {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  const [skillsHave, setSkillsHave] = useState([]);
  const [skillsWant, setSkillsWant] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { signup } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Validation
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    if (skillsHave.length === 0) {
      setError('Please add at least one skill you have');
      return;
    }

    if (skillsWant.length === 0) {
      setError('Please add at least one skill you want to learn');
      return;
    }

    setLoading(true);

    const signupData = {
      firstName: formData.firstName,
      lastName: formData.lastName,
      username: formData.username,
      email: formData.email,
      password: formData.password,
      skillsHave,
      skillsWant
    };

    const result = await signup(signupData);
    
    if (result.success) {
      navigate('/dashboard');
    } else {
      setError(result.error);
    }
    
    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="w-full max-h-[450px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-gray-800">
      <h2 className="text-3xl font-bold text-center text-white mb-4">
        Create Account
      </h2>

      {error && (
        <div className="bg-red-500/20 border border-red-500 text-red-300 px-3 py-2 rounded-lg mb-3 text-sm">
          {error}
        </div>
      )}

      <div className="grid grid-cols-2 gap-3">
        <AuthInput
          icon="👤"
          type="text"
          name="firstName"
          placeholder="First Name"
          value={formData.firstName}
          onChange={handleChange}
          required
        />
        <AuthInput
          icon="👤"
          type="text"
          name="lastName"
          placeholder="Last Name"
          value={formData.lastName}
          onChange={handleChange}
          required
        />
      </div>

      <AuthInput
        icon="@"
        type="text"
        name="username"
        placeholder="Username"
        value={formData.username}
        onChange={handleChange}
        required
      />
      <AuthInput
        icon="✉️"
        type="email"
        name="email"
        placeholder="Email"
        value={formData.email}
        onChange={handleChange}
        required
      />
      <AuthInput
        icon="🔒"
        type="password"
        name="password"
        placeholder="Password"
        value={formData.password}
        onChange={handleChange}
        required
      />
      <AuthInput
        icon="🔒"
        type="password"
        name="confirmPassword"
        placeholder="Confirm Password"
        value={formData.confirmPassword}
        onChange={handleChange}
        required
      />

      <SkillInput
        label="Skills I Have"
        skills={skillsHave}
        setSkills={setSkillsHave}
        placeholder="e.g., React, JavaScript, Python"
        icon="💡"
      />

      <SkillInput
        label="Skills I Want to Learn"
        skills={skillsWant}
        setSkills={setSkillsWant}
        placeholder="e.g., Cybersecurity, Machine Learning"
        icon="🎯"
      />

      <button
        type="submit"
        className="w-full bg-blue-600 text-white font-bold py-3 rounded-lg hover:bg-blue-500 transition-all duration-300 mt-2"
      >
        Sign Up
      </button>
    </form>
  );
}