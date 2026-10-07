import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  FolderKanban,
  Users,
  BarChart3,
  Sparkles,
  Bell,
  Settings,
  LogOut,
  Zap,
  CheckCircle2,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useSocket } from '../../context/SocketContext';
import { cn } from '../../utils/cn';

interface SidebarProps {
  onCloseMobile?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ onCloseMobile }) => {
  const { user, logout } = useAuth();
  const { isConnected } = useSocket();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const navItems = [
    { label: 'Dashboard', to: '/app/dashboard', icon: LayoutDashboard },
    { label: 'Projects', to: '/app/projects', icon: FolderKanban },
    { label: 'Team', to: '/app/team', icon: Users },
    { label: 'Analytics', to: '/app/analytics', icon: BarChart3 },
    { label: 'AI Assistant', to: '/app/ai-assistant', icon: Sparkles, badge: 'AI' },
    { label: 'Notifications', to: '/app/notifications', icon: Bell },
    { label: 'Settings', to: '/app/settings', icon: Settings },
  ];

  return (
    <aside className="flex h-full w-64 flex-col justify-between border-r border-slate-800 bg-slate-950 px-4 py-5 select-none">
      <div>
        {/* Brand Header */}
        <div className="flex items-center gap-3 px-2 mb-6">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-brand-600 to-indigo-400 text-white shadow-md shadow-brand-500/20 font-bold">
            <Zap className="w-5 h-5 fill-current" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-white tracking-tight text-base font-sans">
                OpsForge
              </span>
              <span className="text-[10px] uppercase font-mono px-1.5 py-0.2 rounded bg-brand-950 text-brand-300 border border-brand-800/60 font-semibold">
                SaaS
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-medium">Build better. Ship smarter.</p>
          </div>
        </div>

        {/* Organization & Sync Status */}
        <div className="mb-5 rounded-lg border border-slate-800/80 bg-slate-900/50 p-2.5 px-3">
          <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
            Workspace
          </div>
          <div className="mt-0.5 text-xs font-medium text-slate-200 truncate">
            {user?.organization?.name || 'Engineering Org'}
          </div>
          <div className="mt-2 flex items-center gap-1.5 text-[11px]">
            <span
              className={cn(
                'inline-block h-2 w-2 rounded-full',
                isConnected ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'
              )}
            />
            <span className="text-slate-400">
              {isConnected ? 'Real-Time Live Sync' : 'Reconnecting...'}
            </span>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={onCloseMobile}
                className={({ isActive }) =>
                  cn(
                    'group flex items-center justify-between rounded-lg px-3 py-2 text-sm font-medium transition-all duration-150',
                    isActive
                      ? 'bg-brand-600/15 text-brand-300 font-semibold border-l-2 border-brand-500 rounded-l-none'
                      : 'text-slate-400 hover:bg-slate-900 hover:text-slate-100'
                  )
                }
              >
                <div className="flex items-center gap-3">
                  <Icon className="h-4 w-4 flex-shrink-0 transition-colors group-hover:text-white" />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span className="rounded-full bg-brand-500/20 px-2 py-0.5 text-[10px] font-semibold text-brand-300 border border-brand-500/30">
                    {item.badge}
                  </span>
                )}
              </NavLink>
            );
          })}
        </nav>
      </div>

      {/* User Footnote */}
      <div className="border-t border-slate-800/80 pt-4">
        <div className="flex items-center justify-between rounded-lg p-2 hover:bg-slate-900 transition-colors">
          <NavLink
            to="/app/profile"
            onClick={onCloseMobile}
            className="flex items-center gap-3 overflow-hidden"
          >
            <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-slate-800 text-xs font-bold text-slate-200 border border-slate-700">
              {user?.avatar ? (
                <img
                  src={user.avatar}
                  alt={user.name}
                  className="h-full w-full rounded-full object-cover"
                />
              ) : (
                user?.name?.[0]?.toUpperCase() || 'U'
              )}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-xs font-semibold text-white">{user?.name}</p>
              <p className="truncate text-[10px] text-slate-400 capitalize">
                {user?.role?.replace('_', ' ')}
              </p>
            </div>
          </NavLink>
          <button
            onClick={handleLogout}
            title="Log out"
            className="rounded p-1.5 text-slate-400 hover:bg-slate-800 hover:text-rose-400 transition-colors"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>
    </aside>
  );
};
