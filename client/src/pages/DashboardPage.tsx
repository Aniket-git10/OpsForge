import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  FolderKanban,
  CheckCircle2,
  Clock,
  AlertCircle,
  Sparkles,
  ArrowRight,
  Plus,
  Users,
  Activity as ActivityIcon,
  Calendar,
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Skeleton } from '../components/ui/Skeleton';

export const DashboardPage: React.FC = () => {
  const { user } = useAuth();

  // Fetch Dashboard Analytics
  const { data: analytics, isLoading: analyticsLoading } = useQuery({
    queryKey: ['analytics', 'dashboard'],
    queryFn: async () => {
      const res = await api.get('/analytics/dashboard?timeRange=30d');
      return res.data.data;
    },
  });

  // Fetch Recent Activity
  const { data: activities = [], isLoading: activitiesLoading } = useQuery({
    queryKey: ['activity', 'org'],
    queryFn: async () => {
      const res = await api.get('/activity/organization');
      return res.data.data;
    },
  });

  // Fetch Active Projects
  const { data: projects = [], isLoading: projectsLoading } = useQuery({
    queryKey: ['projects'],
    queryFn: async () => {
      const res = await api.get('/projects');
      return res.data.data;
    },
  });

  // Fetch AI Insights
  const { data: aiInsightsData, isLoading: aiLoading } = useQuery({
    queryKey: ['ai', 'insights'],
    queryFn: async () => {
      const res = await api.post('/ai/insights', {});
      return res.data.data;
    },
  });

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  const summary = analytics?.summary || {
    totalProjects: 0,
    activeProjects: 0,
    totalTasks: 0,
    completedTasks: 0,
    overdueTasks: 0,
    completionRate: 0,
  };

  const insights = aiInsightsData?.insights || [];

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Welcome Banner & Quick Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            {getGreeting()}, {user?.name?.split(' ')[0] || 'Engineer'}
          </h1>
          <p className="mt-1 text-sm text-slate-400">
            Here's your engineering productivity cockpit for {user?.organization?.name || 'your workspace'}.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <NavLink to="/app/ai-assistant">
            <Button
              variant="outline"
              size="sm"
              leftIcon={<Sparkles className="w-4 h-4 text-brand-400" />}
              className="border-brand-500/40 text-brand-300 hover:bg-brand-500/10"
            >
              AI Sprint Planner
            </Button>
          </NavLink>
          <NavLink to="/app/projects">
            <Button size="sm" leftIcon={<Plus className="w-4 h-4" />}>
              Create Project
            </Button>
          </NavLink>
        </div>
      </div>

      {/* Primary KPI Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Active Projects
            </span>
            <div className="p-2 rounded-lg bg-brand-500/10 text-brand-400">
              <FolderKanban className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 text-3xl font-extrabold text-white">
            {analyticsLoading ? <Skeleton className="h-8 w-16" /> : summary.activeProjects}
          </div>
          <p className="mt-1 text-xs text-slate-400">
            {summary.totalProjects} total workspace projects
          </p>
        </Card>

        <Card className="p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Completed Tasks
            </span>
            <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 text-3xl font-extrabold text-emerald-400">
            {analyticsLoading ? <Skeleton className="h-8 w-16" /> : summary.completedTasks}
          </div>
          <p className="mt-1 text-xs text-slate-400">
            {summary.completionRate}% sprint completion rate
          </p>
        </Card>

        <Card className="p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Total Backlog
            </span>
            <div className="p-2 rounded-lg bg-sky-500/10 text-sky-400">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 text-3xl font-extrabold text-white">
            {analyticsLoading ? <Skeleton className="h-8 w-16" /> : summary.totalTasks}
          </div>
          <p className="mt-1 text-xs text-slate-400">Across active sprints</p>
        </Card>

        <Card className="p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Overdue Tasks
            </span>
            <div
              className={`p-2 rounded-lg ${
                summary.overdueTasks > 0
                  ? 'bg-rose-500/10 text-rose-400'
                  : 'bg-emerald-500/10 text-emerald-400'
              }`}
            >
              <AlertCircle className="w-4 h-4" />
            </div>
          </div>
          <div
            className={`mt-2 text-3xl font-extrabold ${
              summary.overdueTasks > 0 ? 'text-rose-400' : 'text-white'
            }`}
          >
            {analyticsLoading ? <Skeleton className="h-8 w-16" /> : summary.overdueTasks}
          </div>
          <p className="mt-1 text-xs text-slate-400">
            {summary.overdueTasks === 0 ? 'All milestones on schedule' : 'Require triage attention'}
          </p>
        </Card>
      </div>

      {/* AI Productivity Insights Banner */}
      {insights.length > 0 && (
        <div className="rounded-2xl border border-brand-500/30 bg-gradient-to-r from-brand-950/40 via-slate-900 to-slate-950 p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-brand-400" />
              <h3 className="text-sm font-bold text-white">
                Live AI Productivity Observations
              </h3>
            </div>
            <span className="text-[11px] font-mono text-brand-300 bg-brand-500/10 px-2 py-0.5 rounded border border-brand-500/20">
              {aiInsightsData?.engine || 'AI Engine'}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {insights.slice(0, 3).map((item: any, idx: number) => (
              <div
                key={idx}
                className="rounded-xl bg-slate-900/80 p-3.5 border border-slate-800 text-xs flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-semibold text-slate-200">{item.title}</span>
                    {item.metric && (
                      <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-brand-950 text-brand-300 font-bold border border-brand-800/40">
                        {item.metric}
                      </span>
                    )}
                  </div>
                  <p className="text-slate-400 leading-relaxed mt-1">{item.message}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Active Projects Grid & Recent Activity Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 Cols: Active Projects */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-white tracking-tight">Active Projects</h2>
            <NavLink
              to="/app/projects"
              className="text-xs font-semibold text-brand-400 hover:text-brand-300 inline-flex items-center gap-1"
            >
              View all <ArrowRight className="w-3.5 h-3.5" />
            </NavLink>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {projectsLoading ? (
              <>
                <Skeleton className="h-36 rounded-xl" />
                <Skeleton className="h-36 rounded-xl" />
              </>
            ) : projects.length === 0 ? (
              <div className="col-span-2 rounded-xl border border-dashed border-slate-800 p-8 text-center text-sm text-slate-400">
                No active projects found. Create your first project to get started!
              </div>
            ) : (
              projects.slice(0, 4).map((project: any) => (
                <NavLink key={project._id} to={`/app/projects/${project._id}`}>
                  <Card hoverEffect className="h-full flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <span className="font-mono text-xs font-bold text-brand-400">
                          {project.key}
                        </span>
                        <Badge status={project.status} size="sm" />
                      </div>
                      <h3 className="font-bold text-white text-base truncate">{project.name}</h3>
                      <p className="text-xs text-slate-400 line-clamp-2 mt-1">
                        {project.description || 'No description provided.'}
                      </p>
                    </div>

                    <div className="mt-4 pt-3 border-t border-slate-800/80">
                      <div className="flex items-center justify-between text-xs mb-1.5">
                        <span className="text-slate-400">Progress</span>
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
                      <div className="flex items-center justify-between text-[11px] text-slate-500 mt-2">
                        <span>{project.stats?.totalTasks || 0} tasks</span>
                        {project.deadline && (
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {new Date(project.deadline).toLocaleDateString(undefined, {
                              month: 'short',
                              day: 'numeric',
                            })}
                          </span>
                        )}
                      </div>
                    </div>
                  </Card>
                </NavLink>
              ))
            )}
          </div>
        </div>

        {/* Right 1 Col: Recent Audit Activity */}
        <div className="space-y-4">
          <h2 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
            <ActivityIcon className="w-4 h-4 text-brand-400" />
            Recent Team Activity
          </h2>

          <Card className="p-4">
            <div className="space-y-3.5 divide-y divide-slate-800/60 max-h-[380px] overflow-y-auto pr-1">
              {activitiesLoading ? (
                <>
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-10 w-full" />
                </>
              ) : activities.length === 0 ? (
                <div className="py-6 text-center text-xs text-slate-500">
                  No activity logged yet.
                </div>
              ) : (
                activities.slice(0, 10).map((act: any) => (
                  <div key={act._id} className="pt-3 first:pt-0 text-xs">
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-semibold text-slate-200 truncate">
                        {act.user?.name}
                      </span>
                      <span className="text-[10px] text-slate-500 flex-shrink-0">
                        {new Date(act.createdAt).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>
                    <p className="text-slate-400 mt-0.5 leading-snug">{act.details?.summary}</p>
                  </div>
                ))
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};
