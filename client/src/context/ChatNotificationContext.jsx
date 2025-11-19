import React, { createContext, useContext, useState, useEffect } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';
import { useLocation } from 'react-router-dom';
import ChatNotification from '../components/ChatNotification';
import { SOCKET_URL } from '../config/api';

const ChatNotificationContext = createContext();

export const useChatNotifications = () => {
  const context = useContext(ChatNotificationContext);
  if (!context) {
    throw new Error('useChatNotifications must be used within ChatNotificationProvider');
  }
  return context;
};

export const ChatNotificationProvider = ({ children }) => {
  const { user, isAuthenticated } = useAuth();
  const location = useLocation();
  const [socket, setSocket] = useState(null);
  const [notification, setNotification] = useState(null);

  useEffect(() => {
    if (!isAuthenticated || !user) return;

    // Create socket connection
    const newSocket = io(SOCKET_URL);
    setSocket(newSocket);

    // Join with user ID
    newSocket.emit('join', user.id);

    // Listen for incoming messages
    newSocket.on('receive_message', (data) => {
      // Only show notification if not on the chat page with this user
      const isOnChatPage = location.pathname.startsWith('/chat/');
      const isCurrentChat = location.pathname === `/chat/${data.senderId}`;
      
      if (!isCurrentChat) {
        // Show notification with sound
        setNotification({
          senderId: data.senderId,
          senderName: data.senderName || 'Someone',
          text: data.message,
          timestamp: data.timestamp
        });
      }
    });

    return () => {
      newSocket.off('receive_message');
      newSocket.disconnect();
    };
  }, [isAuthenticated, user, location.pathname]);

  const closeNotification = () => {
    setNotification(null);
  };

  return (
    <ChatNotificationContext.Provider value={{ socket }}>
      {children}
      {notification && (
        <ChatNotification 
          message={notification} 
          onClose={closeNotification}
        />
      )}
    </ChatNotificationContext.Provider>
  );
};
