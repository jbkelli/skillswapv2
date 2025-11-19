import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

export default function ChatNotification({ message, onClose }) {
  const navigate = useNavigate();
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    // Play notification sound
    playNotificationSound();

    // Auto-dismiss after 5 seconds
    const timer = setTimeout(() => {
      handleClose();
    }, 5000);

    return () => clearTimeout(timer);
  }, []);

  const playNotificationSound = () => {
    // Create audio context for notification chime
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    
    // Create a pleasant notification chime
    const createChime = (frequency, startTime, duration) => {
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.frequency.value = frequency;
      oscillator.type = 'sine';
      
      gainNode.gain.setValueAtTime(0.3, startTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, startTime + duration);
      
      oscillator.start(startTime);
      oscillator.stop(startTime + duration);
    };

    // Play a pleasant two-tone chime
    const now = audioContext.currentTime;
    createChime(800, now, 0.15);        // First note (higher)
    createChime(600, now + 0.15, 0.2);  // Second note (lower)
  };

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(() => {
      onClose();
    }, 300); // Wait for animation
  };

  const handleClick = () => {
    navigate(`/chat/${message.senderId}`);
    handleClose();
  };

  if (!isVisible) return null;

  return (
    <div 
      className={`fixed top-20 left-4 z-50 transition-all duration-300 ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'
      }`}
    >
      <div 
        className="bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg shadow-2xl p-4 max-w-sm cursor-pointer hover:shadow-3xl transform hover:scale-105 transition-all"
        onClick={handleClick}
      >
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0">
            <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center text-lg font-bold">
              {message.senderName?.[0] || '💬'}
            </div>
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-2 mb-1">
              <p className="font-semibold text-sm truncate">
                {message.senderName || 'New Message'}
              </p>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleClose();
                }}
                className="text-white/80 hover:text-white text-xl leading-none"
              >
                ×
              </button>
            </div>
            <p className="text-sm text-white/90 line-clamp-2">
              {message.text}
            </p>
            <p className="text-xs text-white/70 mt-1">
              Click to view conversation
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
