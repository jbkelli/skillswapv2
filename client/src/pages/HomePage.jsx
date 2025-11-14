import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { userService, swapService } from '../services';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import NeuralBackground from '../components/NeuralBackground';
import Footer from '../components/Footer';
import AIChatbot from '../components/AIChatbot';

export default function HomePage() {
  const { user } = useAuth();
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterSkill, setFilterSkill] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await userService.getAllUsers();
      // Sort users by match score (AI matching will be added later)
      const sortedUsers = sortUsersByMatch(response.users);
      setUsers(sortedUsers);
      setFilteredUsers(sortedUsers);
      setLoading(false);
    } catch (err) {
      setError('Failed to load users');
      setLoading(false);
    }
  };

  // Filter and search users
  useEffect(() => {
    let result = [...users];

    // Apply search filter
    if (searchQuery) {
      result = result.filter(u => 
        u.firstName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        u.lastName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        u.username?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        u.bio?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Apply skill filter
    if (filterSkill) {
      result = result.filter(u => 
        u.skillsHave?.some(s => s.toLowerCase().includes(filterSkill.toLowerCase())) ||
        u.skillsWant?.some(s => s.toLowerCase().includes(filterSkill.toLowerCase()))
      );
    }

    setFilteredUsers(result);
  }, [searchQuery, filterSkill, users]);

  // Simple matching algorithm (will be enhanced with AI later)
  const sortUsersByMatch = (allUsers) => {
    return allUsers.sort((a, b) => {
      const scoreA = calculateMatchScore(a);
      const scoreB = calculateMatchScore(b);
      return scoreB - scoreA;
    });
  };

  const calculateMatchScore = (otherUser) => {
    let score = 0;
    
    // Check if what I want matches what they have
    user.skillsWant?.forEach(skill => {
      if (otherUser.skillsHave?.some(s => s.toLowerCase().includes(skill.toLowerCase()))) {
        score += 10;
      }
    });

    // Check if what they want matches what I have
    otherUser.skillsWant?.forEach(skill => {
      if (user.skillsHave?.some(s => s.toLowerCase().includes(skill.toLowerCase()))) {
        score += 10;
      }
    });

    return score;
  };

  const handleSendRequest = async (receiverId) => {
    try {
      await swapService.sendRequest(receiverId, 'Hi! Let\'s swap skills!');
      alert('Swap request sent!');
    } catch (err) {
      alert('Failed to send request');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <NeuralBackground />
        <div className="text-white text-xl relative z-10">Loading...</div>
      </div>
    );
  }

  // Get all unique skills from all users for filter dropdown
  const allSkills = [...new Set([
    ...users.flatMap(u => u.skillsHave || []),
    ...users.flatMap(u => u.skillsWant || [])
  ])].sort();

  return (
    <div className="min-h-screen bg-gray-950 text-white relative flex flex-col">
      <NeuralBackground />
      
      <div className="relative z-10 flex flex-col flex-1">
        <Header />

        {/* Main Content */}
        <main className="flex-1 max-w-7xl mx-auto px-6 py-8">
          <div className="mb-8">
            <h2 className="text-3xl font-bold mb-2">Welcome, {user?.firstName}!</h2>
            <p className="text-gray-400">Find your perfect skill-swap match</p>
          </div>

          {/* Search and Filter */}
          <div className="mb-6 flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                placeholder="Search users by name, username, or bio..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-gray-900 border border-gray-800 rounded-lg px-10 py-3 focus:outline-none focus:border-blue-500 transition-colors"
              />
            </div>
            <div className="md:w-64">
              <select
                value={filterSkill}
                onChange={(e) => setFilterSkill(e.target.value)}
                className="w-full bg-gray-900 border border-gray-800 rounded-lg px-4 py-3 focus:outline-none focus:border-blue-500 transition-colors"
              >
                <option value="">All Skills</option>
                {allSkills.map((skill, idx) => (
                  <option key={idx} value={skill}>{skill}</option>
                ))}
              </select>
            </div>
          </div>

          {error && (
            <div className="bg-red-500/20 border border-red-500 text-red-300 px-4 py-3 rounded-lg mb-6">
              {error}
            </div>
          )}

          {/* User Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredUsers.map((otherUser) => (
            <div
              key={otherUser._id}
              className="bg-gray-900 border border-gray-800 rounded-xl p-6 hover:border-blue-500 transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/20"
            >
              <div className="flex items-center gap-4 mb-4">
                <div className="w-16 h-16 rounded-full bg-linear-to-br from-blue-500 to-purple-600 flex items-center justify-center text-2xl font-bold">
                  {otherUser.firstName?.[0]}{otherUser.lastName?.[0]}
                </div>
                <div>
                  <h3 className="text-xl font-bold">{otherUser.firstName} {otherUser.lastName}</h3>
                  <p className="text-gray-400 text-sm">@{otherUser.username}</p>
                </div>
              </div>

              {otherUser.bio && (
                <p className="text-gray-300 text-sm mb-4 line-clamp-2">{otherUser.bio}</p>
              )}

              <div className="mb-4">
                <h4 className="text-sm font-semibold text-blue-400 mb-2">Skills They Have:</h4>
                <div className="flex flex-wrap gap-2">
                  {otherUser.skillsHave?.slice(0, 3).map((skill, idx) => (
                    <span key={idx} className="bg-blue-600/30 text-blue-300 px-2 py-1 rounded text-xs">
                      {skill}
                    </span>
                  ))}
                  {otherUser.skillsHave?.length > 3 && (
                    <span className="text-gray-500 text-xs">+{otherUser.skillsHave.length - 3} more</span>
                  )}
                </div>
              </div>

              <div className="mb-4">
                <h4 className="text-sm font-semibold text-purple-400 mb-2">Wants to Learn:</h4>
                <div className="flex flex-wrap gap-2">
                  {otherUser.skillsWant?.slice(0, 3).map((skill, idx) => (
                    <span key={idx} className="bg-purple-600/30 text-purple-300 px-2 py-1 rounded text-xs">
                      {skill}
                    </span>
                  ))}
                  {otherUser.skillsWant?.length > 3 && (
                    <span className="text-gray-500 text-xs">+{otherUser.skillsWant.length - 3} more</span>
                  )}
                </div>
              </div>

              <div className="flex gap-2 mt-4">
                <button
                  onClick={() => navigate(`/user/${otherUser._id}`)}
                  className="flex-1 bg-gray-800 text-white py-2 rounded-lg hover:bg-gray-700 transition-colors"
                >
                  View Profile
                </button>
                <button
                  onClick={() => handleSendRequest(otherUser._id)}
                  className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-500 transition-colors"
                >
                  Swap Request
                </button>
              </div>
            </div>
          ))}
        </div>

        {filteredUsers.length === 0 && !loading && (
          <div className="text-center py-12 text-gray-400">
            <p className="text-xl">
              {searchQuery || filterSkill 
                ? 'No users match your search criteria.' 
                : 'No users found yet. Be the first to explore!'}
            </p>
          </div>
        )}
      </main>

      <Footer />
      </div>
      
      {/* AI Chatbot - Vally */}
      <AIChatbot />
    </div>
  );
}
