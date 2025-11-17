// API Configuration for different environments
const API_CONFIG = {
  development: {
    baseURL: 'http://localhost:5000/api',
    socketURL: 'http://localhost:5000'
  },
  production: {
    baseURL: import.meta.env.VITE_API_URL || 'https://skillswapv2.onrender.com/api',
    socketURL: import.meta.env.VITE_SOCKET_URL || 'https://skillswapv2.onrender.com'
  }
};

const ENV = import.meta.env.MODE || 'development';
const config = API_CONFIG[ENV];

export const API_BASE_URL = config.baseURL;
export const SOCKET_URL = config.socketURL;

export default config;
