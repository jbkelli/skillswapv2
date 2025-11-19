import React, { useState, useEffect } from 'react';

export default function NotificationPermission() {
  const [showPrompt, setShowPrompt] = useState(false);

  useEffect(() => {
    // Check if we should show the prompt
    if ('Notification' in window && Notification.permission === 'default') {
      // Show after 3 seconds to not be intrusive
      const timer = setTimeout(() => {
        setShowPrompt(true);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleRequestPermission = async () => {
    if ('Notification' in window) {
      const permission = await Notification.requestPermission();
      setShowPrompt(false);
      
      if (permission === 'granted') {
        // Show a test notification
        new Notification('SkillSwap Notifications Enabled! 🎉', {
          body: 'You\'ll now receive notifications for new messages',
          icon: '/logo.png',
          badge: '/logo.png'
        });
      }
    }
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    // Don't ask again for this session
    sessionStorage.setItem('notificationPromptDismissed', 'true');
  };

  // Don't show if already dismissed in this session
  if (sessionStorage.getItem('notificationPromptDismissed')) {
    return null;
  }

  if (!showPrompt) return null;

  return (
    <div className="fixed top-20 left-1/2 transform -translate-x-1/2 z-50 max-w-md w-full mx-4">
      <div className="bg-linear-to-r from-indigo-600 to-purple-600 rounded-lg shadow-2xl p-6 text-white animate-slideDown">
        <div className="flex items-start gap-4">
          <div className="shrink-0">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-bold mb-1">Enable Desktop Notifications</h3>
            <p className="text-sm opacity-90 mb-4">
              Get instant notifications for new messages, even when SkillSwap is in the background!
            </p>
            <div className="flex gap-3">
              <button
                onClick={handleRequestPermission}
                className="flex-1 bg-white text-indigo-600 px-4 py-2 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
              >
                Enable
              </button>
              <button
                onClick={handleDismiss}
                className="px-4 py-2 rounded-lg font-semibold hover:bg-white/10 transition-colors"
              >
                Not Now
              </button>
            </div>
          </div>
          <button
            onClick={handleDismiss}
            className="shrink-0 text-white/60 hover:text-white transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
