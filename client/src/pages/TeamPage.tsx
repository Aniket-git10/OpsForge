import React, { useState } from 'react';
import {
  Users,
  UserPlus,
  Shield,
  Clock,
  MoreVertical,
  Trash2,
  Check,
} from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import { useToast } from '../context/ToastContext';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Modal } from '../components/ui/Modal';
import { Input } from '../components/ui/Input';
import { Skeleton } from '../components/ui/Skeleton';
import { UserRole } from '../types/index';

export const TeamPage: React.FC = () => {
  const { user } = useAuth();
  const { onlineUserIds } = useSocket();
  const queryClient = useQueryClient();
  const { success, error: showError } = useToast();

  const [addModalOpen, setAddModalOpen] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<UserRole>('developer');

  // Fetch Organization & Members
  const { data: organization, isLoading } = useQuery({
    queryKey: ['organization'],
    queryFn: async () => {
      const res = await api.get('/organization');
      return res.data.data;
    },
  });

  // Add Member Mutation
  const addMemberMutation = useMutation({
    mutationFn: async (payload: any) => {
      const res = await api.post('/organization/members', payload);
      return res.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['organization'] });
      success('Team member added successfully');
      setAddModalOpen(false);
      setName('');
      setEmail('');
      setRole('developer');
    },
    onError: (err: any) => {
      showError(err.response?.data?.message || 'Failed to add member');
    },
  });

  // Update Role Mutation
  const updateRoleMutation = useMutation({
    mutationFn: async ({ userId, newRole }: { userId: string; newRole: UserRole }) => {
      const res = await api.patch(`/organization/members/${userId}`, { role: newRole });
      return res.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['organization'] });
      success('Member role updated');
    },
    onError: (err: any) => {
      showError(err.response?.data?.message || 'Failed to update member role');
    },
  });

  // Remove Member Mutation
  const removeMemberMutation = useMutation({
    mutationFn: async (userId: string) => {
      await api.delete(`/organization/members/${userId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['organization'] });
      success('Member removed from workspace');
    },
    onError: (err: any) => {
      showError(err.response?.data?.message || 'Failed to remove member');
    },
  });

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) return;

    addMemberMutation.mutate({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      role,
    });
  };

  const isAdmin = user?.role === 'admin';
  const members = organization?.members || [];

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Team & Members
          </h1>
          <p className="mt-1 text-sm text-slate-400">
            Workspace roster, role-based authorization, and active presence.
          </p>
        </div>

        {isAdmin && (
          <Button
            onClick={() => setAddModalOpen(true)}
            leftIcon={<UserPlus className="w-4 h-4" />}
          >
            Add Team Member
          </Button>
        )}
      </div>

      {/* Role Guide Notice */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 p-4 rounded-xl bg-slate-900/40 border border-slate-800 text-xs">
        <div>
          <span className="font-bold text-brand-400">Admin</span>
          <p className="text-slate-400 mt-0.5">Manage organization, projects, invite members, assign roles</p>
        </div>
        <div>
          <span className="font-bold text-sky-400">Project Manager</span>
          <p className="text-slate-400 mt-0.5">Create/manage projects, assign tasks, review sprint analytics</p>
        </div>
        <div>
          <span className="font-bold text-emerald-400">Developer</span>
          <p className="text-slate-400 mt-0.5">Build assigned tasks, drag Kanban columns, comment, trigger AI</p>
        </div>
        <div>
          <span className="font-bold text-slate-300">Member</span>
          <p className="text-slate-400 mt-0.5">View permitted projects, update assigned tasks, receive alerts</p>
        </div>
      </div>

      {/* Members Table */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/60 overflow-hidden">
        {isLoading ? (
          <div className="p-6 space-y-4">
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950 text-slate-400 font-semibold border-b border-slate-800 uppercase tracking-wider">
                <tr>
                  <th className="px-5 py-3.5">User</th>
                  <th className="px-5 py-3.5">Role</th>
                  <th className="px-5 py-3.5">Presence</th>
                  <th className="px-5 py-3.5">Joined</th>
                  {isAdmin && <th className="px-5 py-3.5 text-right">Actions</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {members.map((m: any) => {
                  const memberUser = m.user;
                  const isOnline = onlineUserIds.includes(memberUser?._id);
                  const isOwner = organization?.owner?._id === memberUser?._id;

                  return (
                    <tr key={memberUser?._id || m._id} className="hover:bg-slate-800/30">
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-3">
                          <div className="relative">
                            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-800 text-xs font-bold text-slate-200 border border-slate-700">
                              {memberUser?.avatar ? (
                                <img
                                  src={memberUser.avatar}
                                  alt={memberUser.name}
                                  className="h-full w-full rounded-full object-cover"
                                />
                              ) : (
                                memberUser?.name?.[0]?.toUpperCase() || 'U'
                              )}
                            </div>
                            <span
                              className={`absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full border-2 border-slate-900 ${
                                isOnline ? 'bg-emerald-400' : 'bg-slate-600'
                              }`}
                            />
                          </div>
                          <div>
                            <div className="font-semibold text-white flex items-center gap-1.5">
                              <span>{memberUser?.name}</span>
                              {isOwner && (
                                <span className="text-[10px] text-amber-400 font-semibold font-mono">
                                  (Owner)
                                </span>
                              )}
                            </div>
                            <div className="text-slate-400 text-[11px]">{memberUser?.email}</div>
                          </div>
                        </div>
                      </td>

                      <td className="px-5 py-3.5">
                        {isAdmin && !isOwner ? (
                          <select
                            value={m.role}
                            onChange={(e) =>
                              updateRoleMutation.mutate({
                                userId: memberUser._id,
                                newRole: e.target.value as UserRole,
                              })
                            }
                            className="rounded-lg bg-slate-950 border border-slate-700 px-2.5 py-1 text-xs text-slate-200 capitalize focus:border-brand-500 focus:outline-none"
                          >
                            <option value="admin">Admin</option>
                            <option value="project_manager">Project Manager</option>
                            <option value="developer">Developer</option>
                            <option value="member">Member</option>
                          </select>
                        ) : (
                          <span className="font-semibold text-slate-300 capitalize">
                            {m.role?.replace('_', ' ')}
                          </span>
                        )}
                      </td>

                      <td className="px-5 py-3.5">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-medium ${
                            isOnline
                              ? 'bg-emerald-950/60 text-emerald-400 border border-emerald-800/60'
                              : 'bg-slate-800 text-slate-400'
                          }`}
                        >
                          <span
                            className={`h-1.5 w-1.5 rounded-full ${
                              isOnline ? 'bg-emerald-400 animate-pulse' : 'bg-slate-500'
                            }`}
                          />
                          {isOnline ? 'Active Now' : 'Offline'}
                        </span>
                      </td>

                      <td className="px-5 py-3.5 text-slate-400">
                        {new Date(m.joinedAt).toLocaleDateString()}
                      </td>

                      {isAdmin && (
                        <td className="px-5 py-3.5 text-right">
                          {!isOwner && memberUser?._id !== user?.id && (
                            <button
                              onClick={() => {
                                if (
                                  window.confirm(
                                    `Are you sure you want to remove ${memberUser?.name} from this workspace?`
                                  )
                                ) {
                                  removeMemberMutation.mutate(memberUser._id);
                                }
                              }}
                              className="text-slate-500 hover:text-rose-400 p-1 transition-colors"
                              title="Remove member"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </td>
                      )}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add Member Modal */}
      <Modal
        isOpen={addModalOpen}
        onClose={() => setAddModalOpen(false)}
        title="Invite / Add Team Member"
        description="Add a developer or manager to your workspace."
        maxWidth="md"
      >
        <form onSubmit={handleAddSubmit} className="space-y-4">
          <Input
            label="Full Name *"
            placeholder="e.g. Maya Patel"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            autoFocus
          />

          <Input
            label="Work Email *"
            type="email"
            placeholder="maya@company.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Assigned Role
            </label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value as UserRole)}
              className="w-full rounded-lg bg-slate-900 border border-slate-700/80 px-3 py-2 text-sm text-slate-100 focus:border-brand-500 focus:outline-none capitalize"
            >
              <option value="developer">Developer</option>
              <option value="project_manager">Project Manager</option>
              <option value="member">Member (Read-only)</option>
              <option value="admin">Admin</option>
            </select>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
            <Button type="button" variant="outline" onClick={() => setAddModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" isLoading={addMemberMutation.isPending}>
              Add to Workspace
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
