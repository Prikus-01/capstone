import React, { useState } from 'react';
import { useAuth } from '../features/auth/auth.store';
import { authApi } from '../features/auth/auth.api';
import Button from '../components/common/Button';
import { User, Gift } from 'lucide-react';

export default function ProfilePage() {
  const { user, updateUser } = useAuth();
  const [editing, setEditing] = useState(false);
  const [fullName, setFullName] = useState(user?.fullName || '');
  const [saved, setSaved] = useState(false);

  const handleSave = async () => {
    try {
      // In a real app, this would call PATCH /api/users/me
      updateUser({ ...user, fullName });
      setSaved(true);
      setEditing(false);
      setTimeout(() => setSaved(false), 2000);
    } catch {}
  };

  return (
    <div className="min-h-screen bg-[#1a1a1a] max-w-xl mx-auto px-4 sm:px-6 py-8">
      <h1 className="text-xl font-bold text-white mb-6">My Profile</h1>

      <div className="bg-[#242424] border border-[#3a3a3a] rounded-xl p-6 mb-4">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-14 h-14 bg-blue-600 rounded-full flex items-center justify-center text-2xl font-bold text-white">
            {(user?.fullName || 'U')[0].toUpperCase()}
          </div>
          <div>
            <p className="text-lg font-semibold text-white">{user?.fullName}</p>
            <p className="text-sm text-gray-400">{user?.email}</p>
          </div>
        </div>

        {editing ? (
          <div className="space-y-3">
            <div>
              <label className="text-xs text-gray-400 block mb-1">Full Name</label>
              <input
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full bg-[#1a1a1a] border border-[#3a3a3a] rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
              />
            </div>
            <div className="flex gap-2">
              <Button size="sm" onClick={handleSave}>Save</Button>
              <Button size="sm" variant="ghost" onClick={() => setEditing(false)}>Cancel</Button>
            </div>
          </div>
        ) : (
          <Button size="sm" variant="ghost" onClick={() => setEditing(true)}>Edit Profile</Button>
        )}

        {saved && <p className="text-green-400 text-xs mt-2">Profile updated!</p>}
      </div>

      {/* Gift points */}
      <div className="bg-[#242424] border border-[#3a3a3a] rounded-xl p-5">
        <div className="flex items-center gap-2 mb-1">
          <Gift size={16} className="text-yellow-400" />
          <h3 className="text-sm font-semibold text-white">Gift Points</h3>
        </div>
        <p className="text-3xl font-bold text-yellow-400">{user?.giftPoints || 0}</p>
        <p className="text-xs text-gray-500 mt-1">Use points during checkout. 10 pts = ₹1 (max 20% of order)</p>
      </div>
    </div>
  );
}
