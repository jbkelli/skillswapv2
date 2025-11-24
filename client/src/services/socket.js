// Socket service for managing socket connections
let socket = null;

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};

export const getSocket = () => {
  return socket;
};

export const setSocket = (socketInstance) => {
  socket = socketInstance;
};
