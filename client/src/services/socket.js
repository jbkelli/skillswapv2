import { io } from 'socket.io-client';
import { SERVER_URL } from '../config/api';

let socketInstance = null;

/**
 * Get or create a singleton socket instance
 * This prevents multiple socket connections from being created
 * @param {string} token - JWT token for authentication
 * @returns {Socket} Socket.io client instance
 */
export const getSocket = (token) => {
  // If socket already exists and is connected, return it
  if (socketInstance && socketInstance.connected) {
    return socketInstance;
  }

  // If socket exists but is disconnected, reconnect with new token
  if (socketInstance) {
    socketInstance.auth = { token };
    socketInstance.connect();
    return socketInstance;
  }

  // Create new socket instance with authentication
  socketInstance = io(SERVER_URL, {
    auth: { token },
    reconnection: true,
    reconnectionDelay: 1000,
    reconnectionAttempts: 5
  });

  // Handle connection errors
  socketInstance.on('connect_error', (error) => {
    console.error('Socket connection error:', error.message);
    if (error.message.includes('Authentication error')) {
      // Token might be invalid, disconnect
      disconnectSocket();
    }
  });

  return socketInstance;
};

/**
 * Disconnect and cleanup socket instance
 */
export const disconnectSocket = () => {
  if (socketInstance) {
    socketInstance.disconnect();
    socketInstance = null;
  }
};

/**
 * Check if socket is connected
 * @returns {boolean}
 */
export const isSocketConnected = () => {
  return socketInstance && socketInstance.connected;
};

export default { getSocket, disconnectSocket, isSocketConnected };
