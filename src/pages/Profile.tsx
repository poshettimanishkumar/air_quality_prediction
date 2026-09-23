import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { User, Mail, Key, Shield, LogOut, Check, Save } from 'lucide-react';

interface ProfileProps {
  setCurrentTab: (tab: string) => void;
}

export const Profile: React.FC<ProfileProps> = ({ setCurrentTab }) => {
  const { user, signOut, updateUserDisplayName } = useAuth();
  const [editingName, setEditingName] = useState(false);
  const [displayName, setDisplayName] = useState(user?.displayName || '');
  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleUpdateName = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await updateUserDisplayName(displayName);
      setEditingName(false);
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    } catch (err) {
      console.error('Failed to update name', err);
    } finally {
      setSaving(false);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    setCurrentTab('home');
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-slate-50 py-16 px-4 text-center">
        <div className="max-w-md mx-auto bg-white p-8 rounded-2xl border border-slate-200 shadow-sm">
          <p className="text-slate-600 mb-4">You are not currently signed in.</p>
          <button
            onClick={() => setCurrentTab('signin')}
            className="px-4 py-2.5 bg-emerald-600 text-white rounded-xl text-sm font-semibold hover:bg-emerald-700"
          >
            Sign In
          </button>
        </div>
      </div>
    );
  }

  return (
    <div id="profile-page" className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto space-y-8">
        {/* Header */}
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 text-xs font-semibold uppercase tracking-wider mb-2">
            <User className="w-3.5 h-3.5 text-emerald-600" />
            <span>Account Profile</span>
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">User Account</h1>
          <p className="mt-1 text-sm text-slate-600">
            Manage your credentials and view Firebase Authentication session status.
          </p>
        </div>

        {/* Profile Card */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-emerald-600 text-white font-bold text-2xl flex items-center justify-center shadow-sm">
              {user.displayName ? user.displayName.charAt(0).toUpperCase() : user.email?.charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0">
              <h2 className="text-xl font-bold text-slate-900 truncate">
                {user.displayName || 'Air Quality Researcher'}
              </h2>
              <p className="text-sm text-slate-700 truncate">{user.email}</p>
            </div>
          </div>

          {savedSuccess && (
            <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-center gap-2">
              <Check className="w-4 h-4 text-emerald-600" />
              <span>Profile display name updated successfully.</span>
            </div>
          )}

          {/* Edit Display Name */}
          <div className="pt-4 border-t border-slate-100">
            {editingName ? (
              <form onSubmit={handleUpdateName} className="space-y-3">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                  Update Display Name
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={displayName}
                    onChange={e => setDisplayName(e.target.value)}
                    className="flex-1 px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    placeholder="Enter full name"
                  />
                  <button
                    type="submit"
                    disabled={saving}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1"
                  >
                    <Save className="w-3.5 h-3.5" />
                    <span>{saving ? 'Saving...' : 'Save'}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditingName(false)}
                    className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            ) : (
              <div className="flex items-center justify-between">
                <div>
                  <span className="block text-xs font-bold uppercase tracking-wider text-slate-700">Display Name</span>
                  <span className="text-sm font-semibold text-slate-900">{user.displayName || 'Not specified'}</span>
                </div>
                <button
                  onClick={() => {
                    setDisplayName(user.displayName || '');
                    setEditingName(true);
                  }}
                  className="text-xs text-emerald-700 hover:text-emerald-800 font-semibold"
                >
                  Edit Name
                </button>
              </div>
            )}
          </div>

          {/* Account Metadata Grid */}
          <div className="pt-4 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
              <span className="text-slate-700 block font-semibold mb-1">Firebase Unique ID (UID)</span>
              <span className="font-mono text-[11px] text-slate-800 break-all">{user.uid}</span>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
              <span className="text-slate-700 block font-semibold mb-1">Email Verification</span>
              <span className="text-slate-900 font-medium">
                {user.emailVerified ? 'Verified' : 'Standard Session'}
              </span>
            </div>
          </div>

          {/* Security & Password policy notice */}
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600 flex items-start gap-2.5">
            <Shield className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
            <div>
              <strong className="font-semibold text-slate-800">Security Architecture:</strong> Passwords are never stored in Cloud Firestore documents or plain client state. Firebase Authentication handles encryption, session tokens, and identity management.
            </div>
          </div>

          {/* Sign Out */}
          <div className="pt-4 border-t border-slate-100 flex justify-between items-center">
            <button
              onClick={() => setCurrentTab('dashboard')}
              className="text-xs text-slate-700 hover:text-slate-900 font-medium"
            >
              ← Back to Dashboard
            </button>

            <button
              id="profile-signout-btn"
              onClick={handleSignOut}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-red-50 text-red-700 hover:bg-red-100 text-xs font-semibold transition-colors"
            >
              <LogOut className="w-4 h-4" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
