// Environment-aware logger
// In production, only logs errors to keep logs clean and avoid exposing sensitive info
const isDev = process.env.NODE_ENV !== 'production';

const logger = {
  // Regular logs - only in development
  log: (...args) => {
    if (isDev) console.log(...args);
  },
  
  // Info logs - only in development
  info: (...args) => {
    if (isDev) console.info(...args);
  },
  
  // Warning logs - only in development
  warn: (...args) => {
    if (isDev) console.warn(...args);
  },
  
  // Error logs - always show (critical for debugging production issues)
  error: (...args) => {
    console.error(...args);
  },
  
  // Debug logs - only in development
  debug: (...args) => {
    if (isDev) console.debug(...args);
  }
};

module.exports = logger;
