import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { swapService } from '../services';
import Header from '../components/Header';
import NeuralBackground from '../components/NeuralBackground';
import Footer from '../components/Footer';

export default function RequestsPage() {
  const navigate = useNavigate();
  const [receivedRequests, setReceivedRequests] = useState([]);
  const [sentRequests, setSentRequests] = useState([]);
  const [activeTab, setActiveTab] = useState('received');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      const [received, sent] = await Promise.all([
        swapService.getReceivedRequests(),
        swapService.getSentRequests()
      ]);
      
      setReceivedRequests(received.requests);
      setSentRequests(sent.requests);
      setLoading(false);
    } catch (err) {
      setError('Failed to load requests');
      setLoading(false);
    }
  };

  const handleAccept = async (requestId) => {
    try {
      await swapService.updateRequestStatus(requestId, 'accepted');
      alert('Request accepted! You can now chat with this user.');
      fetchRequests();
    } catch (err) {
      alert('Failed to accept request');
    }
  };

  const handleReject = async (requestId) => {
    try {
      await swapService.updateRequestStatus(requestId, 'rejected');
      alert('Request rejected');
      fetchRequests();
    } catch (err) {
      alert('Failed to reject request');
    }
  };

  const handleCancel = async (requestId) => {
    try {
      await swapService.cancelRequest(requestId);
      alert('Request cancelled successfully');
      fetchRequests();
    } catch (err) {
      alert('Failed to cancel request');
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

  return (
    <div className="min-h-screen bg-gray-950 text-white relative flex flex-col">
      <NeuralBackground />
      
      <div className="relative z-10 flex flex-col flex-1">
        <Header />

        {/* Main Content */}
        <main className="flex-1 max-w-6xl mx-auto px-6 py-8">
        <h2 className="text-3xl font-bold mb-6">Swap Requests</h2>

        {error && (
          <div className="bg-red-500/20 border border-red-500 text-red-300 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-4 mb-6">
          <button
            onClick={() => setActiveTab('received')}
            className={`px-6 py-3 rounded-lg font-semibold transition-colors ${
              activeTab === 'received'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
            }`}
          >
            Received ({receivedRequests.filter(r => r.status === 'pending').length})
          </button>
          <button
            onClick={() => setActiveTab('sent')}
            className={`px-6 py-3 rounded-lg font-semibold transition-colors ${
              activeTab === 'sent'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
            }`}
          >
            Sent ({sentRequests.length})
          </button>
        </div>

        {/* Received Requests */}
        {activeTab === 'received' && (
          <div className="space-y-4">
            {receivedRequests.length === 0 ? (
              <div className="text-center py-12 text-gray-400">
                <p className="text-xl">No requests received yet</p>
              </div>
            ) : (
              receivedRequests.map((request) => (
                <div
                  key={request._id}
                  className="bg-gray-900 border border-gray-800 rounded-xl p-6 hover:border-blue-500 transition-all"
                >
                  <div className="flex items-start gap-4">
                    <div className="w-16 h-16 rounded-full bg-linear-to-br from-blue-500 to-purple-600 flex items-center justify-center text-2xl font-bold">
                      {request.sender.firstName?.[0]}{request.sender.lastName?.[0]}
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h3 className="text-xl font-bold">
                            {request.sender.firstName} {request.sender.lastName}
                          </h3>
                          <p className="text-gray-400 text-sm">@{request.sender.username}</p>
                        </div>
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            request.status === 'pending'
                              ? 'bg-yellow-600/30 text-yellow-300'
                              : request.status === 'accepted'
                              ? 'bg-green-600/30 text-green-300'
                              : 'bg-red-600/30 text-red-300'
                          }`}
                        >
                          {request.status.toUpperCase()}
                        </span>
                      </div>

                      {request.message && (
                        <p className="text-gray-300 mb-3">"{request.message}"</p>
                      )}

                      <div className="mb-3">
                        <p className="text-sm text-gray-400 mb-2">Skills they have:</p>
                        <div className="flex flex-wrap gap-2">
                          {request.sender.skillsHave?.slice(0, 5).map((skill, idx) => (
                            <span key={idx} className="bg-blue-600/30 text-blue-300 px-2 py-1 rounded text-xs">
                              {skill}
                            </span>
                          ))}
                        </div>
                      </div>

                      <div className="mb-4">
                        <p className="text-sm text-gray-400 mb-2">Wants to learn:</p>
                        <div className="flex flex-wrap gap-2">
                          {request.sender.skillsWant?.slice(0, 5).map((skill, idx) => (
                            <span key={idx} className="bg-purple-600/30 text-purple-300 px-2 py-1 rounded text-xs">
                              {skill}
                            </span>
                          ))}
                        </div>
                      </div>

                      {request.status === 'pending' && (
                        <div className="flex gap-3">
                          <button
                            onClick={() => handleAccept(request._id)}
                            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-500 transition-colors font-semibold"
                          >
                            Accept
                          </button>
                          <button
                            onClick={() => handleReject(request._id)}
                            className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-500 transition-colors font-semibold"
                          >
                            Reject
                          </button>
                          <button
                            onClick={() => navigate(`/user/${request.sender._id}`)}
                            className="bg-gray-700 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors font-semibold"
                          >
                            View Profile
                          </button>
                        </div>
                      )}

                      {request.status === 'accepted' && (
                        <div className="flex gap-3">
                          <button
                            onClick={() => navigate(`/chat/${request.sender._id}`)}
                            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-500 transition-colors font-semibold"
                          >
                            Start Chat
                          </button>
                          <button
                            onClick={() => navigate(`/user/${request.sender._id}`)}
                            className="bg-gray-700 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors font-semibold"
                          >
                            View Profile
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Sent Requests */}
        {activeTab === 'sent' && (
          <div className="space-y-4">
            {sentRequests.length === 0 ? (
              <div className="text-center py-12 text-gray-400">
                <p className="text-xl">No requests sent yet</p>
                <p className="mt-2">Go to the dashboard to send swap requests!</p>
                <button
                  onClick={() => navigate('/dashboard')}
                  className="mt-4 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-500 transition-colors"
                >
                  Go to Dashboard
                </button>
              </div>
            ) : (
              sentRequests.map((request) => (
                <div
                  key={request._id}
                  className="bg-gray-900 border border-gray-800 rounded-xl p-6 hover:border-blue-500 transition-all"
                >
                  <div className="flex items-start gap-4">
                    <div className="w-16 h-16 rounded-full bg-linear-to-br from-blue-500 to-purple-600 flex items-center justify-center text-2xl font-bold">
                      {request.receiver.firstName?.[0]}{request.receiver.lastName?.[0]}
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h3 className="text-xl font-bold">
                            {request.receiver.firstName} {request.receiver.lastName}
                          </h3>
                          <p className="text-gray-400 text-sm">@{request.receiver.username}</p>
                        </div>
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            request.status === 'pending'
                              ? 'bg-yellow-600/30 text-yellow-300'
                              : request.status === 'accepted'
                              ? 'bg-green-600/30 text-green-300'
                              : 'bg-red-600/30 text-red-300'
                          }`}
                        >
                          {request.status.toUpperCase()}
                        </span>
                      </div>

                      {request.message && (
                        <p className="text-gray-300 mb-3">Your message: "{request.message}"</p>
                      )}

                      <p className="text-sm text-gray-400">
                        Sent on {new Date(request.createdAt).toLocaleDateString()}
                      </p>

                      <div className="flex gap-2 mt-3">
                        {request.status === 'accepted' && (
                          <button
                            onClick={() => navigate(`/chat/${request.receiver._id}`)}
                            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-500 transition-colors font-semibold"
                          >
                            Start Chat
                          </button>
                        )}
                        {request.status === 'pending' && (
                          <button
                            onClick={() => handleCancel(request._id)}
                            className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-500 transition-colors font-semibold"
                          >
                            Cancel Request
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </main>
      
      <Footer />
    </div>
  </div>
  );
}
