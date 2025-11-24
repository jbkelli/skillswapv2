import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { userService, swapService } from '../services';
import { useAuth } from '../context/AuthContext';
import Header from '../components/Header';
import NeuralBackground from '../components/NeuralBackground';
import Footer from '../components/Footer';

export default function UserProfilePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [hasActiveSwap, setHasActiveSwap] = useState(false);

  useEffect(() => {
    fetchUser();
    checkSwapStatus();
  }, [id]);

  const fetchUser = async () => {
    try {
      const response = await userService.getUserById(id);
      setUser(response.user);
      setLoading(false);
    } catch (err) {
      setError('Failed to load user profile');
      setLoading(false);
    }
  };

  const checkSwapStatus = async () => {
    try {
      // Check both received and sent requests for accepted swaps
      const [receivedResponse, sentResponse] = await Promise.all([
        swapService.getReceivedRequests(),
        swapService.getSentRequests()
      ]);
      
      const receivedSwaps = receivedResponse.requests || [];
      const sentSwaps = sentResponse.requests || [];
      
      // Check if there's an accepted swap with this user
      const hasSwap = [...receivedSwaps, ...sentSwaps].some(swap => 
        swap.status === 'accepted' && 
        (swap.sender?._id === id || swap.receiver?._id === id)
      );
      
      setHasActiveSwap(hasSwap);
    } catch (err) {
      console.error('Failed to check swap status:', err);
    }
  };

  const handleSendRequest = async () => {
    try {
      await swapService.sendRequest(id, `Hi ${user.firstName}! I'd love to swap skills with you!`);
      alert('Swap request sent successfully!');
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to send request');
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

  if (error || !user) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <NeuralBackground />
        <div className="text-red-400 text-xl relative z-10">{error || 'User not found'}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white relative flex flex-col">
      <NeuralBackground />
      
      <div className="relative z-10 flex flex-col flex-1">
        <Header />

        {/* Profile Content */}
        <main className="flex-1 max-w-4xl mx-auto px-6 py-8">
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-8">
          {/* Profile Header */}
          <div className="flex items-start gap-6 mb-8">
            {user.profilePicture ? (
              <img 
                src={user.profilePicture} 
                alt={`${user.firstName} ${user.lastName}`}
                className="w-32 h-32 rounded-full object-cover"
              />
            ) : (
              <div className="w-32 h-32 rounded-full bg-linear-to-br from-blue-500 to-purple-600 flex items-center justify-center text-5xl font-bold">
                {user.firstName?.[0]}{user.lastName?.[0]}
              </div>
            )}
            <div className="flex-1">
              <h2 className="text-4xl font-bold mb-2">{user.firstName} {user.lastName}</h2>
              <p className="text-gray-400 text-lg mb-2">@{user.username}</p>
              <p className="text-gray-400 mb-4">{user.email}</p>
              {user.location && (
                <p className="text-gray-400 mb-2">📍 {user.location}</p>
              )}
              
              {user._id !== currentUser.id && !hasActiveSwap && (
                <button
                  onClick={handleSendRequest}
                  className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-500 transition-colors font-semibold"
                >
                  Send Swap Request
                </button>
              )}
              
              {hasActiveSwap && (
                <div className="flex items-center gap-2 text-green-400">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span className="font-semibold">Already Swapped</span>
                </div>
              )}
            </div>
          </div>

          {/* Bio */}
          {user.bio && (
            <div className="mb-8">
              <h3 className="text-2xl font-bold mb-3">About</h3>
              <p className="text-gray-300 leading-relaxed">{user.bio}</p>
            </div>
          )}

          {/* Skills I Have */}
          <div className="mb-8">
            <h3 className="text-2xl font-bold mb-4 text-blue-400">💡 Skills I Have</h3>
            <div className="flex flex-wrap gap-3">
              {user.skillsHave?.length > 0 ? (
                user.skillsHave.map((skill, idx) => (
                  <span key={idx} className="bg-blue-600/30 border border-blue-500 text-blue-300 px-4 py-2 rounded-lg text-sm font-medium">
                    {skill}
                  </span>
                ))
              ) : (
                <p className="text-gray-500">No skills listed</p>
              )}
            </div>
          </div>

          {/* Skills I Want */}
          <div className="mb-8">
            <h3 className="text-2xl font-bold mb-4 text-purple-400">🎯 Skills I Want to Learn</h3>
            <div className="flex flex-wrap gap-3">
              {user.skillsWant?.length > 0 ? (
                user.skillsWant.map((skill, idx) => (
                  <span key={idx} className="bg-purple-600/30 border border-purple-500 text-purple-300 px-4 py-2 rounded-lg text-sm font-medium">
                    {skill}
                  </span>
                ))
              ) : (
                <p className="text-gray-500">No skills listed</p>
              )}
            </div>
          </div>

          {/* Groups */}
          {user.groups && user.groups.length > 0 && (
            <div className="mb-8">
              <h3 className="text-2xl font-bold mb-4 text-green-400">👥 Groups</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {user.groups.map((group, idx) => (
                  <div key={idx} className="bg-gray-800 border border-gray-700 rounded-lg p-4 hover:border-green-500 transition-colors">
                    <div className="flex items-start gap-3">
                      <div className="w-12 h-12 rounded-lg bg-linear-to-br from-green-500 to-teal-600 flex items-center justify-center text-xl font-bold shrink-0">
                        {group.name?.[0] || '?'}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-lg font-semibold text-white truncate">{group.name || 'Unnamed Group'}</h4>
                        {group.description && (
                          <p className="text-gray-400 text-sm mt-1 line-clamp-2">{group.description}</p>
                        )}
                        {group.members && (
                          <p className="text-gray-500 text-xs mt-2">
                            {group.members.length} {group.members.length === 1 ? 'member' : 'members'}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Contact Info */}
          {user.contacts && Object.values(user.contacts).some(val => val) && (
            <div>
              <h3 className="text-2xl font-bold mb-4">📞 Contact</h3>
              <div className="grid grid-cols-2 gap-4">
                {user.contacts.phone && (
                  <div className="bg-gray-800 p-3 rounded-lg">
                    <p className="text-gray-400 text-sm">Phone</p>
                    <p className="text-white">{user.contacts.phone}</p>
                  </div>
                )}
                {user.contacts.linkedin && (
                  <div className="bg-gray-800 p-3 rounded-lg">
                    <p className="text-gray-400 text-sm">LinkedIn</p>
                    <a href={user.contacts.linkedin} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">
                      View Profile
                    </a>
                  </div>
                )}
                {user.contacts.github && (
                  <div className="bg-gray-800 p-3 rounded-lg">
                    <p className="text-gray-400 text-sm">GitHub</p>
                    <a href={user.contacts.github} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">
                      View Profile
                    </a>
                  </div>
                )}
                {user.contacts.twitter && (
                  <div className="bg-gray-800 p-3 rounded-lg">
                    <p className="text-gray-400 text-sm">Twitter</p>
                    <a href={user.contacts.twitter} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">
                      View Profile
                    </a>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        <button
          onClick={() => navigate('/dashboard')}
          className="mt-6 text-gray-400 hover:text-white transition-colors"
        >
          ← Back to Dashboard
        </button>
      </main>
      
      <Footer />
    </div>
  </div>
  );
}
