import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Building, Shield, Cpu, Wifi } from 'lucide-react';

export const SettingsPage: React.FC = () => {
  const { user } = useAuth();
  const { isConnected } = useSocket();

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
          Workspace Settings
        </h1>
        <p className="mt-1 text-sm text-slate-400">
          Configure platform options, AI service settings, and team preferences.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {/* Workspace Info */}
        <Card className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 rounded-lg bg-brand-500/10 text-brand-400">
              <Building className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Organization Configuration</h3>
              <p className="text-xs text-slate-400">Basic metadata and workspace identifier</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
              <span className="text-slate-400 font-semibold uppercase">Organization Name</span>
              <p className="text-sm font-bold text-white mt-1">
                {user?.organization?.name || 'Default Workspace'}
              </p>
            </div>

            <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
              <span className="text-slate-400 font-semibold uppercase">Workspace Slug</span>
              <p className="text-sm font-bold text-brand-400 font-mono mt-1">
                {user?.organization?.slug || 'opsforge'}
              </p>
            </div>
          </div>
        </Card>

        {/* AI Engine Status */}
        <Card className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 rounded-lg bg-brand-500/10 text-brand-400">
              <Cpu className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">AI Engine & Fallback Abstraction</h3>
              <p className="text-xs text-slate-400">LLM provider routing and reliability tier</p>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-xs space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-slate-400 font-medium">Configured AI Providers:</span>
              <span className="text-slate-200 font-mono font-semibold">
                Google Gemini API & Deterministic Heuristic Engine
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400 font-medium">Fallback Safety Tier:</span>
              <span className="text-emerald-400 font-bold font-mono">Active (100% Uptime Guaranteed)</span>
            </div>
            <p className="text-slate-500 text-[11px] pt-1">
              If an external AI API key is not supplied or if cloud limits are reached, OpsForge automatically falls back to its deterministic engineering intelligence engine to synthesize tasks and priorities without errors.
            </p>
          </div>
        </Card>

        {/* Real-time Connection */}
        <Card className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400">
              <Wifi className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Real-Time WebSocket Engine</h3>
              <p className="text-xs text-slate-400">Socket.IO room synchronization</p>
            </div>
          </div>

          <div className="flex items-center justify-between p-4 rounded-xl bg-slate-950 border border-slate-800 text-xs">
            <div className="flex items-center gap-2">
              <span
                className={`h-2.5 w-2.5 rounded-full ${
                  isConnected ? 'bg-emerald-400 animate-pulse' : 'bg-rose-400'
                }`}
              />
              <span className="font-semibold text-slate-200">
                {isConnected ? 'Connected & Subscribed' : 'Disconnected'}
              </span>
            </div>
            <span className="text-slate-500 font-mono text-[11px]">
              Transport: WebSocket / Polling
            </span>
          </div>
        </Card>
      </div>
    </div>
  );
};
