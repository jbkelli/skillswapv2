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
  const [allUsers, setAllUsers] = useState([]);
  const [swappies, setSwappies] = useState([]);
  const [discoverUsers, setDiscoverUsers] = useState([]);
  const [sentRequests, setSentRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterSkill, setFilterSkill] = useState('');
  const [activeTab, setActiveTab] = useState('swappies'); // 'swappies' or 'discover'
  const navigate = useNavigate();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      // Fetch all users, sent requests, and received requests in parallel
      const [usersResponse, sentRequestsResponse, receivedRequestsResponse] = await Promise.all([
        userService.getAllUsers(),
        swapService.getSentRequests(),
        swapService.getReceivedRequests()
      ]);

      const users = usersResponse.users;
      const sentReqs = sentRequestsResponse.requests;
      const receivedReqs = receivedRequestsResponse.requests;
      
      setSentRequests(sentReqs);
      setAllUsers(users);

      // Combine all accepted connections (both sent and received)
      const acceptedSentIds = sentReqs
        .filter(req => req.status === 'accepted')
        .map(req => req.receiver._id);
      
      const acceptedReceivedIds = receivedReqs
        .filter(req => req.status === 'accepted')
        .map(req => req.sender._id);

      // Merge both arrays and remove duplicates
      const allSwappieIds = [...new Set([...acceptedSentIds, ...acceptedReceivedIds])];

      const swappiesList = users.filter(u => allSwappieIds.includes(u._id));
      
      // For discover: exclude users with accepted requests (both ways)
      const discoverList = users.filter(u => !allSwappieIds.includes(u._id));

      setSwappies(sortUsersByMatch(swappiesList));
      setDiscoverUsers(sortUsersByMatch(discoverList));
      setLoading(false);
    } catch (err) {
      setError('Failed to load data');
      setLoading(false);
    }
  };

  // Filter and search users
  const getFilteredUsers = () => {
    const currentList = activeTab === 'swappies' ? swappies : discoverUsers;
    let result = [...currentList];

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

    return result;
  };

  const filteredUsers = getFilteredUsers();

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
      // Refresh data to update UI
      fetchData();
    } catch (err) {
      alert('Failed to send request');
    }
  };

  const handleStartChat = (userId) => {
    navigate(`/chat/${userId}`);
  };

  // Check if a user has a pending request
  const getPendingRequest = (userId) => {
    return sentRequests.find(req => req.receiver._id === userId && req.status === 'pending');
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
    ...allUsers.flatMap(u => u.skillsHave || []),
    ...allUsers.flatMap(u => u.skillsWant || [])
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

          {/* Tabs */}
          <div className="mb-6 flex gap-4 border-b border-gray-800">
            <button
              onClick={() => setActiveTab('swappies')}
              className={`pb-4 px-4 font-semibold transition-colors relative ${
                activeTab === 'swappies'
                  ? 'text-blue-400'
                  : 'text-gray-400 hover:text-gray-300'
              }`}
            >
              Your Swappies
              {swappies.length > 0 && (
                <span className="ml-2 bg-blue-600 text-white text-xs px-2 py-1 rounded-full">
                  {swappies.length}
                </span>
              )}
              {activeTab === 'swappies' && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-400"></div>
              )}
            </button>
            <button
              onClick={() => setActiveTab('discover')}
              className={`pb-4 px-4 font-semibold transition-colors relative ${
                activeTab === 'discover'
                  ? 'text-blue-400'
                  : 'text-gray-400 hover:text-gray-300'
              }`}
            >
              Discover Swappies
              {activeTab === 'discover' && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-400"></div>
              )}
            </button>
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
            {activeTab === 'discover' && (
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
            )}
          </div>

          {error && (
            <div className="bg-red-500/20 border border-red-500 text-red-300 px-4 py-3 rounded-lg mb-6">
              {error}
            </div>
          )}

          {/* User Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredUsers.map((otherUser) => {
              const pendingRequest = getPendingRequest(otherUser._id);
              const isSwappie = activeTab === 'swappies';

              return (
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
                      {isSwappie && (
                        <span className="inline-block mt-1 bg-green-600/30 text-green-300 px-2 py-1 rounded text-xs">
                          ✓ Connected
                        </span>
                      )}
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
                    
                    {isSwappie ? (
                      <button
                        onClick={() => handleStartChat(otherUser._id)}
                        className="flex-1 bg-green-600 text-white py-2 rounded-lg hover:bg-green-500 transition-colors"
                      >
                        💬 Chat
                      </button>
                    ) : pendingRequest ? (
                      <button
                        disabled
                        className="flex-1 bg-yellow-600/50 text-yellow-200 py-2 rounded-lg cursor-not-allowed"
                      >
                        ⏳ Pending
                      </button>
                    ) : (
                      <button
                        onClick={() => handleSendRequest(otherUser._id)}
                        className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-500 transition-colors"
                      >
                        Swap Request
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

        {filteredUsers.length === 0 && !loading && (
          <div className="text-center py-12 text-gray-400">
            <p className="text-xl">
              {activeTab === 'swappies' 
                ? 'No swappies yet. Start connecting by sending swap requests in the Discover tab!' 
                : searchQuery || filterSkill 
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
