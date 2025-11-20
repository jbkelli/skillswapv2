// Service to keep backend alive on Render free tier
import { API_BASE_URL } from '../config/api';

class KeepaliveService {
  constructor() {
    this.interval = null;
    this.isRunning = false;
  }

  start() {
    if (this.isRunning) return;
    
    this.isRunning = true;
    
    // Ping immediately
    this.ping();
    
    // Then ping every 10 minutes (600000ms)
    this.interval = setInterval(() => {
      this.ping();
    }, 600000); // 10 minutes
    
    console.log('🔄 Keepalive service started - pinging backend every 10 minutes');
  }

  async ping() {
    try {
      const response = await fetch(`${API_BASE_URL.replace('/api', '')}/api/health`, {
        method: 'GET',
        headers: {
          'Cache-Control': 'no-cache'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log('✅ Backend keepalive ping successful', data);
      }
    } catch (error) {
      console.warn('⚠️ Backend keepalive ping failed:', error.message);
    }
  }

  stop() {
    if (this.interval) {
      clearInterval(this.interval);
      this.interval = null;
      this.isRunning = false;
      console.log('🛑 Keepalive service stopped');
    }
  }
}

export default new KeepaliveService();
