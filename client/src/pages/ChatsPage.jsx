import React, { useEffect, useState, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { io } from 'socket.io-client';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import api from '../services/api';
import Header from '../components/Header';
import NeuralBackground from '../components/NeuralBackground';
import Footer from '../components/Footer';
import OnlineIndicator from '../components/OnlineIndicator';
import { SOCKET_URL, API_BASE_URL, SERVER_URL } from '../config/api';

export default function ChatsPage() {
  const { userId: urlUserId } = useParams();
  const { user } = useAuth();
  const { showNotification } = useNotification();
  const navigate = useNavigate();
  
  const [conversations, setConversations] = useState([]);
  const [selectedUserId, setSelectedUserId] = useState(urlUserId || null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [otherUser, setOtherUser] = useState(null);
  const [isTyping, setIsTyping] = useState(false);
  const [loading, setLoading] = useState(true);
  const [vallyTyping, setVallyTyping] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [filePreview, setFilePreview] = useState(null);
  const [isUserScrolling, setIsUserScrolling] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [userStatuses, setUserStatuses] = useState({});
  const [imageErrors, setImageErrors] = useState({});
  
  const messagesEndRef = useRef(null);
  const messagesContainerRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const fileInputRef = useRef(null);
  const socketRef = useRef(null);
  const hasLoadedMessages = useRef(false);

  // Helper function to get profile picture URL
  const getProfilePicture = (user) => {
    if (!user) return null;
    const picUrl = user.profilePicture || user.profilePic || user.profileImage;
    if (!picUrl) return null;
    // If it's already a full URL, return it
    if (picUrl.startsWith('http')) return picUrl;
    // If it starts with /, don't add another /
    if (picUrl.startsWith('/')) return `${SERVER_URL}${picUrl}`;
    // Otherwise, add the /
    return `${SERVER_URL}/${picUrl}`;
  };

  // Initialize socket connection once
  useEffect(() => {
    if (!socketRef.current) {
      socketRef.current = io(SOCKET_URL);
    }
    
    const socket = socketRef.current;
    socket.emit('join', user.id);

    // Listen for online status changes
    socket.on('user_status_change', ({ userId, isOnline, lastSeen }) => {
      setUserStatuses(prev => ({
        ...prev,
        [userId]: { isOnline, lastSeen }
      }));
    });

    // Listen for incoming messages
    const handleReceiveMessage = (data) => {
      if (data.senderId === selectedUserId) {
        setMessages(prev => {
          const exists = prev.some(msg => 
            msg._id === data._id ||
            (msg.message === data.message && 
            msg.sender?._id === selectedUserId &&
            Math.abs(new Date(msg.createdAt) - new Date(data.timestamp)) < 1000)
          );
          
          if (exists) return prev;
          
          return [...prev, {
            sender: { _id: selectedUserId, firstName: otherUser?.firstName, lastName: otherUser?.lastName },
            message: data.message,
            createdAt: data.timestamp,
            _id: data._id
          }];
        });
        setIsUserScrolling(false);
      }
      
      // Update conversations list
      fetchConversations();
    };

    socket.on('receive_message', handleReceiveMessage);

    socket.on('user_typing', (data) => {
      if (data.senderId === selectedUserId) {
        setIsTyping(true);
      }
    });

    socket.on('user_stop_typing', (data) => {
      if (data.senderId === selectedUserId) {
        setIsTyping(false);
      }
    });

    return () => {
      socket.off('receive_message', handleReceiveMessage);
      socket.off('user_typing');
      socket.off('user_stop_typing');
    };
  }, [selectedUserId, user.id, otherUser]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
    };
  }, []);

  // Fetch conversations list
  useEffect(() => {
    fetchConversations();
  }, []);

  // Fetch messages when a user is selected
  useEffect(() => {
    if (selectedUserId) {
      hasLoadedMessages.current = false;
      fetchOtherUser();
      fetchMessages();
    }
  }, [selectedUserId]);

  // Auto-scroll when messages change
  useEffect(() => {
    const container = messagesContainerRef.current;
    if (!container) return;
    
    const { scrollTop, scrollHeight, clientHeight } = container;
    const isNearBottom = scrollHeight - scrollTop - clientHeight < 150;
    
    if (isNearBottom || !isUserScrolling) {
      scrollToBottom();
    }
  }, [messages]);

  // Detect scroll
  useEffect(() => {
    const container = messagesContainerRef.current;
    if (!container) return;

    const handleScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = container;
      const isNearBottom = scrollHeight - scrollTop - clientHeight < 150;
      setIsUserScrolling(!isNearBottom);
    };

    container.addEventListener('scroll', handleScroll, { passive: true });
    return () => container.removeEventListener('scroll', handleScroll);
  }, []);

  const fetchConversations = async () => {
    try {
      const response = await api.get('/chat/conversations');
      setConversations(response.data.conversations);
      setLoading(false);
    } catch (err) {
      console.error('Failed to fetch conversations:', err);
      setLoading(false);
    }
  };

  const fetchOtherUser = async () => {
    if (!selectedUserId) return;
    try {
      const response = await api.get(`/users/${selectedUserId}`);
      setOtherUser(response.data.user);
    } catch (err) {
      console.error('Failed to fetch user');
    }
  };

  const fetchMessages = async () => {
    if (!selectedUserId) return;
    try {
      const response = await api.get(`/chat/${selectedUserId}`);
      const dbMessages = response.data.messages;
      
      const savedMessages = localStorage.getItem(`chatMessages_${selectedUserId}`);
      let vallyMessages = [];
      
      if (savedMessages) {
        try {
          const parsed = JSON.parse(savedMessages);
          vallyMessages = parsed.filter(msg => msg.isVally || msg.sender?._id === 'vally');
        } catch (e) {
          console.error('Failed to parse saved messages:', e);
        }
      }
      
      const allMessages = [...dbMessages, ...vallyMessages];
      const uniqueMessages = allMessages.reduce((acc, msg) => {
        const isDuplicate = acc.some(m => 
          m._id === msg._id || 
          (m.message === msg.message && m.createdAt === msg.createdAt)
        );
        if (!isDuplicate) acc.push(msg);
        return acc;
      }, []);
      
      uniqueMessages.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
      
      setMessages(uniqueMessages);
      hasLoadedMessages.current = true;

      await api.put(`/chat/read/${selectedUserId}`);
    } catch (err) {
      console.error('Failed to fetch messages');
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleTyping = () => {
    const socket = socketRef.current;
    if (!socket || !selectedUserId) return;
    
    socket.emit('typing', { senderId: user.id, receiverId: selectedUserId });

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    typingTimeoutRef.current = setTimeout(() => {
      socket.emit('stop_typing', { senderId: user.id, receiverId: selectedUserId });
    }, 1000);
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onloadend = () => {
          setFilePreview(reader.result);
        };
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
    if (!selectedFile || !selectedUserId) return;
    const socket = socketRef.current;
    if (!socket) return;

    try {
      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('receiverId', selectedUserId);
      formData.append('message', newMessage || '');

      const response = await api.post('/chat/send-file', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      socket.emit('send_message', {
        senderId: user.id,
        receiverId: selectedUserId,
        message: response.data.data.message || 'Sent a file',
        fileUrl: response.data.data.fileUrl,
        fileName: response.data.data.fileName,
        messageType: response.data.data.messageType,
        _id: response.data.data._id
      });

      setMessages(prev => [...prev, response.data.data]);
      setNewMessage('');
      handleRemoveFile();
      socket.emit('stop_typing', { senderId: user.id, receiverId: selectedUserId });
      fetchConversations();
    } catch (err) {
      console.error('Failed to send file:', err);
      showNotification('Failed to send file', 'error');
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    const socket = socketRef.current;
    if (!socket || !selectedUserId) return;
    
    if (selectedFile) {
      await handleSendFile();
      return;
    }
    
    if (!newMessage.trim()) return;

    // Vally AI integration
    if (newMessage.trim().toLowerCase().startsWith('@vally')) {
      const question = newMessage.replace(/@vally/i, '').trim();
      
      if (!question) {
        showNotification('Please ask Vally a question after @vally', 'warning');
        return;
      }

      const userMsg = {
        sender: { _id: user.id, firstName: user.firstName, lastName: user.lastName },
        message: newMessage,
        createdAt: new Date().toISOString(),
        tempId: `temp-${Date.now()}`
      };
      setMessages(prev => [...prev, userMsg]);
      setNewMessage('');
      setVallyTyping(true);
      setIsUserScrolling(false);

      try {
        const response = await fetch(`${API_BASE_URL}/ai/chat`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          },
          body: JSON.stringify({ prompt: question })
        });

        const data = await response.json();
        
        const vallyMsg = {
          sender: { _id: 'vally', firstName: 'Vally', lastName: 'AI' },
          message: data.response || 'Sorry, I couldn\'t process that. Try again!',
          createdAt: new Date().toISOString(),
          isVally: true,
          messageType: 'text',
          tempId: `vally-${Date.now()}`
        };
        setMessages(prev => [...prev, vallyMsg]);
        setIsUserScrolling(false);
        
        // Save Vally messages to localStorage
        const vallyMessages = [...messages, userMsg, vallyMsg].filter(msg => msg.isVally || msg.sender?._id === 'vally' || msg.tempId?.startsWith('temp-'));
        localStorage.setItem(`chatMessages_${selectedUserId}`, JSON.stringify(vallyMessages));
      } catch (err) {
        console.error('Vally error:', err);
        const errorMsg = {
          sender: { _id: 'vally', firstName: 'Vally', lastName: 'AI' },
          message: 'Oops! I had a hiccup. Try asking me again! 😊',
          createdAt: new Date().toISOString(),
          isVally: true,
          tempId: `vally-error-${Date.now()}`
        };
        setMessages(prev => [...prev, errorMsg]);
        setIsUserScrolling(false);
      } finally {
        setVallyTyping(false);
      }
      return;
    }

    // Regular message
    try {
      const response = await api.post('/chat/send', {
        receiverId: selectedUserId,
        message: newMessage
      });

      socket.emit('send_message', {
        senderId: user.id,
        receiverId: selectedUserId,
        message: newMessage,
        _id: response.data.data._id
      });

      setMessages(prev => [...prev, response.data.data]);
      setNewMessage('');
      setIsUserScrolling(false);
      socket.emit('stop_typing', { senderId: user.id, receiverId: selectedUserId });
      fetchConversations();
    } catch (err) {
      console.error('Failed to send message');
    }
  };

  const filteredConversations = conversations.filter(conv => {
    const searchLower = searchQuery.toLowerCase();
    return (
      conv.user.firstName.toLowerCase().includes(searchLower) ||
      conv.user.lastName.toLowerCase().includes(searchLower) ||
      conv.user.username.toLowerCase().includes(searchLower)
    );
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <NeuralBackground />
        <div className="text-white text-xl relative z-10">Loading chats...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white flex flex-col relative">
      <NeuralBackground />
      
      <div className="relative z-10 flex flex-col h-screen">
        <Header />
        
        <div className="flex-1 flex overflow-hidden">
          {/* Conversations Sidebar - Hidden on mobile when chat is selected */}
          <div className={`w-full md:w-80 lg:w-96 bg-gray-900 border-r border-gray-800 flex flex-col ${
            selectedUserId ? 'hidden md:flex' : 'flex'
          }`}>
            {/* Sidebar Header */}
            <div className="p-4 border-b border-gray-800">
              <h2 className="text-xl font-bold mb-3">Chats</h2>
              <div className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search or start a new chat"
                  className="w-full bg-gray-800 border border-gray-700 text-gray-300 rounded-lg py-2 px-4 pl-10 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <svg className="w-5 h-5 text-gray-400 absolute left-3 top-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>

            {/* Conversations List */}
            <div className="flex-1 overflow-y-auto">
              {filteredConversations.length === 0 ? (
                <div className="p-6 text-center text-gray-400">
                  <p>No conversations yet</p>
                  <p className="text-sm mt-2">Start chatting from user profiles</p>
                </div>
              ) : (
                filteredConversations.map((conv) => (
                  <div
                    key={conv.user._id}
                    onClick={() => setSelectedUserId(conv.user._id)}
                    className={`p-4 border-b border-gray-800 cursor-pointer hover:bg-gray-800 transition-colors ${
                      selectedUserId === conv.user._id ? 'bg-gray-800' : ''
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        {getProfilePicture(conv.user) && !imageErrors[conv.user._id] ? (
                          <>
                            <img 
                              src={getProfilePicture(conv.user)} 
                              alt={`${conv.user.firstName} ${conv.user.lastName}`}
                              className="w-12 h-12 rounded-full object-cover"
                              onError={() => {
                                setImageErrors(prev => ({ ...prev, [conv.user._id]: true }));
                              }}
                            />
                          </>
                        ) : (
                          <div className="w-12 h-12 rounded-full bg-linear-to-br from-blue-500 to-purple-600 flex items-center justify-center text-lg font-bold">
                            {conv.user.firstName?.[0]}{conv.user.lastName?.[0]}
                          </div>
                        )}
                        <div className="absolute bottom-0 right-0">
                          <OnlineIndicator 
                            isOnline={userStatuses[conv.user._id]?.isOnline ?? conv.user.isOnline ?? false}
                            size="md"
                            lastSeen={userStatuses[conv.user._id]?.lastSeen ?? conv.user.lastSeen}
                          />
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-baseline">
                          <h3 className="font-semibold truncate">
                            {conv.user.firstName} {conv.user.lastName}
                          </h3>
                          <span className="text-xs text-gray-400">
                            {new Date(conv.lastMessage.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                        <p className="text-sm text-gray-400 truncate">
                          {conv.lastMessage.message || 'File sent'}
                        </p>
                        {conv.unreadCount > 0 && (
                          <span className="inline-block mt-1 bg-blue-600 text-white text-xs px-2 py-0.5 rounded-full">
                            {conv.unreadCount}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Chat Area - Full screen on mobile when selected */}
          {selectedUserId && otherUser ? (
            <div className={`flex-1 flex flex-col ${
              selectedUserId ? 'flex' : 'hidden md:flex'
            }`}>
              {/* Chat Header */}
              <div className="bg-gray-800 border-b border-gray-700 py-3 px-6">
                <div className="flex items-center gap-3">
                  {/* Back button for mobile */}
                  <button
                    onClick={() => setSelectedUserId(null)}
                    className="md:hidden text-gray-400 hover:text-white transition-colors"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>
                  <div className="relative">
                    {getProfilePicture(otherUser) && !imageErrors[selectedUserId] ? (
                      <>
                        <img 
                          src={getProfilePicture(otherUser)} 
                          alt={`${otherUser.firstName} ${otherUser.lastName}`}
                          className="w-10 h-10 rounded-full object-cover"
                          onError={() => {
                            setImageErrors(prev => ({ ...prev, [selectedUserId]: true }));
                          }}
                        />
                      </>
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-linear-to-br from-blue-500 to-purple-600 flex items-center justify-center text-lg font-bold">
                        {otherUser.firstName?.[0]}{otherUser.lastName?.[0]}
                      </div>
                    )}
                    <div className="absolute bottom-0 right-0">
                      <OnlineIndicator 
                        isOnline={userStatuses[selectedUserId]?.isOnline ?? otherUser.isOnline ?? false}
                        size="sm"
                        lastSeen={userStatuses[selectedUserId]?.lastSeen ?? otherUser.lastSeen}
                      />
                    </div>
                  </div>
                  <div>
                    <h2 className="font-bold">{otherUser.firstName} {otherUser.lastName}</h2>
                    <OnlineIndicator 
                      isOnline={userStatuses[selectedUserId]?.isOnline ?? otherUser.isOnline ?? false}
                      showLabel={true}
                      size="sm"
                      lastSeen={userStatuses[selectedUserId]?.lastSeen ?? otherUser.lastSeen}
                    />
                  </div>
                </div>
              </div>

              {/* Messages Area */}
              <div ref={messagesContainerRef} className="flex-1 overflow-y-auto px-6 py-4">
                <div className="space-y-4">
                  {messages.map((msg, idx) => {
                    const isMyMessage = msg.sender._id === user.id;
                    const isVallyMessage = msg.isVally || msg.sender._id === 'vally';
                    
                    const currentDate = new Date(msg.createdAt).toDateString();
                    const previousDate = idx > 0 ? new Date(messages[idx - 1].createdAt).toDateString() : null;
                    const showDateSeparator = currentDate !== previousDate;
                    
                    const formatDateSeparator = (date) => {
                      const msgDate = new Date(date);
                      const today = new Date();
                      const yesterday = new Date(today);
                      yesterday.setDate(yesterday.getDate() - 1);
                      
                      if (msgDate.toDateString() === today.toDateString()) {
                        return 'Today';
                      } else if (msgDate.toDateString() === yesterday.toDateString()) {
                        return 'Yesterday';
                      } else {
                        return msgDate.toLocaleDateString('en-US', { month: 'numeric', day: 'numeric', year: 'numeric' });
                      }
                    };
                    
                    return (
                      <React.Fragment key={msg._id || msg.tempId || `msg-${idx}`}>
                        {showDateSeparator && (
                          <div className="flex justify-center my-4">
                            <div className="bg-gray-800 text-gray-400 text-xs px-3 py-1 rounded-full">
                              {formatDateSeparator(msg.createdAt)}
                            </div>
                          </div>
                        )}
                        
                        <div className={`flex ${isMyMessage ? 'justify-end' : 'justify-start'}`}>
                          <div className={`max-w-[70%] ${isMyMessage ? 'order-2' : 'order-1'}`}>
                            {!isMyMessage && (
                              <p className={`text-xs mb-1 ${isVallyMessage ? 'text-purple-400 font-semibold' : 'text-gray-400'}`}>
                                {isVallyMessage ? '🤖 Vally AI' : `${msg.sender.firstName} ${msg.sender.lastName}`}
                              </p>
                            )}
                            <div
                              className={`rounded-2xl px-4 py-3 ${
                                isMyMessage
                                  ? 'bg-blue-600 text-white rounded-br-none'
                                  : isVallyMessage
                                  ? 'bg-linear-to-br from-purple-600 to-pink-600 text-white rounded-bl-none'
                                  : 'bg-gray-800 text-gray-100 rounded-bl-none'
                              }`}
                            >
                              {msg.messageType === 'image' && msg.fileUrl && (
                                <div className="mb-2">
                                  <img 
                                    src={msg.fileUrl.startsWith('http') ? msg.fileUrl : `${SERVER_URL}${msg.fileUrl}`}
                                    alt={msg.fileName || 'Image'}
                                    className="max-w-full rounded-lg cursor-pointer hover:opacity-90 transition-opacity"
                                    onClick={() => {
                                      const fileUrl = msg.fileUrl.startsWith('http') ? msg.fileUrl : `${SERVER_URL}${msg.fileUrl}`;
                                      window.open(fileUrl, '_blank');
                                    }}
                                  />
                                </div>
                              )}
                              
                              {msg.messageType === 'file' && msg.fileUrl && (
                                <div className="mb-2 p-3 bg-white/10 rounded-lg border border-white/20">
                                  <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-gray-700 rounded flex items-center justify-center shrink-0">
                                      <svg className="w-6 h-6 text-gray-300" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M8 4a3 3 0 00-3 3v4a5 5 0 0010 0V7a1 1 0 112 0v4a7 7 0 11-14 0V7a5 5 0 0110 0v4a3 3 0 11-6 0V7a1 1 0 012 0v4a1 1 0 102 0V7a3 3 0 00-3-3z" clipRule="evenodd" />
                                      </svg>
                                    </div>
                                    <div className="flex-1 min-w-0">
                                      <p className="text-sm font-medium truncate">{msg.fileName}</p>
                                      {msg.fileSize && (
                                        <p className="text-xs opacity-70">{(msg.fileSize / 1024).toFixed(1)} KB</p>
                                      )}
                                    </div>
                                  </div>
                                  <div className="flex gap-2 mt-3">
                                    <button
                                      onClick={() => {
                                        const fileUrl = msg.fileUrl.startsWith('http') ? msg.fileUrl : `${SERVER_URL}${msg.fileUrl}`;
                                        window.open(fileUrl, '_blank');
                                      }}
                                      className="flex-1 bg-gray-700 hover:bg-gray-600 text-white px-3 py-2 rounded text-sm font-medium transition-colors flex items-center justify-center gap-2"
                                    >
                                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                      </svg>
                                      View
                                    </button>
                                    <a
                                      href={msg.fileUrl.startsWith('http') ? msg.fileUrl : `${SERVER_URL}${msg.fileUrl}`}
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
                            <p className="text-xs text-gray-500 mt-1">
                              {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </p>
                          </div>
                        </div>
                      </React.Fragment>
                    );
                  })}
                  {(isTyping || vallyTyping) && (
                    <div className="flex justify-start">
                    <div className={`rounded-2xl px-4 py-3 rounded-bl-none ${
                      vallyTyping ? 'bg-linear-to-br from-purple-600 to-pink-600' : 'bg-gray-800'
                    }`}>
                        {vallyTyping && <p className="text-xs text-purple-200 mb-1">🤖 Vally AI</p>}
                        <div className="flex gap-1">
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
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
                <p className="text-xs text-gray-400 mb-2">💡 Tip: Type <span className="text-purple-400 font-semibold">@vally</span> to ask Vally AI a question!</p>
                
                {selectedFile && (
                  <div className="mb-3 p-3 bg-gray-800 rounded-lg border border-gray-700">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        {filePreview ? (
                          <img src={filePreview} alt="Preview" className="w-12 h-12 object-cover rounded" />
                        ) : (
                          <div className="w-12 h-12 bg-gray-700 rounded flex items-center justify-center">
                            <svg className="w-6 h-6 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M8 4a3 3 0 00-3 3v4a5 5 0 0010 0V7a1 1 0 112 0v4a7 7 0 11-14 0V7a5 5 0 0110 0v4a3 3 0 11-6 0V7a1 1 0 012 0v4a1 1 0 102 0V7a3 3 0 00-3-3z" clipRule="evenodd" />
                            </svg>
                          </div>
                        )}
                        <div>
                          <p className="text-sm font-medium text-white">{selectedFile.name}</p>
                          <p className="text-xs text-gray-400">{(selectedFile.size / 1024).toFixed(1)} KB</p>
                        </div>
                      </div>
                      <button
                        onClick={handleRemoveFile}
                        className="text-red-400 hover:text-red-300 transition-colors"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  </div>
                )}
                
                <form onSubmit={handleSendMessage} className="flex gap-3">
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileSelect}
                    accept="image/*,.pdf,.doc,.docx,.txt,.zip"
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="bg-gray-800 text-gray-300 p-3 rounded-lg hover:bg-gray-700 transition-colors"
                    title="Attach file"
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
                    placeholder={selectedFile ? "Add a caption (optional)..." : "Type a message or @vally to ask AI..."}
                    className="flex-1 bg-gray-800 border border-gray-700 text-gray-300 rounded-lg py-3 px-4 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <button
                    type="submit"
                    disabled={!newMessage.trim() && !selectedFile}
                    className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-500 transition-colors font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {selectedFile ? 'Send File' : 'Send'}
                  </button>
                </form>
              </div>
            </div>
          ) : (
            <div className="flex-1 flex items-center justify-center bg-gray-900/50">
              <div className="text-center">
                <svg className="w-24 h-24 text-gray-600 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
                <h3 className="text-xl font-semibold text-gray-400 mb-2">Select a conversation</h3>
                <p className="text-gray-500">Choose a chat from the sidebar to start messaging</p>
              </div>
            </div>
          )}
        </div>

        <Footer />
      </div>
    </div>
  );
}
