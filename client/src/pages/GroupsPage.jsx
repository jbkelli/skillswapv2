import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { io } from 'socket.io-client';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import api from '../services/api';
import Header from '../components/Header';
import NeuralBackground from '../components/NeuralBackground';
import Footer from '../components/Footer';
import GroupQuiz from '../components/GroupQuiz';
import { SOCKET_URL, API_BASE_URL, SERVER_URL } from '../config/api';

export default function GroupsPage() {
  const { groupId: urlGroupId } = useParams();
  const { user } = useAuth();
  const { showNotification } = useNotification();
  const navigate = useNavigate();
  
  const [groups, setGroups] = useState([]);
  const [availableGroups, setAvailableGroups] = useState([]);
  const [lockedGroups, setLockedGroups] = useState([]);
  const [selectedGroupId, setSelectedGroupId] = useState(urlGroupId || null);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [vallyTyping, setVallyTyping] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [filePreview, setFilePreview] = useState(null);
  const [showMembers, setShowMembers] = useState(false);
  const [members, setMembers] = useState([]);
  const [showOtherGroups, setShowOtherGroups] = useState(false);
  const [quizGroup, setQuizGroup] = useState(null);
  
  const messagesEndRef = useRef(null);
  const messagesContainerRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const fileInputRef = useRef(null);
  const socketRef = useRef(null);

  // Initialize socket
  useEffect(() => {
    if (!socketRef.current) {
      socketRef.current = io(SOCKET_URL);
    }
    
    const socket = socketRef.current;
    socket.emit('join', user.id);

    // Listen for group messages
    socket.on('receive_group_message', (data) => {
      // Only add message if it's from someone else (not the current user)
      // The sender already added their message via the API response
      if (data.groupId === selectedGroupId && data.senderId !== user.id) {
        if (data.messageData && !data.messageData.refresh) {
          setMessages(prev => [...prev, data.messageData]);
        } else {
          // Just refresh to get the latest messages
          fetchGroupDetails();
        }
      }
      // Refresh groups list to update last message
      fetchGroups();
    });

    socket.on('group_user_typing', (data) => {
      if (data.groupId === selectedGroupId && data.senderId !== user.id) {
        // Could show typing indicator
      }
    });

    return () => {
      socket.off('receive_group_message');
      socket.off('group_user_typing');
    };
  }, [selectedGroupId, user.id]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
    };
  }, []);

  // Fetch user's groups
  useEffect(() => {
    fetchGroups();
  }, []);

  // Fetch group details when selected
  useEffect(() => {
    if (selectedGroupId) {
      fetchGroupDetails();
      fetchGroupMembers();
    }
  }, [selectedGroupId]);

  // Auto-scroll
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const fetchGroups = async () => {
    try {
      const response = await api.get('/groups/all-groups');
      setGroups(response.data.userGroups);
      setAvailableGroups(response.data.availableGroups);
      setLockedGroups(response.data.lockedGroups);
      setLoading(false);
    } catch (err) {
      console.error('Failed to fetch groups:', err);
      setLoading(false);
    }
  };

  const fetchGroupDetails = async () => {
    try {
      const response = await api.get(`/groups/${selectedGroupId}`);
      setSelectedGroup(response.data.group);
      setMessages(response.data.group.messages || []);
    } catch (err) {
      console.error('Failed to fetch group details:', err);
      showNotification('Failed to load group details', 'error');
      // Fallback: try to find group in local groups array
      const localGroup = groups.find(g => g._id === selectedGroupId);
      if (localGroup) {
        setSelectedGroup(localGroup);
        setMessages([]);
      }
    }
  };

  const fetchGroupMembers = async () => {
    try {
      const response = await api.get(`/groups/${selectedGroupId}/members`);
      setMembers(response.data.members);
    } catch (err) {
      console.error('Failed to fetch members:', err);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleTyping = () => {
    const socket = socketRef.current;
    if (!socket || !selectedGroupId) return;
    
    socket.emit('group_typing', { senderId: user.id, groupId: selectedGroupId });

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    typingTimeoutRef.current = setTimeout(() => {
      socket.emit('group_stop_typing', { senderId: user.id, groupId: selectedGroupId });
    }, 1000);
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onloadend = () => setFilePreview(reader.result);
        reader.readAsDataURL(file);
      } else {
        setFilePreview(null);
      }
    }
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
    setFilePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSendFile = async () => {
    if (!selectedFile || !selectedGroupId) return;
    const socket = socketRef.current;
    if (!socket) return;

    try {
      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('message', newMessage || '');

      const response = await api.post(`/groups/${selectedGroupId}/send-file`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      socket.emit('send_group_message', {
        senderId: user.id,
        groupId: selectedGroupId,
        message: response.data.data.message || 'Sent a file',
        messageData: response.data.data
      });

      setMessages(prev => [...prev, response.data.data]);
      setNewMessage('');
      handleRemoveFile();
      fetchGroups();
    } catch (err) {
      console.error('Failed to send file:', err);
      showNotification('Failed to send file', 'error');
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    const socket = socketRef.current;
    if (!socket || !selectedGroupId) return;
    
    if (selectedFile) {
      await handleSendFile();
      return;
    }
    
    if (!newMessage.trim()) return;

    // Vally AI integration - visible to all
    if (newMessage.trim().toLowerCase().startsWith('@vally')) {
      const question = newMessage.replace(/@vally/i, '').trim();
      
      if (!question) {
        showNotification('Please ask Vally a question after @vally', 'warning');
        return;
      }

      setVallyTyping(true);

      try {
        // Get Vally's response
        const response = await fetch(`${API_BASE_URL}/ai/chat`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          },
          body: JSON.stringify({ prompt: question })
        });

        const data = await response.json();
        
        // Send both user question and Vally response to group
        await api.post(`/groups/${selectedGroupId}/message`, {
          message: newMessage,
          isVally: true,
          vallyResponse: data.response || 'Sorry, I couldn\'t process that. Try again!'
        });

        setNewMessage('');
        fetchGroupDetails();
        fetchGroups();
        
        // Broadcast to all group members
        socket.emit('send_group_message', {
          senderId: user.id,
          groupId: selectedGroupId,
          message: newMessage,
          messageData: { refresh: true }
        });
      } catch (err) {
        console.error('Vally error:', err);
        showNotification('Failed to get Vally response', 'error');
      } finally {
        setVallyTyping(false);
      }
      return;
    }

    // Regular message
    try {
      const response = await api.post(`/groups/${selectedGroupId}/message`, {
        message: newMessage
      });

      const sentMessages = response.data.messages;
      setMessages(prev => [...prev, ...sentMessages]);
      
      socket.emit('send_group_message', {
        senderId: user.id,
        groupId: selectedGroupId,
        message: newMessage,
        messageData: sentMessages[sentMessages.length - 1]
      });

      setNewMessage('');
      fetchGroups();
    } catch (err) {
      console.error('Failed to send message:', err);
      showNotification('Failed to send message', 'error');
    }
  };

  const getColorClass = (color) => {
    const colorMap = {
      blue: 'from-blue-500 to-blue-700',
      purple: 'from-purple-500 to-purple-700',
      green: 'from-green-500 to-green-700',
      cyan: 'from-cyan-500 to-cyan-700',
      red: 'from-red-500 to-red-700',
      pink: 'from-pink-500 to-pink-700',
      yellow: 'from-yellow-500 to-yellow-700',
    };
    return colorMap[color] || 'from-gray-500 to-gray-700';
  };

  const getProfilePicture = (member) => {
    return member?.profilePicture || member?.profilePic || member?.profileImage;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <NeuralBackground />
        <div className="text-white text-xl relative z-10">Loading groups...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white flex flex-col relative">
      <NeuralBackground />
      
      <div className="relative z-10 flex flex-col h-screen">
        <Header />
        
        <div className="flex-1 flex overflow-hidden">
          {/* Groups Sidebar */}
          <div className={`w-full md:w-80 lg:w-96 bg-gray-900 border-r border-gray-800 flex flex-col ${
            selectedGroupId ? 'hidden md:flex' : 'flex'
          }`}>
            <div className="p-4 border-b border-gray-800">
              <h2 className="text-xl font-bold mb-2">My Groups</h2>
              <p className="text-sm text-gray-400">Collaborate & learn together</p>
            </div>

            <div className="flex-1 overflow-y-auto">
              {groups.length === 0 ? (
                <div className="p-6 text-center text-gray-400">
                  <p>No groups yet</p>
                  <p className="text-sm mt-2">Groups will be assigned automatically based on your skills</p>
                  <p className="text-xs mt-4 text-gray-500">Complete your profile and you'll be added to relevant groups</p>
                </div>
              ) : (
                groups.map((group) => (
                  <div
                    key={group._id}
                    onClick={() => setSelectedGroupId(group._id)}
                    className={`p-4 border-b border-gray-800 cursor-pointer hover:bg-gray-800 transition-colors ${
                      selectedGroupId === group._id ? 'bg-gray-800' : ''
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-12 h-12 rounded-full bg-linear-to-br ${getColorClass(group.color)} flex items-center justify-center text-2xl`}>
                        {group.icon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold truncate">{group.name}</h3>
                        <p className="text-xs text-gray-400 truncate">{group.description}</p>
                        <p className="text-xs text-gray-500 mt-1">{group.members?.length || 0} members</p>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Other Groups Dropdown */}
            {(availableGroups.length > 0 || lockedGroups.length > 0) && (
              <div className="border-t border-gray-800">
                <button
                  onClick={() => setShowOtherGroups(!showOtherGroups)}
                  className="w-full p-4 flex items-center justify-between hover:bg-gray-800 transition-colors"
                >
                  <span className="font-semibold">Other Groups</span>
                  <svg 
                    className={`w-5 h-5 transition-transform ${showOtherGroups ? 'rotate-180' : ''}`} 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {showOtherGroups && (
                  <div className="max-h-64 overflow-y-auto">
                    {availableGroups.map((group) => (
                      <div
                        key={group._id}
                        onClick={() => setQuizGroup(group)}
                        className="p-4 border-b border-gray-800 cursor-pointer hover:bg-gray-800 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <div className={`w-12 h-12 rounded-full bg-linear-to-br ${getColorClass(group.color)} flex items-center justify-center text-2xl relative`}>
                            {group.icon}
                            <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center">
                              <svg className="w-6 h-6 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                              </svg>
                            </div>
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold truncate flex items-center gap-2">
                              {group.name}
                              <span className="text-xs bg-yellow-600/30 text-yellow-300 px-2 py-0.5 rounded">Locked</span>
                            </h3>
                            <p className="text-xs text-gray-400 truncate">{group.description}</p>
                            <p className="text-xs text-blue-400 mt-1">Click to take quiz and unlock</p>
                          </div>
                        </div>
                      </div>
                    ))}

                    {lockedGroups.map((group) => {
                      const daysLeft = Math.ceil((new Date(group.lockedUntil) - new Date()) / (1000 * 60 * 60 * 24));
                      return (
                        <div
                          key={group._id}
                          className="p-4 border-b border-gray-800 opacity-50 cursor-not-allowed"
                        >
                          <div className="flex items-center gap-3">
                            <div className={`w-12 h-12 rounded-full bg-linear-to-br ${getColorClass(group.color)} flex items-center justify-center text-2xl relative`}>
                              {group.icon}
                              <div className="absolute inset-0 bg-black/70 rounded-full flex items-center justify-center">
                                <svg className="w-6 h-6 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                                </svg>
                              </div>
                            </div>
                            <div className="flex-1 min-w-0">
                              <h3 className="font-semibold truncate flex items-center gap-2">
                                {group.name}
                                <span className="text-xs bg-red-600/30 text-red-300 px-2 py-0.5 rounded">Locked</span>
                              </h3>
                              <p className="text-xs text-gray-400 truncate">{group.description}</p>
                              <p className="text-xs text-red-400 mt-1">Unlock in {daysLeft} day{daysLeft !== 1 ? 's' : ''}</p>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Group Chat Area */}
          {selectedGroupId && selectedGroup ? (
            <div className={`flex-1 flex flex-col ${selectedGroupId ? 'flex' : 'hidden md:flex'}`}>
              {/* Group Header */}
              <div className="bg-gray-800 border-b border-gray-700 py-3 px-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setSelectedGroupId(null)}
                      className="md:hidden text-gray-400 hover:text-white transition-colors"
                    >
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                      </svg>
                    </button>
                    <div className={`w-10 h-10 rounded-full bg-linear-to-br ${getColorClass(selectedGroup.color)} flex items-center justify-center text-2xl`}>
                      {selectedGroup.icon}
                    </div>
                    <div>
                      <h2 className="font-bold">{selectedGroup.name}</h2>
                      <p className="text-sm text-gray-400">{selectedGroup.members?.length || 0} members</p>
                    </div>
                  </div>
                  
                  {/* Members Button */}
                  <button
                    onClick={() => setShowMembers(!showMembers)}
                    className="p-2 rounded-lg hover:bg-gray-700 transition-colors"
                    title="View members"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                  </button>
                </div>
              </div>

              {/* Messages Area */}
              <div ref={messagesContainerRef} className="flex-1 overflow-y-auto px-6 py-4">
                <div className="space-y-4">
                  {messages.map((msg, idx) => {
                    const isMyMessage = msg.sender?._id === user.id;
                    const isSystemMessage = msg.messageType === 'system';
                    const isVallyMessage = msg.isVally;
                    
                    if (isSystemMessage) {
                      return (
                        <div key={idx} className="flex justify-center my-2">
                          <div className="bg-gray-800 text-gray-400 text-xs px-3 py-1 rounded-full">
                            {msg.message}
                          </div>
                        </div>
                      );
                    }
                    
                    // Validate date before using it
                    const msgDate = msg.createdAt ? new Date(msg.createdAt) : null;
                    const isValidDate = msgDate && !isNaN(msgDate.getTime());
                    const currentDate = isValidDate ? msgDate.toDateString() : null;
                    const previousDate = idx > 0 && messages[idx - 1].createdAt ? new Date(messages[idx - 1].createdAt).toDateString() : null;
                    const showDateSeparator = isValidDate && currentDate !== previousDate;
                    
                    return (
                      <React.Fragment key={idx}>
                        {showDateSeparator && (
                          <div className="flex justify-center my-4">
                            <div className="bg-gray-800 text-gray-400 text-xs px-3 py-1 rounded-full">
                              {msgDate.toLocaleDateString()}
                            </div>
                          </div>
                        )}
                        
                        <div className={`flex ${isVallyMessage ? 'justify-center' : isMyMessage ? 'justify-end' : 'justify-start'}`}>
                          <div className="max-w-[70%]">
                            {!isMyMessage && msg.sender && !isVallyMessage && (
                              <p className="text-xs mb-1 text-gray-400">
                                {msg.sender.firstName} {msg.sender.lastName}
                              </p>
                            )}
                            {isVallyMessage && (
                              <p className="text-xs mb-1 text-purple-400 font-semibold text-center">
                                🤖 Vally AI (asked by {msg.vallyTriggeredBy?.firstName || 'someone'})
                              </p>
                            )}
                            <div
                              className={`rounded-2xl px-4 py-3 ${
                                isVallyMessage
                                  ? 'bg-linear-to-br from-purple-600 to-pink-600 text-white'
                                  : isMyMessage
                                  ? 'bg-blue-600 text-white rounded-br-none'
                                  : 'bg-gray-800 text-gray-100 rounded-bl-none'
                              }`}
                            >
                              {msg.messageType === 'image' && msg.fileUrl && (
                                <div className="mb-2">
                                  <img 
                                    src={`${SERVER_URL}${msg.fileUrl}`}
                                    alt={msg.fileName || 'Image'}
                                    className="max-w-full rounded-lg cursor-pointer hover:opacity-90"
                                    onClick={() => window.open(`${SERVER_URL}${msg.fileUrl}`, '_blank')}
                                  />
                                </div>
                              )}
                              
                              {msg.messageType === 'file' && msg.fileUrl && (
                                <div className="mb-2 p-3 bg-white/10 rounded-lg">
                                  <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-gray-700 rounded flex items-center justify-center">
                                      <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M8 4a3 3 0 00-3 3v4a5 5 0 0010 0V7a1 1 0 112 0v4a7 7 0 11-14 0V7a5 5 0 0110 0v4a3 3 0 11-6 0V7a1 1 0 012 0v4a1 1 0 102 0V7a3 3 0 00-3-3z" clipRule="evenodd" />
                                      </svg>
                                    </div>
                                    <div>
                                      <p className="text-sm font-medium">{msg.fileName}</p>
                                      {msg.fileSize && <p className="text-xs opacity-70">{(msg.fileSize / 1024).toFixed(1)} KB</p>}
                                    </div>
                                  </div>
                                  <div className="flex gap-2 mt-3">
                                    <button
                                      onClick={() => window.open(`${SERVER_URL}${msg.fileUrl}`, '_blank')}
                                      className="flex-1 bg-gray-700 hover:bg-gray-600 text-white px-3 py-2 rounded text-sm font-medium transition-colors flex items-center justify-center gap-2"
                                    >
                                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                      </svg>
                                      View
                                    </button>
                                    <a
                                      href={`${SERVER_URL}${msg.fileUrl}`}
                                      download={msg.fileName}
                                      className="flex-1 bg-gray-700 hover:bg-gray-600 text-white px-3 py-2 rounded text-sm font-medium transition-colors flex items-center justify-center gap-2"
                                    >
                                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                      </svg>
                                      Download
                                    </a>
                                  </div>
                                </div>
                              )}
                              
                              {msg.message && <p className="wrap-break-word">{msg.message}</p>}
                            </div>
                            {isValidDate && (
                              <p className="text-xs text-gray-500 mt-1">
                                {msgDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </p>
                            )}
                          </div>
                        </div>
                      </React.Fragment>
                    );
                  })}
                  {vallyTyping && (
                    <div className="flex justify-center">
                      <div className="rounded-2xl px-4 py-3 bg-linear-to-br from-purple-600 to-pink-600">
                        <p className="text-xs text-purple-200 mb-1">🤖 Vally AI is thinking...</p>
                        <div className="flex gap-1">
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                        </div>
                      </div>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>
              </div>

              {/* Message Input */}
              <div className="border-t border-gray-800 p-4 bg-gray-900">
                <p className="text-xs text-gray-400 mb-2">💡 Tip: Type <span className="text-purple-400 font-semibold">@vally</span> to ask Vally AI - everyone will see!</p>
                
                {selectedFile && (
                  <div className="mb-3 p-3 bg-gray-800 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        {filePreview ? (
                          <img src={filePreview} alt="Preview" className="w-12 h-12 object-cover rounded" />
                        ) : (
                          <div className="w-12 h-12 bg-gray-700 rounded flex items-center justify-center">
                            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M8 4a3 3 0 00-3 3v4a5 5 0 0010 0V7a1 1 0 112 0v4a7 7 0 11-14 0V7a5 5 0 0110 0v4a3 3 0 11-6 0V7a1 1 0 012 0v4a1 1 0 102 0V7a3 3 0 00-3-3z" clipRule="evenodd" />
                            </svg>
                          </div>
                        )}
                        <div>
                          <p className="text-sm font-medium">{selectedFile.name}</p>
                          <p className="text-xs text-gray-400">{(selectedFile.size / 1024).toFixed(1)} KB</p>
                        </div>
                      </div>
                      <button onClick={handleRemoveFile} className="text-red-400 hover:text-red-300">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  </div>
                )}
                
                <form onSubmit={handleSendMessage} className="flex gap-3">
                  <input type="file" ref={fileInputRef} onChange={handleFileSelect} accept="image/*,.pdf,.doc,.docx,.txt,.zip" className="hidden" />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="bg-gray-800 text-gray-300 p-3 rounded-lg hover:bg-gray-700 transition-colors"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                    </svg>
                  </button>
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => {
                      setNewMessage(e.target.value);
                      handleTyping();
                    }}
                    placeholder="Type a message or @vally for AI help..."
                    className="flex-1 bg-gray-800 border border-gray-700 text-gray-300 rounded-lg py-3 px-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <button
                    type="submit"
                    disabled={!newMessage.trim() && !selectedFile}
                    className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-500 transition-colors font-semibold disabled:opacity-50"
                  >
                    Send
                  </button>
                </form>
              </div>
            </div>
          ) : (
            <div className="flex-1 flex items-center justify-center bg-gray-900/50">
              <div className="text-center">
                <svg className="w-24 h-24 text-gray-600 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                <h3 className="text-xl font-semibold text-gray-400 mb-2">Select a group</h3>
                <p className="text-gray-500">Choose a group from the sidebar to start collaborating</p>
              </div>
            </div>
          )}
        </div>

        {/* Members Modal */}
        {showMembers && selectedGroup && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setShowMembers(false)}>
            <div className="bg-gray-800 rounded-lg p-6 max-w-md w-full max-h-[80vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold">Group Members</h3>
                <button onClick={() => setShowMembers(false)} className="text-gray-400 hover:text-white">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <div className="space-y-3">
                {members.map((member) => {
                  const profilePic = getProfilePicture(member);
                  return (
                    <div key={member._id} className="flex items-center gap-3 p-3 bg-gray-700 rounded-lg">
                      <div className="relative">
                        {profilePic ? (
                          <img src={profilePic} alt={member.firstName} className="w-10 h-10 rounded-full object-cover" />
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-linear-to-br from-blue-500 to-purple-600 flex items-center justify-center font-bold">
                            {member.firstName?.[0]}{member.lastName?.[0]}
                          </div>
                        )}
                        <div className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-gray-700 ${member.isOnline ? 'bg-green-500' : 'bg-gray-500'}`}></div>
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold">{member.firstName} {member.lastName}</p>
                        <p className="text-sm text-gray-400">@{member.username}</p>
                      </div>
                      <div className="text-xs text-gray-400">
                        {member.isOnline ? (
                          <span className="text-green-400">Online</span>
                        ) : member.lastSeen ? (
                          <span>Last seen: {new Date(member.lastSeen).toLocaleDateString()}</span>
                        ) : (
                          <span>Offline</span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        <Footer />
      </div>

      {/* Quiz Modal */}
      {quizGroup && (
        <GroupQuiz
          group={quizGroup}
          onClose={() => setQuizGroup(null)}
          onSuccess={() => {
            fetchGroups();
            setQuizGroup(null);
          }}
        />
      )}
    </div>
  );
}
