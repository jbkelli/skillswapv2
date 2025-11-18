import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { io } from 'socket.io-client';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import api from '../services/api';
import Header from '../components/Header';
import NeuralBackground from '../components/NeuralBackground';
import Footer from '../components/Footer';
import { SOCKET_URL, API_BASE_URL } from '../config/api';

const socket = io(SOCKET_URL);

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
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  useEffect(() => {
    // Join socket with user ID
    socket.emit('join', user.id);

    // Fetch other user info
    fetchOtherUser();

    // Fetch message history
    fetchMessages();

    // Listen for incoming messages
    socket.on('receive_message', (data) => {
      if (data.senderId === userId) {
        setMessages(prev => [...prev, {
          sender: { _id: userId },
          message: data.message,
          createdAt: data.timestamp
        }]);
        
        // Show notification for new message
        if (otherUser) {
          showNotification(`New message from ${otherUser.firstName}`, 'info');
        }
      }
    });

    // Listen for typing indicator
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
      socket.off('receive_message');
      socket.off('user_typing');
      socket.off('user_stop_typing');
    };
  }, [userId, user.id]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const fetchOtherUser = async () => {
    try {
      const response = await api.get(`/users/${userId}`);
      setOtherUser(response.data.user);
    } catch (err) {
      console.error('Failed to fetch user');
    }
  };

  const fetchMessages = async () => {
    try {
      const response = await api.get(`/chat/${userId}`);
      setMessages(response.data.messages);
      setLoading(false);

      // Mark messages as read
      await api.put(`/chat/read/${userId}`);
    } catch (err) {
      console.error('Failed to fetch messages');
      setLoading(false);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleTyping = () => {
    socket.emit('typing', { senderId: user.id, receiverId: userId });

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    typingTimeoutRef.current = setTimeout(() => {
      socket.emit('stop_typing', { senderId: user.id, receiverId: userId });
    }, 1000);
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    
    if (!newMessage.trim()) return;

    // Check if message starts with @vally
    if (newMessage.trim().toLowerCase().startsWith('@vally')) {
      const question = newMessage.replace(/@vally/i, '').trim();
      
      if (!question) {
        showNotification('Please ask Vally a question after @vally', 'warning');
        return;
      }

      // Add user message
      const userMsg = {
        sender: { _id: user.id, firstName: user.firstName, lastName: user.lastName },
        message: newMessage,
        createdAt: new Date().toISOString()
      };
      setMessages(prev => [...prev, userMsg]);
      setNewMessage('');
      setVallyTyping(true);

      try {
        // Call Vally AI
        const response = await fetch(`${API_BASE_URL}/ai/chat`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          },
          body: JSON.stringify({ prompt: question })
        });

        const data = await response.json();
        
        // Add Vally's response
        const vallyMsg = {
          sender: { _id: 'vally', firstName: 'Vally', lastName: 'AI' },
          message: data.response || 'Sorry, I couldn\'t process that. Try again!',
          createdAt: new Date().toISOString(),
          isVally: true
        };
        setMessages(prev => [...prev, vallyMsg]);
      } catch (err) {
        console.error('Vally error:', err);
        const errorMsg = {
          sender: { _id: 'vally', firstName: 'Vally', lastName: 'AI' },
          message: 'Oops! I had a hiccup. Try asking me again! 😊',
          createdAt: new Date().toISOString(),
          isVally: true
        };
        setMessages(prev => [...prev, errorMsg]);
      } finally {
        setVallyTyping(false);
      }
      return;
    }

    // Normal message sending
    try {
      // Save to database
      const response = await api.post('/chat/send', {
        receiverId: userId,
        message: newMessage
      });

      // Send via socket
      socket.emit('send_message', {
        senderId: user.id,
        receiverId: userId,
        message: newMessage
      });

      // Add to local messages
      setMessages(prev => [...prev, response.data.data]);
      setNewMessage('');
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
                <div className="w-10 h-10 rounded-full bg-linear-to-br from-blue-500 to-purple-600 flex items-center justify-center text-lg font-bold">
                  {otherUser.firstName?.[0]}{otherUser.lastName?.[0]}
                </div>
                <div>
                  <h2 className="font-bold">{otherUser.firstName} {otherUser.lastName}</h2>
                  <p className="text-sm text-gray-400">@{otherUser.username}</p>
                </div>
              </div>
            )}
          </div>
        </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto px-6 py-4 max-w-4xl w-full mx-auto">
        <div className="space-y-4">
          {messages.map((msg, idx) => {
            const isMyMessage = msg.sender._id === user.id;
            const isVallyMessage = msg.isVally || msg.sender._id === 'vally';
            
            // Check if we need to show a date separator
            const currentDate = new Date(msg.createdAt).toDateString();
            const previousDate = idx > 0 ? new Date(messages[idx - 1].createdAt).toDateString() : null;
            const showDateSeparator = currentDate !== previousDate;
            
            // Format date for separator
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
              <React.Fragment key={idx}>
                {/* Date Separator */}
                {showDateSeparator && (
                  <div className="flex justify-center my-4">
                    <div className="bg-gray-800 text-gray-400 text-xs px-3 py-1 rounded-full">
                      {formatDateSeparator(msg.createdAt)}
                    </div>
                  </div>
                )}
                
                {/* Message */}
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
                      <p className="wrap-break-word">{msg.message}</p>
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
          <form onSubmit={handleSendMessage} className="flex gap-3">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => {
                setNewMessage(e.target.value);
                handleTyping();
              }}
              placeholder="Type a message or @vally to ask AI..."
              className="flex-1 bg-gray-800 border border-gray-700 text-gray-300 rounded-lg py-3 px-4 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <button
              type="submit"
              disabled={!newMessage.trim()}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-500 transition-colors font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Send
            </button>
          </form>
        </div>
      </div>

      <Footer />
      </div>
    </div>
  );
}
