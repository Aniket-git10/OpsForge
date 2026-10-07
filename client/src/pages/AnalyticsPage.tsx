import React, { useState } from 'react';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import {
  BarChart3,
  CheckCircle2,
  Clock,
  AlertCircle,
  TrendingUp,
  FolderKanban,
  Users,
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { api } from '../services/api';
import { Card } from '../components/ui/Card';
import { Skeleton } from '../components/ui/Skeleton';

const STATUS_COLORS: Record<string, string> = {
  done: '#10b981',
  in_progress: '#0284c7',
  in_review: '#f59e0b',
  todo: '#64748b',
  backlog: '#475569',
};

const PRIORITY_COLORS: Record<string, string> = {
  critical: '#f43f5e',
  high: '#f97316',
  medium: '#eab308',
  low: '#64748b',
};

export const AnalyticsPage: React.FC = () => {
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d'>('30d');

  const { data: analytics, isLoading } = useQuery({
    queryKey: ['analytics', 'dashboard', timeRange],
    queryFn: async () => {
      const res = await api.get(`/analytics/dashboard?timeRange=${timeRange}`);
      return res.data.data;
    },
  });

  const summary = analytics?.summary || {
    totalProjects: 0,
    activeProjects: 0,
    totalTasks: 0,
    completedTasks: 0,
    overdueTasks: 0,
    completionRate: 0,
  };

  const statusData = (analytics?.statusBreakdown || []).map((s: any) => ({
    name: s.status.replace('_', ' ').toUpperCase(),
    value: s.count,
    color: STATUS_COLORS[s.status] || '#6366f1',
  }));

  const priorityData = (analytics?.priorityBreakdown || []).map((p: any) => ({
    name: p.priority.toUpperCase(),
    count: p.count,
    color: PRIORITY_COLORS[p.priority] || '#6366f1',
  }));

  const workloadData = (analytics?.teamWorkload || []).map((w: any) => ({
    name: w.name.split(' ')[0],
    Completed: w.completed,
    InProgress: w.inProgress,
    Total: w.total,
  }));

  const completionTrend = (analytics?.completionTrend || []).map((t: any) => ({
    date: t.date,
    Completed: t.completed,
  }));

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Page Header & Filter Scope */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Productivity Analytics
          </h1>
          <p className="mt-1 text-sm text-slate-400">
            Sprint velocity, workload balancing, and cycle time metrics.
          </p>
        </div>

        {/* Time Scope Toggle */}
        <div className="flex items-center rounded-xl bg-slate-900 border border-slate-800 p-1">
          {(['7d', '30d', '90d'] as const).map((range) => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
                timeRange === range
                  ? 'bg-brand-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {range === '7d' ? 'Last 7 Days' : range === '30d' ? 'Last 30 Days' : 'Last 90 Days'}
            </button>
          ))}
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-5">
          <div className="text-xs text-slate-400 font-semibold uppercase">Total Initiatives</div>
          <div className="text-3xl font-extrabold text-white mt-1">
            {isLoading ? <Skeleton className="h-8 w-12" /> : summary.totalProjects}
          </div>
          <p className="text-xs text-slate-500 mt-1">{summary.activeProjects} actively in delivery</p>
        </Card>

        <Card className="p-5">
          <div className="text-xs text-slate-400 font-semibold uppercase">Sprint Completion</div>
          <div className="text-3xl font-extrabold text-emerald-400 mt-1">
            {isLoading ? <Skeleton className="h-8 w-12" /> : `${summary.completionRate}%`}
          </div>
          <p className="text-xs text-slate-500 mt-1">{summary.completedTasks} tasks closed</p>
        </Card>

        <Card className="p-5">
          <div className="text-xs text-slate-400 font-semibold uppercase">Total Tasks</div>
          <div className="text-3xl font-extrabold text-white mt-1">
            {isLoading ? <Skeleton className="h-8 w-12" /> : summary.totalTasks}
          </div>
          <p className="text-xs text-slate-500 mt-1">Across workspace backlogs</p>
        </Card>

        <Card className="p-5">
          <div className="text-xs text-slate-400 font-semibold uppercase">Overdue Items</div>
          <div
            className={`text-3xl font-extrabold mt-1 ${
              summary.overdueTasks > 0 ? 'text-rose-400' : 'text-white'
            }`}
          >
            {isLoading ? <Skeleton className="h-8 w-12" /> : summary.overdueTasks}
          </div>
          <p className="text-xs text-slate-500 mt-1">
            {summary.overdueTasks > 0 ? 'Exceeded estimated target' : 'All milestones on schedule'}
          </p>
        </Card>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart 1: Daily Task Completion Trend */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-white">Daily Completion Velocity</h3>
              <p className="text-xs text-slate-400">Tasks marked Done over chosen timeframe</p>
            </div>
            <TrendingUp className="w-5 h-5 text-emerald-400" />
          </div>

          <div className="h-64 w-full">
            {completionTrend.length === 0 ? (
              <div className="h-full flex items-center justify-center text-xs text-slate-500">
                No closed tasks logged in this time window.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={completionTrend}>
                  <defs>
                    <linearGradient id="velocityGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis dataKey="date" stroke="#64748b" tick={{ fontSize: 11 }} />
                  <YAxis stroke="#64748b" tick={{ fontSize: 11 }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#0f172a',
                      borderColor: '#334155',
                      borderRadius: '8px',
                      fontSize: '12px',
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="Completed"
                    stroke="#10b981"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#velocityGrad)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </Card>

        {/* Chart 2: Team Workload Distribution */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-white">Team Workload Distribution</h3>
              <p className="text-xs text-slate-400">Active vs completed tasks per developer</p>
            </div>
            <Users className="w-5 h-5 text-brand-400" />
          </div>

          <div className="h-64 w-full">
            {workloadData.length === 0 ? (
              <div className="h-full flex items-center justify-center text-xs text-slate-500">
                No assigned tasks found.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={workloadData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis dataKey="name" stroke="#64748b" tick={{ fontSize: 11 }} />
                  <YAxis stroke="#64748b" tick={{ fontSize: 11 }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#0f172a',
                      borderColor: '#334155',
                      borderRadius: '8px',
                      fontSize: '12px',
                    }}
                  />
                  <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
                  <Bar dataKey="Completed" fill="#10b981" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="InProgress" fill="#0284c7" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </Card>

        {/* Chart 3: Status Breakdown */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-white">Tasks by Status</h3>
              <p className="text-xs text-slate-400">Distribution across Kanban columns</p>
            </div>
            <BarChart3 className="w-5 h-5 text-sky-400" />
          </div>

          <div className="h-64 w-full flex items-center justify-center">
            {statusData.length === 0 ? (
              <div className="text-xs text-slate-500">No task data recorded.</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={statusData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={80}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {statusData.map((entry: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#0f172a',
                      borderColor: '#334155',
                      borderRadius: '8px',
                      fontSize: '12px',
                    }}
                  />
                  <Legend wrapperStyle={{ fontSize: '11px' }} />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </Card>

        {/* Chart 4: Tasks by Priority */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-white">Tasks by Priority</h3>
              <p className="text-xs text-slate-400">Criticality distribution of backlog</p>
            </div>
            <AlertCircle className="w-5 h-5 text-amber-400" />
          </div>

          <div className="h-64 w-full">
            {priorityData.length === 0 ? (
              <div className="h-full flex items-center justify-center text-xs text-slate-500">
                No priority metrics available.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={priorityData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis type="number" stroke="#64748b" tick={{ fontSize: 11 }} />
                  <YAxis dataKey="name" type="category" stroke="#64748b" tick={{ fontSize: 11 }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#0f172a',
                      borderColor: '#334155',
                      borderRadius: '8px',
                      fontSize: '12px',
                    }}
                  />
                  <Bar dataKey="count" fill="#6366f1" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
};
