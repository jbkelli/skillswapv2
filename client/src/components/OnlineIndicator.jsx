import React from 'react';

export default function OnlineIndicator({ isOnline, size = 'md', showLabel = false, lastSeen = null }) {
  const sizeClasses = {
    sm: 'w-2 h-2',
    md: 'w-3 h-3',
    lg: 'w-4 h-4'
  };

  const formatLastSeen = (date) => {
    if (!date) return 'Offline';
    const now = new Date();
    const lastSeenDate = new Date(date);
    const diffInMs = now - lastSeenDate;
    const diffInMins = Math.floor(diffInMs / (1000 * 60));
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

    if (diffInMins < 1) return 'Just now';
    if (diffInMins < 60) return `${diffInMins}m ago`;
    if (diffInHours < 24) return `${diffInHours}h ago`;
    if (diffInDays < 7) return `${diffInDays}d ago`;
    return lastSeenDate.toLocaleDateString();
  };

  if (showLabel) {
    return (
      <div className="flex items-center gap-2">
        <div className={`${sizeClasses[size]} rounded-full ${isOnline ? 'bg-green-500' : 'bg-gray-500'}`}></div>
        <span className="text-xs text-gray-400">
          {isOnline ? 'Online' : formatLastSeen(lastSeen)}
        </span>
      </div>
    );
  }

  return (
    <div 
      className={`${sizeClasses[size]} rounded-full ${isOnline ? 'bg-green-500' : 'bg-gray-500'}`}
      title={isOnline ? 'Online' : `Last seen: ${formatLastSeen(lastSeen)}`}
    ></div>
  );
}
