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

    // Request notification permissions on load
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }

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
        // Show in-app notification with sound
        setNotification({
          senderId: data.senderId,
          senderName: data.senderName || 'Someone',
          text: data.message,
          timestamp: data.timestamp
        });

        // Show browser notification if permission granted
        if ('Notification' in window && Notification.permission === 'granted') {
          const browserNotification = new Notification('New message from ' + (data.senderName || 'Someone'), {
            body: data.message || 'Sent you a message',
            icon: '/logo.png', // You can replace with your app icon
            badge: '/logo.png',
            tag: `chat-${data.senderId}`, // Prevents duplicate notifications
            requireInteraction: false,
            silent: false // Play system sound
          });

          // Navigate to chat when notification is clicked
          browserNotification.onclick = () => {
            window.focus();
            window.location.href = `/chat/${data.senderId}`;
            browserNotification.close();
          };

          // Auto close after 5 seconds
          setTimeout(() => browserNotification.close(), 5000);
        }
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
