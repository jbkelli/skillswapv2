import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import { userService, swapService } from '../services';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import NeuralBackground from '../components/NeuralBackground';
import Footer from '../components/Footer';
import AIChatbot from '../components/AIChatbot';

export default function HomePage() {
  const { user } = useAuth();
  const { showNotification } = useNotification();
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
      console.log('Fetching data from:', import.meta.env.VITE_API_URL || 'default URL');
      console.log('Environment mode:', import.meta.env.MODE);
      
      // Grab everything we need at once for better performance
      const [usersResponse, sentRequestsResponse, receivedRequestsResponse] = await Promise.all([
        userService.getAllUsers(),
        swapService.getSentRequests(),
        swapService.getReceivedRequests()
      ]);

      console.log('Users response:', usersResponse);
      console.log('Sent requests:', sentRequestsResponse);
      console.log('Received requests:', receivedRequestsResponse);

      const users = usersResponse.users;
      const sentReqs = sentRequestsResponse.requests;
      const receivedReqs = receivedRequestsResponse.requests;
      
      setSentRequests(sentReqs);
      setAllUsers(users);

      // Get all accepted connections from both directions
      const acceptedSentIds = sentReqs
        .filter(req => req.status === 'accepted')
        .map(req => req.receiver._id);
      
      const acceptedReceivedIds = receivedReqs
        .filter(req => req.status === 'accepted')
        .map(req => req.sender._id);

      // Combine and deduplicate the IDs
      const allSwappieIds = [...new Set([...acceptedSentIds, ...acceptedReceivedIds])];

      const swappiesList = users.filter(u => allSwappieIds.includes(u._id));
      
      // Get IDs of users with pending requests (both sent and received)
      const pendingSentIds = sentReqs
        .filter(req => req.status === 'pending')
        .map(req => req.receiver._id);
      
      const pendingReceivedIds = receivedReqs
        .filter(req => req.status === 'pending')
        .map(req => req.sender._id);
      
      const allPendingIds = [...new Set([...pendingSentIds, ...pendingReceivedIds])];
      
      // Discover tab shows everyone except accepted connections AND pending requests
      const discoverList = users.filter(u => 
        !allSwappieIds.includes(u._id) && !allPendingIds.includes(u._id)
      );

      setSwappies(sortUsersByMatch(swappiesList));
      setDiscoverUsers(sortUsersByMatch(discoverList));
      setLoading(false);
    } catch (err) {
      console.error('Error fetching data:', err);
      console.error('Error details:', err.response?.data || err.message);
      setError('Failed to load data: ' + (err.response?.data?.message || err.message));
      setLoading(false);
    }
  };

  // Search and filter the current user list
  const getFilteredUsers = () => {
    const currentList = activeTab === 'swappies' ? swappies : discoverUsers;
    let result = [...currentList];

    // Filter by search query if provided
    if (searchQuery) {
      result = result.filter(u => 
        u.firstName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        u.lastName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        u.username?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        u.bio?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Filter by specific skill if selected
    if (filterSkill) {
      result = result.filter(u => 
        u.skillsHave?.some(s => s.toLowerCase().includes(filterSkill.toLowerCase())) ||
        u.skillsWant?.some(s => s.toLowerCase().includes(filterSkill.toLowerCase()))
      );
    }

    return result;
  };

  const filteredUsers = getFilteredUsers();

  // Sort users by how well they match what you're looking for
  const sortUsersByMatch = (allUsers) => {
    return allUsers.sort((a, b) => {
      const scoreA = calculateMatchScore(a);
      const scoreB = calculateMatchScore(b);
      return scoreB - scoreA;
    });
  };

  const calculateMatchScore = (otherUser) => {
    let score = 0;
    
    // Do they have skills I want to learn?
    user.skillsWant?.forEach(skill => {
      if (otherUser.skillsHave?.some(s => s.toLowerCase().includes(skill.toLowerCase()))) {
        score += 10;
      }
    });

    // Do I have skills they want to learn?
    otherUser.skillsWant?.forEach(skill => {
      if (user.skillsHave?.some(s => s.toLowerCase().includes(skill.toLowerCase()))) {
        score += 10;
      }
    });

    return score;
  };

  const handleSendRequest = async (receiverId) => {
    try {
      console.log('Sending swap request to:', receiverId);
      const response = await swapService.sendRequest(receiverId, 'Hi! Let\'s swap skills!');
      console.log('Swap request response:', response);
      showNotification('Swap request sent successfully!', 'success');
      // Reload everything to show the updated state
      fetchData();
    } catch (err) {
      console.error('Error sending swap request:', err);
      console.error('Error response:', err.response?.data);
      const errorMessage = err.response?.data?.message || err.message || 'Failed to send request';
      showNotification('Failed to send request: ' + errorMessage, 'error');
    }
  };

  const handleStartChat = (userId) => {
    navigate(`/chat/${userId}`);
  };

  // See if we already sent them a request
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

  // Build a list of all available skills for the dropdown filter
  const allSkills = [...new Set([
    ...allUsers.flatMap(u => u.skillsHave || []),
    ...allUsers.flatMap(u => u.skillsWant || [])
  ])].sort();

  return (
    <div className="min-h-screen text-white relative flex flex-col" style={{ backgroundColor: '#030712' }}>
      <NeuralBackground />
      
      <div className="relative z-10 flex flex-col flex-1">
        <Header />

        {/* Main Content */}
        <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
          <div className="mb-6 sm:mb-8">
            <h1 className="text-2xl sm:text-3xl font-bold mb-2">Welcome, {user.firstName}!</h1>
            <p className="text-sm sm:text-base text-gray-400">Find your perfect skill-swap match</p>
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
          <div className="mb-6 flex flex-col gap-3 sm:gap-4">
            <div className="flex-1 relative">
              <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                placeholder="Search users..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-gray-900 border border-gray-800 rounded-lg px-9 sm:px-10 py-2.5 sm:py-3 text-sm sm:text-base focus:outline-none focus:border-blue-500 transition-colors"
              />
            </div>
            {activeTab === 'discover' && (
              <div className="w-full sm:w-64">
                <select
                  value={filterSkill}
                  onChange={(e) => setFilterSkill(e.target.value)}
                  className="w-full bg-gray-900 border border-gray-800 rounded-lg px-3 sm:px-4 py-2.5 sm:py-3 text-sm sm:text-base focus:outline-none focus:border-blue-500 transition-colors"
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
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6\">
            {filteredUsers.map((otherUser) => {
              const pendingRequest = getPendingRequest(otherUser._id);
              const isSwappie = activeTab === 'swappies';

              return (
                <div
                  key={otherUser._id}
                  className="bg-gray-900 border border-gray-800 rounded-xl p-4 sm:p-6 hover:border-blue-500 transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/20"
                >
                  <div className="flex items-center gap-3 sm:gap-4 mb-4">
                    {otherUser.profilePicture ? (
                      <img 
                        src={otherUser.profilePicture} 
                        alt={`${otherUser.firstName} ${otherUser.lastName}`}
                        className="w-12 h-12 sm:w-16 sm:h-16 rounded-full object-cover shrink-0"
                      />
                    ) : (
                      <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-linear-to-br from-blue-500 to-purple-600 flex items-center justify-center text-lg sm:text-2xl font-bold shrink-0">
                        {otherUser.firstName?.[0]}{otherUser.lastName?.[0]}
                      </div>
                    )}
                    <div className="min-w-0 flex-1">
                      <h3 className="text-base sm:text-xl font-bold truncate">{otherUser.firstName} {otherUser.lastName}</h3>
                      <p className="text-gray-400 text-xs sm:text-sm truncate">@{otherUser.username}</p>
                      {isSwappie && (
                        <span className="inline-block mt-1 bg-green-600/30 text-green-300 px-2 py-0.5 sm:py-1 rounded text-xs">
                          ✓ Connected
                        </span>
                      )}
                    </div>
                  </div>

                  {otherUser.bio && (
                    <p className="text-gray-300 text-xs sm:text-sm mb-3 sm:mb-4 line-clamp-2">{otherUser.bio}</p>
                  )}

                  <div className="mb-3 sm:mb-4">
                    <h4 className="text-xs sm:text-sm font-semibold text-blue-400 mb-2">Skills They Have:</h4>
                    <div className="flex flex-wrap gap-1.5 sm:gap-2">
                      {otherUser.skillsHave?.slice(0, 3).map((skill, idx) => (
                        <span key={idx} className="bg-blue-600/30 text-blue-300 px-2 py-0.5 sm:py-1 rounded text-xs">
                          {skill}
                        </span>
                      ))}
                      {otherUser.skillsHave?.length > 3 && (
                        <span className="text-gray-500 text-xs">+{otherUser.skillsHave.length - 3} more</span>
                      )}
                    </div>
                  </div>

                  <div className="mb-3 sm:mb-4">
                    <h4 className="text-xs sm:text-sm font-semibold text-purple-400 mb-2">Wants to Learn:</h4>
                    <div className="flex flex-wrap gap-1.5 sm:gap-2">
                      {otherUser.skillsWant?.slice(0, 3).map((skill, idx) => (
                        <span key={idx} className="bg-purple-600/30 text-purple-300 px-2 py-0.5 sm:py-1 rounded text-xs">
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

      {/* AI Chatbot */}
      <AIChatbot />
    </div>
  );
}
