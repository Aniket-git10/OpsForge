import React, { useState, useEffect } from 'react';
import { useParams, NavLink, useSearchParams } from 'react-router-dom';
import {
  Kanban as KanbanIcon,
  ListTodo,
  FileText,
  Activity as ActivityIcon,
  Plus,
  Sparkles,
  Users,
  Calendar,
  AlertCircle,
  Clock,
  Filter,
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { api } from '../services/api';
import { Project, Task, TaskStatus } from '../types/index';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Skeleton } from '../components/ui/Skeleton';
import { KanbanBoard } from '../components/kanban/KanbanBoard';
import { CreateTaskModal } from '../components/tasks/CreateTaskModal';
import { TaskDetailModal } from '../components/tasks/TaskDetailModal';
import { useSocket } from '../context/SocketContext';

type ProjectTab = 'kanban' | 'list' | 'overview' | 'activity';

export const ProjectDetailPage: React.FC = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const [searchParams, setSearchParams] = useSearchParams();
  const { joinProject, leaveProject } = useSocket();

  const [activeTab, setActiveTab] = useState<ProjectTab>('kanban');
  const [createTaskModalOpen, setCreateTaskModalOpen] = useState(false);
  const [defaultTaskStatus, setDefaultTaskStatus] = useState<TaskStatus>('todo');
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);

  // Subscribe to Project WebSocket Room
  useEffect(() => {
    if (projectId) {
      joinProject(projectId);
      return () => {
        leaveProject(projectId);
      };
    }
  }, [projectId, joinProject, leaveProject]);

  // Fetch Project Details
  const { data: project, isLoading: projectLoading } = useQuery<Project>({
    queryKey: ['project', projectId],
    queryFn: async () => {
      const res = await api.get(`/projects/${projectId}`);
      return res.data.data;
    },
    enabled: Boolean(projectId),
  });

  // Fetch Tasks for Project
  const { data: tasks = [], isLoading: tasksLoading } = useQuery<Task[]>({
    queryKey: ['tasks', projectId],
    queryFn: async () => {
      const res = await api.get(`/tasks/project/${projectId}`);
      return res.data.data;
    },
    enabled: Boolean(projectId),
  });

  // Fetch Project Activities
  const { data: activities = [] } = useQuery({
    queryKey: ['activity', projectId],
    queryFn: async () => {
      const res = await api.get(`/activity/project/${projectId}`);
      return res.data.data;
    },
    enabled: Boolean(projectId && activeTab === 'activity'),
  });

  // If taskId is in searchParams, select it
  useEffect(() => {
    const taskIdParam = searchParams.get('taskId');
    if (taskIdParam && tasks.length > 0) {
      const match = tasks.find((t) => t._id === taskIdParam);
      if (match) setSelectedTask(match);
    }
  }, [searchParams, tasks]);

  const handleOpenCreateTask = (status: TaskStatus = 'todo') => {
    setDefaultTaskStatus(status);
    setCreateTaskModalOpen(true);
  };

  const handleCardClick = (task: Task) => {
    setSelectedTask(task);
    setSearchParams((prev) => {
      prev.set('taskId', task._id);
      return prev;
    });
  };

  const handleCloseDetailModal = () => {
    setSelectedTask(null);
    setSearchParams((prev) => {
      prev.delete('taskId');
      return prev;
    });
  };

  if (projectLoading) {
    return (
      <div className="space-y-6 max-w-7xl mx-auto">
        <Skeleton className="h-20 rounded-2xl" />
        <Skeleton className="h-96 rounded-2xl" />
      </div>
    );
  }

  if (!project) {
    return (
      <div className="rounded-2xl border border-slate-800 p-12 text-center text-slate-400">
        Project not found.
      </div>
    );
  }

  return (
    <div className="space-y-5 max-w-7xl mx-auto">
      {/* Project Top Bar */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-4 border-b border-slate-800/80">
        <div>
          <div className="flex items-center gap-2.5 mb-1">
            <span className="font-mono text-xs font-bold text-brand-400 bg-brand-950/80 px-2 py-0.5 rounded border border-brand-800/60">
              {project.key}
            </span>
            <Badge status={project.status} size="sm" />
            <Badge priority={project.priority} size="sm" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            {project.name}
          </h1>
          {project.description && (
            <p className="mt-1 text-xs sm:text-sm text-slate-400 max-w-3xl leading-relaxed">
              {project.description}
            </p>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <NavLink to={`/app/ai-assistant?projectId=${project._id}`}>
            <Button
              variant="outline"
              size="sm"
              leftIcon={<Sparkles className="w-4 h-4 text-brand-400" />}
              className="border-brand-500/40 text-brand-300 hover:bg-brand-500/10"
            >
              AI Planner
            </Button>
          </NavLink>
          <Button
            size="sm"
            onClick={() => handleOpenCreateTask('todo')}
            leftIcon={<Plus className="w-4 h-4" />}
          >
            Add Task
          </Button>
        </div>
      </div>

      {/* Tabs Switcher */}
      <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
        <div className="flex items-center gap-1 sm:gap-2">
          <button
            onClick={() => setActiveTab('kanban')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'kanban'
                ? 'bg-slate-800 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            <KanbanIcon className="w-3.5 h-3.5" />
            <span>Kanban Board</span>
          </button>

          <button
            onClick={() => setActiveTab('list')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'list'
                ? 'bg-slate-800 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            <ListTodo className="w-3.5 h-3.5" />
            <span>Tasks Table</span>
          </button>

          <button
            onClick={() => setActiveTab('overview')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'overview'
                ? 'bg-slate-800 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Overview & Velocity</span>
          </button>

          <button
            onClick={() => setActiveTab('activity')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'activity'
                ? 'bg-slate-800 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            <ActivityIcon className="w-3.5 h-3.5" />
            <span>Activity Trail</span>
          </button>
        </div>

        {/* Sprint Summary Pill */}
        <div className="hidden sm:flex items-center gap-3 text-xs text-slate-400">
          <span>{tasks.length} tasks</span>
          <span className="font-mono text-emerald-400 font-semibold">
            {project.stats?.progress || 0}% done
          </span>
        </div>
      </div>

      {/* Tab 1: Live Kanban Board */}
      {activeTab === 'kanban' && (
        <div className="pt-2">
          {tasksLoading ? (
            <div className="flex gap-4">
              <Skeleton className="w-80 h-96 rounded-2xl" />
              <Skeleton className="w-80 h-96 rounded-2xl" />
              <Skeleton className="w-80 h-96 rounded-2xl" />
            </div>
          ) : (
            <KanbanBoard
              projectId={project._id}
              tasks={tasks}
              onTaskClick={handleCardClick}
              onAddTask={handleOpenCreateTask}
            />
          )}
        </div>
      )}

      {/* Tab 2: Tasks Table List View */}
      {activeTab === 'list' && (
        <div className="rounded-xl border border-slate-800 bg-slate-900/60 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950 text-slate-400 font-semibold border-b border-slate-800 uppercase tracking-wider">
                <tr>
                  <th className="px-4 py-3">Key</th>
                  <th className="px-4 py-3">Task Title</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Priority</th>
                  <th className="px-4 py-3">Assignee</th>
                  <th className="px-4 py-3">Due Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {tasks.map((task) => (
                  <tr
                    key={task._id}
                    onClick={() => handleCardClick(task)}
                    className="hover:bg-slate-800/40 cursor-pointer transition-colors"
                  >
                    <td className="px-4 py-3 font-mono font-bold text-brand-400">{task.key}</td>
                    <td className="px-4 py-3 font-medium text-slate-200">{task.title}</td>
                    <td className="px-4 py-3">
                      <Badge status={task.status} size="sm" />
                    </td>
                    <td className="px-4 py-3">
                      <Badge priority={task.priority} size="sm" />
                    </td>
                    <td className="px-4 py-3 text-slate-300">
                      {task.assignee?.name || <span className="text-slate-500">Unassigned</span>}
                    </td>
                    <td className="px-4 py-3 text-slate-400">
                      {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 3: Project Overview & Stats */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4">
              <span className="text-xs text-slate-400 font-semibold uppercase">Total Tasks</span>
              <div className="text-2xl font-bold text-white mt-1">{tasks.length}</div>
            </div>
            <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4">
              <span className="text-xs text-slate-400 font-semibold uppercase">Completed</span>
              <div className="text-2xl font-bold text-emerald-400 mt-1">
                {tasks.filter((t) => t.status === 'done').length}
              </div>
            </div>
            <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4">
              <span className="text-xs text-slate-400 font-semibold uppercase">Overdue</span>
              <div className="text-2xl font-bold text-rose-400 mt-1">
                {
                  tasks.filter(
                    (t) => t.status !== 'done' && t.dueDate && new Date(t.dueDate) < new Date()
                  ).length
                }
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-6">
            <h3 className="text-base font-bold text-white mb-3">Project Roster & Members</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {project.members?.map((m: any) => (
                <div
                  key={m.user?._id || m._id}
                  className="flex items-center gap-3 p-3 rounded-xl bg-slate-950/60 border border-slate-800"
                >
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-800 text-xs font-bold text-slate-200 border border-slate-700">
                    {m.user?.name?.[0]?.toUpperCase() || 'U'}
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-white">{m.user?.name}</div>
                    <div className="text-[11px] text-slate-400 capitalize">{m.role}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tab 4: Project Activity Trail */}
      {activeTab === 'activity' && (
        <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-6">
          <h3 className="text-base font-bold text-white mb-4">Project Audit History</h3>
          <div className="space-y-4 divide-y divide-slate-800/60">
            {activities.length === 0 ? (
              <div className="text-xs text-slate-400 py-6 text-center">
                No activity logged for this project yet.
              </div>
            ) : (
              activities.map((act: any) => (
                <div key={act._id} className="pt-3 first:pt-0 text-xs">
                  <div className="flex items-center justify-between text-slate-300">
                    <span className="font-semibold text-white">{act.user?.name}</span>
                    <span className="text-[10px] text-slate-500">
                      {new Date(act.createdAt).toLocaleString()}
                    </span>
                  </div>
                  <p className="text-slate-400 mt-1">{act.details?.summary}</p>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Modals */}
      <CreateTaskModal
        isOpen={createTaskModalOpen}
        onClose={() => setCreateTaskModalOpen(false)}
        projectId={project._id}
        defaultStatus={defaultTaskStatus}
        members={project.members || []}
      />

      <TaskDetailModal
        isOpen={Boolean(selectedTask)}
        onClose={handleCloseDetailModal}
        task={selectedTask}
        members={project.members || []}
      />
    </div>
  );
};
