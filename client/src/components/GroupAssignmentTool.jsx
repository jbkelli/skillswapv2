import React, { useState } from 'react';
import api from '../services/api';
import { useNotification } from '../context/NotificationContext';

export default function GroupAssignmentTool() {
  const { showNotification } = useNotification();
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState(null);

  const handleAssignAllUsers = async () => {
    if (!confirm('This will assign all existing users to groups based on their skills. Continue?')) {
      return;
    }

    setLoading(true);
    try {
      const response = await api.post('/groups/assign-all-users');
      setStats(response.data.stats);
      showNotification('All users assigned to groups successfully!', 'success');
    } catch (err) {
      console.error('Error assigning users:', err);
      showNotification('Failed to assign users to groups', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gray-800 border border-gray-700 rounded-lg p-6 max-w-md">
      <h3 className="text-xl font-bold mb-2">Group Assignment Tool</h3>
      <p className="text-sm text-gray-400 mb-4">
        Assign all existing users to groups based on their skills
      </p>
      
      <button
        onClick={handleAssignAllUsers}
        disabled={loading}
        className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-500 transition-colors font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? 'Assigning...' : 'Assign All Users to Groups'}
      </button>

      {stats && (
        <div className="mt-4 p-4 bg-gray-900 rounded-lg">
          <h4 className="font-semibold mb-2">Assignment Results:</h4>
          <div className="space-y-1 text-sm">
            <p>Total Users: <span className="text-blue-400">{stats.totalUsers}</span></p>
            <p>Assigned: <span className="text-green-400">{stats.assigned}</span></p>
            <p>Skipped (already in groups): <span className="text-yellow-400">{stats.skipped}</span></p>
            <p>Assigned to default group: <span className="text-purple-400">{stats.assignedToDefault}</span></p>
          </div>
        </div>
      )}

      <div className="mt-4 p-3 bg-blue-900/30 border border-blue-700 rounded text-xs text-blue-300">
        <p className="font-semibold mb-1">ℹ️ How it works:</p>
        <ul className="list-disc list-inside space-y-1">
          <li>Users with skills are assigned to matching groups</li>
          <li>Users without skills go to "Quality & Collaboration"</li>
          <li>Users already in groups are skipped</li>
        </ul>
      </div>
    </div>
  );
}
