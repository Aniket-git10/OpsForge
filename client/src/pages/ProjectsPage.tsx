import React, { useState } from 'react';
import { NavLink, useSearchParams } from 'react-router-dom';
import {
  FolderKanban,
  Plus,
  Search,
  Filter,
  Calendar,
  Users,
  CheckCircle2,
  Clock,
  Sparkles,
  ArrowRight,
} from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../services/api';
import { Project, ProjectStatus, ProjectPriority } from '../types/index';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Modal } from '../components/ui/Modal';
import { Input } from '../components/ui/Input';
import { Skeleton } from '../components/ui/Skeleton';
import { useToast } from '../context/ToastContext';
import { useAuth } from '../context/AuthContext';

export const ProjectsPage: React.FC = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { success, error: showError } = useToast();
  const [searchParams, setSearchParams] = useSearchParams();

  const search = searchParams.get('search') || '';
  const statusFilter = searchParams.get('status') || '';
  const priorityFilter = searchParams.get('priority') || '';

  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [name, setName] = useState('');
  const [key, setKey] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<ProjectPriority>('medium');
  const [deadline, setDeadline] = useState('');

  // Fetch Projects with Filters
  const { data: projects = [], isLoading } = useQuery<Project[]>({
    queryKey: ['projects', { search, status: statusFilter, priority: priorityFilter }],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (statusFilter) params.append('status', statusFilter);
      if (priorityFilter) params.append('priority', priorityFilter);

      const res = await api.get(`/projects?${params.toString()}`);
      return res.data.data;
    },
  });

  // Create Project Mutation
  const createProjectMutation = useMutation({
    mutationFn: async (payload: any) => {
      const res = await api.post('/projects', payload);
      return res.data.data;
    },
    onSuccess: (newProj) => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      queryClient.invalidateQueries({ queryKey: ['analytics'] });
      success(`Project ${newProj.key} created!`);
      setCreateModalOpen(false);
      setName('');
      setKey('');
      setDescription('');
      setPriority('medium');
      setDeadline('');
    },
    onError: (err: any) => {
      showError(err.response?.data?.message || 'Failed to create project');
    },
  });

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !key.trim()) return;

    createProjectMutation.mutate({
      name: name.trim(),
      key: key.trim().toUpperCase(),
      description: description.trim(),
      priority,
      deadline: deadline || undefined,
    });
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setName(val);
    // Auto-generate key acronym if not already typed
    if (!key || key.length <= 4) {
      const autoKey = val
        .split(' ')
        .map((w) => w[0])
        .join('')
        .toUpperCase()
        .slice(0, 4);
      if (autoKey.length >= 2) {
        setKey(autoKey);
      }
    }
  };

  const canCreate = user?.role === 'admin' || user?.role === 'project_manager';

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Projects
          </h1>
          <p className="mt-1 text-sm text-slate-400">
            Manage your engineering initiatives, roadmaps, and delivery milestones.
          </p>
        </div>

        {canCreate && (
          <Button
            onClick={() => setCreateModalOpen(true)}
            leftIcon={<Plus className="w-4 h-4" />}
          >
            New Project
          </Button>
        )}
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-xl border border-slate-800 bg-slate-900/60">
        <div className="relative flex-1 min-w-[200px] max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Filter projects by name or key..."
            value={search}
            onChange={(e) => {
              const val = e.target.value;
              setSearchParams((prev) => {
                if (val) prev.set('search', val);
                else prev.delete('search');
                return prev;
              });
            }}
            className="w-full rounded-lg bg-slate-950 border border-slate-800 py-1.5 pl-9 pr-3 text-xs text-slate-200 placeholder-slate-500 focus:border-brand-500 focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-2">
          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => {
              const val = e.target.value;
              setSearchParams((prev) => {
                if (val) prev.set('status', val);
                else prev.delete('status');
                return prev;
              });
            }}
            className="rounded-lg bg-slate-950 border border-slate-800 px-3 py-1.5 text-xs text-slate-300 focus:border-brand-500 focus:outline-none capitalize"
          >
            <option value="">All Statuses</option>
            <option value="active">Active</option>
            <option value="planning">Planning</option>
            <option value="on_hold">On Hold</option>
            <option value="completed">Completed</option>
          </select>

          {/* Priority Filter */}
          <select
            value={priorityFilter}
            onChange={(e) => {
              const val = e.target.value;
              setSearchParams((prev) => {
                if (val) prev.set('priority', val);
                else prev.delete('priority');
                return prev;
              });
            }}
            className="rounded-lg bg-slate-950 border border-slate-800 px-3 py-1.5 text-xs text-slate-300 focus:border-brand-500 focus:outline-none capitalize"
          >
            <option value="">All Priorities</option>
            <option value="critical">Critical</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
        </div>
      </div>

      {/* Projects Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          <Skeleton className="h-48 rounded-xl" />
          <Skeleton className="h-48 rounded-xl" />
          <Skeleton className="h-48 rounded-xl" />
        </div>
      ) : projects.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-800 bg-slate-900/30 p-12 text-center">
          <FolderKanban className="mx-auto h-12 w-12 text-slate-600 mb-3" />
          <h3 className="text-base font-bold text-white">No projects found</h3>
          <p className="mt-1 text-xs text-slate-400">
            {search || statusFilter
              ? 'Try adjusting your search criteria or filters.'
              : 'Create your first project to start organizing tasks.'}
          </p>
          {canCreate && !search && (
            <Button
              className="mt-4"
              size="sm"
              onClick={() => setCreateModalOpen(true)}
              leftIcon={<Plus className="w-4 h-4" />}
            >
              Create Project
            </Button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {projects.map((project) => (
            <NavLink key={project._id} to={`/app/projects/${project._id}`}>
              <Card hoverEffect className="h-full flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="font-mono text-xs font-bold text-brand-400">
                      {project.key}
                    </span>
                    <Badge status={project.status} size="sm" />
                  </div>
                  <h3 className="font-bold text-white text-base">{project.name}</h3>
                  <p className="text-xs text-slate-400 line-clamp-2 mt-1">
                    {project.description || 'No description provided.'}
                  </p>
                </div>

                <div className="mt-5 pt-3 border-t border-slate-800">
                  <div className="flex items-center justify-between text-xs mb-1.5">
                    <span className="text-slate-400">Completion</span>
                    <span className="font-bold text-white font-mono">
                      {project.stats?.progress || 0}%
                    </span>
                  </div>
                  <div className="h-1.5 w-full rounded-full bg-slate-800 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-brand-500 transition-all duration-300"
                      style={{ width: `${project.stats?.progress || 0}%` }}
                    />
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-slate-500 mt-3">
                    <div className="flex items-center gap-1.5">
                      <Users className="w-3.5 h-3.5" />
                      <span>{project.members?.length || 1} members</span>
                    </div>

                    {project.deadline && (
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5" />
                        <span>
                          {new Date(project.deadline).toLocaleDateString(undefined, {
                            month: 'short',
                            day: 'numeric',
                          })}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </Card>
            </NavLink>
          ))}
        </div>
      )}

      {/* Create Project Modal */}
      <Modal
        isOpen={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        title="Create New Project"
        description="Initialize a repository workspace and set up your team's sprint board."
        maxWidth="md"
      >
        <form onSubmit={handleCreateSubmit} className="space-y-4">
          <Input
            label="Project Name *"
            placeholder="e.g. Core API Infrastructure"
            value={name}
            onChange={handleNameChange}
            required
            autoFocus
          />

          <Input
            label="Project Key (2-6 uppercase letters) *"
            placeholder="CORE"
            value={key}
            onChange={(e) => setKey(e.target.value.toUpperCase())}
            required
            maxLength={6}
            helperText="Used as prefix for tasks (e.g. CORE-1, CORE-2)"
          />

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Description
            </label>
            <textarea
              rows={3}
              placeholder="What are the goals and scope of this project?"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full rounded-lg bg-slate-900 border border-slate-700/80 px-3 py-2 text-sm text-slate-100 placeholder-slate-500 focus:border-brand-500 focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Priority
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as ProjectPriority)}
                className="w-full rounded-lg bg-slate-900 border border-slate-700/80 px-3 py-2 text-sm text-slate-100 focus:border-brand-500 focus:outline-none capitalize"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="critical">Critical</option>
              </select>
            </div>

            <div>
              <Input
                label="Target Deadline"
                type="date"
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
            <Button
              type="button"
              variant="outline"
              onClick={() => setCreateModalOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" isLoading={createProjectMutation.isPending}>
              Create Project
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
