import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import api from '../services/api';
import Header from '../components/Header';
import NeuralBackground from '../components/NeuralBackground';
import Footer from '../components/Footer';
import { API_BASE_URL, SERVER_URL } from '../config/api';
import { getSocket } from '../services/socket';

export default function ChatPage() {
  const { userId } = useParams();
  const { user } = useAuth();
  const { showNotification } = useNotification();
  const navigate = useNavigate();
  
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [otherUser, setOtherUser] = useState(null);
  const [isTyping, setIsTyping] = useState(false);
  const [loading, setLoading] = useState(true);
  const [vallyTyping, setVallyTyping] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [filePreview, setFilePreview] = useState(null);
  const [isUserScrolling, setIsUserScrolling] = useState(false);
  const messagesEndRef = useRef(null);
  const messagesContainerRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const fileInputRef = useRef(null);
  const socketRef = useRef(null);
  const hasLoadedMessages = useRef(false);

  // Initialize socket connection once with authentication
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return;

    // Get authenticated socket instance
    const socket = getSocket(token);
    socketRef.current = socket;

    // Request notification permissions
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }

    // Connect this user to the chat socket
    socket.emit('join', user.id);

    // Load info about who we're chatting with
    fetchOtherUser();

    // Load the conversation history only once
    if (!hasLoadedMessages.current) {
      fetchMessages();
      hasLoadedMessages.current = true;
    }

    // Set up listener for new messages
    const handleReceiveMessage = (data) => {
      // Only add the message if it's from the person we're chatting with
      if (data.senderId === userId) {
        setMessages(prev => {
          // Check if message already exists to avoid duplicates
          const exists = prev.some(msg => 
            msg._id === data._id ||
            (msg.message === data.message && 
            msg.sender?._id === userId &&
            Math.abs(new Date(msg.createdAt) - new Date(data.timestamp)) < 1000)
          );
          
          if (exists) return prev;
          
          return [...prev, {
            sender: { _id: userId, firstName: otherUser?.firstName, lastName: otherUser?.lastName },
            message: data.message,
            createdAt: data.timestamp || new Date().toISOString(),
            _id: data._id,
            isVally: data.isVally || false,
            vallyTriggeredBy: data.isVally ? { firstName: otherUser?.firstName } : null
          }];
        });
        setIsUserScrolling(false); // Auto-scroll to new message
      }
    };

    socket.on('receive_message', handleReceiveMessage);

    // Show when the other person is typing
    socket.on('user_typing', (data) => {
      if (data.senderId === userId) {
        setIsTyping(true);
      }
    });

    socket.on('user_stop_typing', (data) => {
      if (data.senderId === userId) {
        setIsTyping(false);
      }
    });

    return () => {
      socket.off('receive_message', handleReceiveMessage);
      socket.off('user_typing');
      socket.off('user_stop_typing');
      // Don't disconnect - socket is singleton
    };
  }, [userId, user.id]); // Removed otherUser from dependencies

  // Save messages to localStorage (debounced)
  useEffect(() => {
    if (messages.length > 0 && hasLoadedMessages.current) {
      const timer = setTimeout(() => {
        // Only save Vally messages to localStorage
        const vallyMessages = messages.filter(msg => msg.isVally || msg.sender?._id === 'vally');
        if (vallyMessages.length > 0) {
          localStorage.setItem(`chatMessages_${userId}`, JSON.stringify(vallyMessages));
        }
      }, 500); // Debounce for 500ms
      
      return () => clearTimeout(timer);
    }
  }, [messages, userId]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    const container = messagesContainerRef.current;
    if (!container) return;
    
    // Check if user is near the bottom before auto-scrolling
    const { scrollTop, scrollHeight, clientHeight } = container;
    const isNearBottom = scrollHeight - scrollTop - clientHeight < 150;
    
    // Only auto-scroll if user is already near the bottom or if it's a Vally response
    if (isNearBottom || !isUserScrolling) {
      scrollToBottom();
    }
  }, [messages]);

  // Detect if user is scrolling up
  useEffect(() => {
    const container = messagesContainerRef.current;
    if (!container) return;

    const handleScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = container;
      const isNearBottom = scrollHeight - scrollTop - clientHeight < 150;
      
      // Update scrolling state based on position
      setIsUserScrolling(!isNearBottom);
    };

    container.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      container.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const fetchOtherUser = async () => {
    try {
      const response = await api.get(`/users/${userId}`);
      setOtherUser(response.data.user);
    } catch (err) {
      console.error('Failed to fetch user:', err);
      showNotification('Failed to load user profile', 'error');
      // Set a default user object to prevent crashes
      setOtherUser({ firstName: 'User', lastName: '', _id: userId });
    }
  };

  const fetchMessages = async () => {
    try {
      const response = await api.get(`/chat/${userId}`);
      const dbMessages = response.data.messages || [];
      
      // Get Vally messages from localStorage
      const savedMessages = localStorage.getItem(`chatMessages_${userId}`);
      let vallyMessages = [];
      
      if (savedMessages) {
        try {
          const parsed = JSON.parse(savedMessages);
          vallyMessages = parsed.filter(msg => msg.isVally || msg.sender?._id === 'vally');
        } catch (e) {
          console.error('Failed to parse saved messages:', e);
        }
      }
      
      // Merge DB messages with Vally messages and remove duplicates
      const allMessages = [...dbMessages, ...vallyMessages];
      const uniqueMessages = allMessages.reduce((acc, msg) => {
        const isDuplicate = acc.some(m => 
          m._id === msg._id || 
          (m.message === msg.message && m.createdAt === msg.createdAt)
        );
        if (!isDuplicate) acc.push(msg);
        return acc;
      }, []);
      
      // Sort by date
      uniqueMessages.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
      
      setMessages(uniqueMessages);
      setLoading(false);

      // Mark everything as read since we're viewing the chat
      try {
        await api.put(`/chat/read/${userId}`);
      } catch (e) {
        console.error('Failed to mark messages as read:', e);
      }
      
      // Scroll to bottom after messages load
      setTimeout(() => {
        scrollToBottom(true);
      }, 100);
    } catch (err) {
      console.error('Failed to fetch messages:', err);
      showNotification('Failed to load messages. Please try again.', 'error');
      setMessages([]);
      setLoading(false);
    }
  };

  const scrollToBottom = (instant = false) => {
    if (instant) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'instant' });
    } else {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleTyping = () => {
    const socket = socketRef.current;
    if (!socket) return;
    
    socket.emit('typing', { senderId: user.id, receiverId: userId });

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    typingTimeoutRef.current = setTimeout(() => {
      socket.emit('stop_typing', { senderId: user.id, receiverId: userId });
    }, 1000);
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      
      // Create preview for images
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
    if (!selectedFile) return;
    const socket = socketRef.current;
    if (!socket) return;

    try {
      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('receiverId', userId);
      formData.append('message', newMessage || '');

      const response = await api.post('/chat/send-file', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      // Send via socket
      socket.emit('send_message', {
        senderId: user.id,
        receiverId: userId,
        message: response.data.data.message || 'Sent a file',
        fileUrl: response.data.data.fileUrl,
        fileName: response.data.data.fileName,
        messageType: response.data.data.messageType,
        _id: response.data.data._id
      });

      setMessages(prev => [...prev, response.data.data]);
      setNewMessage('');
      handleRemoveFile();
      socket.emit('stop_typing', { senderId: user.id, receiverId: userId });
    } catch (err) {
      console.error('Failed to send file:', err);
      showNotification('Failed to send file', 'error');
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    const socket = socketRef.current;
    if (!socket) return;
    
    // If there's a file selected, send it instead
    if (selectedFile) {
      await handleSendFile();
      return;
    }
    
    if (!newMessage.trim()) return;

    // Is the user asking Vally for help?
    if (newMessage.trim().toLowerCase().startsWith('@vally')) {
      const question = newMessage.replace(/@vally/i, '').trim();
      
      if (!question) {
        showNotification('Please ask Vally a question after @vally', 'warning');
        return;
      }

      setNewMessage('');
      setVallyTyping(true);
      setIsUserScrolling(false);

      try {
        // Ask Vally for a response
        const response = await fetch(`${API_BASE_URL}/ai/chat`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          },
          body: JSON.stringify({ prompt: question })
        });

        const data = await response.json();
        const vallyResponseText = data.response || 'Sorry, I couldn\'t process that. Try again!';
        
        // Save both user question and Vally response to database
        const saveResponse = await api.post('/chat/send', {
          receiverId: userId,
          message: newMessage,
          isVally: true,
          vallyResponse: vallyResponseText
        });

        // Add both messages to UI
        const savedMessages = Array.isArray(saveResponse.data.data) 
          ? saveResponse.data.data 
          : [saveResponse.data.data];
        
        setMessages(prev => [...prev, ...savedMessages]);
        setIsUserScrolling(false);

        // Broadcast to other user via socket
        savedMessages.forEach(msg => {
          socket.emit('send_message', {
            senderId: user.id,
            receiverId: userId,
            message: msg.message,
            _id: msg._id,
            isVally: msg.isVally
          });
        });
      } catch (err) {
        console.error('Vally error:', err);
        showNotification('Failed to get Vally response', 'error');
      } finally {
        setVallyTyping(false);
      }
      return;
    }

    // Regular message (not for Vally)
    try {
      // Save it to the database first
      const response = await api.post('/chat/send', {
        receiverId: userId,
        message: newMessage
      });

      // Send it through Socket.io for real-time delivery
      socket.emit('send_message', {
        senderId: user.id,
        receiverId: userId,
        message: newMessage,
        _id: response.data.data._id
      });

      // Show it in the UI immediately
      setMessages(prev => [...prev, response.data.data]);
      setNewMessage('');
      setIsUserScrolling(false); // Auto-scroll to sent message
      socket.emit('stop_typing', { senderId: user.id, receiverId: userId });
    } catch (err) {
      console.error('Failed to send message');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <NeuralBackground />
        <div className="text-white text-xl relative z-10">Loading chat...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white flex flex-col relative">
      <NeuralBackground />
      
      <div className="relative z-10 flex flex-col h-screen">
        <Header />
        
        {/* Chat User Info Bar */}
        <div className="bg-gray-800 border-b border-gray-700 py-3 px-6 shrink-0">
          <div className="max-w-4xl mx-auto flex items-center gap-4">
            <button 
              onClick={() => navigate('/dashboard')}
              className="text-gray-400 hover:text-white transition-colors"
            >
              ← Back
            </button>
            {otherUser && (
              <div className="flex items-center gap-3">
                {otherUser.profilePicture ? (
                  <img 
                    src={otherUser.profilePicture} 
                    alt={`${otherUser.firstName} ${otherUser.lastName}`}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-linear-to-br from-blue-500 to-purple-600 flex items-center justify-center text-lg font-bold">
                    {otherUser.firstName?.[0]}{otherUser.lastName?.[0]}
                  </div>
                )}
                <div>
                  <h2 className="font-bold">{otherUser.firstName} {otherUser.lastName}</h2>
                  <p className="text-sm text-gray-400">
                    {otherUser.isOnline ? (
                      <span className="text-green-400">● Online</span>
                    ) : otherUser.lastSeen ? (
                      <span>Last seen: {new Date(otherUser.lastSeen).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} {new Date(otherUser.lastSeen).toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' })}</span>
                    ) : (
                      <span>@{otherUser.username}</span>
                    )}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

      {/* Messages Area */}
      <div ref={messagesContainerRef} className="flex-1 overflow-y-auto px-6 py-4 max-w-4xl w-full mx-auto">
        <div className="space-y-4">
          {messages.map((msg, idx) => {
            const isMyMessage = msg.sender._id === user.id;
            const isVallyMessage = msg.isVally || msg.sender._id === 'vally';
            
            // Should we show a date label here?
            const currentDate = new Date(msg.createdAt).toDateString();
            const previousDate = idx > 0 ? new Date(messages[idx - 1].createdAt).toDateString() : null;
            const showDateSeparator = currentDate !== previousDate;
            
            // Make dates readable (Today, Yesterday, etc.)
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
                {/* Date Separator */}
                {showDateSeparator && (
                  <div className="flex justify-center my-4">
                    <div className="bg-gray-800 text-gray-400 text-xs px-3 py-1 rounded-full">
                      {formatDateSeparator(msg.createdAt)}
                    </div>
                  </div>
                )}
                
                {/* Message */}
                <div className={`flex ${isVallyMessage ? 'justify-center' : isMyMessage ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[70%] ${isMyMessage ? 'order-2' : 'order-1'}`}>
                    {!isMyMessage && !isVallyMessage && (
                      <p className="text-xs mb-1 text-gray-400">
                        {msg.sender.firstName} {msg.sender.lastName}
                      </p>
                    )}
                    {isVallyMessage && (
                      <p className="text-xs mb-1 text-purple-400 font-semibold text-center">
                        🤖 Vally AI (asked by {msg.vallyTriggeredBy?.firstName || msg.sender?.firstName || 'someone'})
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
                      {/* Image Message */}
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
                      
                      {/* File Message */}
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
                      
                      {/* Text Message */}
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
      <div className="border-t border-gray-800 p-4 shrink-0 bg-gray-900">
        <div className="max-w-4xl mx-auto">
          <p className="text-xs text-gray-400 mb-2">💡 Tip: Type <span className="text-purple-400 font-semibold">@vally</span> to ask Vally AI a question!</p>
          
          {/* File Preview */}
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

      <Footer />
      </div>
    </div>
  );
}
