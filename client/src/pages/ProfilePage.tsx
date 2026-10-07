import React, { useState } from 'react';
import { User, Shield, Mail, Building, Save } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { useToast } from '../context/ToastContext';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Input } from '../components/ui/Input';

export const ProfilePage: React.FC = () => {
  const { user, updateUser } = useAuth();
  const { success, error: showError } = useToast();

  const [name, setName] = useState(user?.name || '');
  const [bio, setBio] = useState(user?.bio || '');
  const [avatar, setAvatar] = useState(user?.avatar || '');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    try {
      setLoading(true);
      const res = await api.put('/auth/profile', {
        name: name.trim(),
        bio: bio.trim(),
        avatar: avatar.trim(),
      });
      updateUser(res.data.data);
      success('Profile updated successfully');
    } catch (err: any) {
      showError(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
          User Profile
        </h1>
        <p className="mt-1 text-sm text-slate-400">
          Manage your personal details, avatar, and system role.
        </p>
      </div>

      <Card className="p-6">
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Avatar Preview */}
          <div className="flex items-center gap-4 pb-4 border-b border-slate-800">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-slate-800 text-lg font-bold text-slate-200 border-2 border-brand-500 overflow-hidden">
              {avatar ? (
                <img src={avatar} alt={name} className="h-full w-full object-cover" />
              ) : (
                name?.[0]?.toUpperCase() || 'U'
              )}
            </div>
            <div>
              <h3 className="text-base font-bold text-white">{user?.name}</h3>
              <p className="text-xs text-slate-400">{user?.email}</p>
              <div className="mt-1 flex items-center gap-2">
                <span className="rounded bg-brand-950 text-brand-300 text-[10px] font-mono px-2 py-0.5 border border-brand-800 uppercase font-semibold">
                  {user?.role?.replace('_', ' ')}
                </span>
                <span className="text-xs text-slate-500">• {user?.organization?.name}</span>
              </div>
            </div>
          </div>

          <Input
            label="Full Name *"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />

          <Input
            label="Avatar Image URL"
            placeholder="https://images.unsplash.com/..."
            value={avatar}
            onChange={(e) => setAvatar(e.target.value)}
            helperText="Provide a direct URL to a profile avatar"
          />

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Bio / Title
            </label>
            <textarea
              rows={3}
              placeholder="e.g. Staff Full-Stack Engineer working on real-time data pipelines."
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              className="w-full rounded-lg bg-slate-900 border border-slate-700/80 px-3 py-2 text-sm text-slate-100 placeholder-slate-500 focus:border-brand-500 focus:outline-none"
            />
          </div>

          <div className="flex justify-end pt-2">
            <Button type="submit" isLoading={loading} leftIcon={<Save className="w-4 h-4" />}>
              Save Profile Changes
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};
