import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  Zap,
  Sparkles,
  Kanban,
  Activity,
  BarChart3,
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
  Code2,
  Layers,
  Cpu,
  Clock,
} from 'lucide-react';
import { Button } from '../components/ui/Button';

export const LandingPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 selection:bg-brand-500 selection:text-white">
      {/* Top Navbar */}
      <header className="sticky top-0 z-40 border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-brand-600 to-indigo-400 text-white shadow-md shadow-brand-500/20 font-bold">
              <Zap className="w-5 h-5 fill-current" />
            </div>
            <div>
              <span className="text-lg font-bold tracking-tight text-white font-sans">
                OpsForge
              </span>
            </div>
          </div>

          <nav className="hidden md:flex items-center gap-8 text-sm text-slate-300 font-medium">
            <a href="#features" className="hover:text-white transition-colors">
              Features
            </a>
            <a href="#ai-assistant" className="hover:text-white transition-colors">
              AI Intelligence
            </a>
            <a href="#analytics" className="hover:text-white transition-colors">
              Analytics
            </a>
            <a href="#architecture" className="hover:text-white transition-colors">
              Architecture
            </a>
          </nav>

          <div className="flex items-center gap-3">
            <NavLink to="/login">
              <Button variant="ghost" size="sm">
                Sign In
              </Button>
            </NavLink>
            <NavLink to="/register">
              <Button size="sm" rightIcon={<ArrowRight className="w-4 h-4" />}>
                Get Started
              </Button>
            </NavLink>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-20 pb-24 lg:pt-28 lg:pb-32">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-brand-900/20 via-slate-950 to-slate-950" />
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-brand-500/30 bg-brand-500/10 px-3 py-1 text-xs font-semibold text-brand-300 mb-6">
            <Sparkles className="w-3.5 h-3.5 text-brand-400" />
            <span>Next-Generation AI Developer & Team Productivity Platform</span>
          </div>

          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-white max-w-4xl mx-auto leading-tight">
            Build better. <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-400 via-indigo-300 to-indigo-500">
              Ship smarter.
            </span>
          </h1>

          <p className="mt-6 text-base sm:text-lg text-slate-400 max-w-2xl mx-auto leading-relaxed">
            OpsForge unites project planning, live Kanban orchestration, real-time WebSockets, and deep developer analytics with an integrated AI copilot that breaks down goals, flags blockers, and boosts team velocity.
          </p>

          <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
            <NavLink to="/register">
              <Button size="lg" className="px-6 py-3 text-base shadow-lg shadow-brand-500/25">
                Start Building Free
              </Button>
            </NavLink>
            <NavLink to="/login">
              <Button variant="outline" size="lg" className="px-6 py-3 text-base">
                View Live Demo
              </Button>
            </NavLink>
          </div>

          {/* Realistic Dashboard Preview Mockup */}
          <div className="mt-16 rounded-2xl border border-slate-800 bg-slate-900/80 p-3 shadow-2xl backdrop-blur-xl max-w-5xl mx-auto">
            <div className="rounded-xl border border-slate-800 bg-slate-950 p-4 sm:p-6 text-left">
              <div className="flex items-center justify-between pb-4 border-b border-slate-800/80 mb-6">
                <div className="flex items-center gap-2">
                  <span className="h-3 w-3 rounded-full bg-rose-500/80" />
                  <span className="h-3 w-3 rounded-full bg-amber-500/80" />
                  <span className="h-3 w-3 rounded-full bg-emerald-500/80" />
                  <span className="ml-2 font-mono text-xs text-slate-500">opsforge.dev/app/dashboard</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-emerald-400 font-mono">
                  <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                  Live Sync Connected
                </div>
              </div>

              {/* Sample Mini Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-6">
                <div className="rounded-xl bg-slate-900/70 p-4 border border-slate-800">
                  <div className="text-xs text-slate-400 font-medium">Sprint Completion</div>
                  <div className="text-2xl font-bold text-white mt-1">78%</div>
                  <div className="text-[11px] text-emerald-400 mt-1">↑ 14% vs last week</div>
                </div>
                <div className="rounded-xl bg-slate-900/70 p-4 border border-slate-800">
                  <div className="text-xs text-slate-400 font-medium">Active Tasks</div>
                  <div className="text-2xl font-bold text-white mt-1">24</div>
                  <div className="text-[11px] text-slate-400 mt-1">across 3 projects</div>
                </div>
                <div className="rounded-xl bg-slate-900/70 p-4 border border-slate-800">
                  <div className="text-xs text-slate-400 font-medium">Overdue Deliverables</div>
                  <div className="text-2xl font-bold text-rose-400 mt-1">0</div>
                  <div className="text-[11px] text-emerald-400 mt-1">100% on schedule</div>
                </div>
                <div className="rounded-xl bg-slate-900/70 p-4 border border-slate-800">
                  <div className="text-xs text-slate-400 font-medium">AI Insights</div>
                  <div className="text-2xl font-bold text-brand-300 mt-1">5 Ready</div>
                  <div className="text-[11px] text-brand-400 mt-1">Velocity optimized</div>
                </div>
              </div>

              {/* Mini Columns */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="rounded-xl bg-slate-900/40 border border-slate-800/80 p-3">
                  <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                    To Do (4)
                  </div>
                  <div className="rounded-lg bg-slate-900 p-2.5 border border-slate-800 text-xs">
                    <span className="font-mono text-[10px] text-slate-500">OPS-102</span>
                    <p className="font-medium text-slate-200 mt-0.5">Integrate Gemini AI model routing</p>
                  </div>
                </div>
                <div className="rounded-xl bg-slate-900/40 border border-slate-800/80 p-3">
                  <div className="text-xs font-bold text-sky-400 uppercase tracking-wider mb-2">
                    In Progress (3)
                  </div>
                  <div className="rounded-lg bg-slate-900 p-2.5 border border-slate-800 text-xs">
                    <span className="font-mono text-[10px] text-sky-400">OPS-101</span>
                    <p className="font-medium text-slate-200 mt-0.5">Socket.IO real-time drag sync</p>
                  </div>
                </div>
                <div className="rounded-xl bg-slate-900/40 border border-slate-800/80 p-3">
                  <div className="text-xs font-bold text-emerald-400 uppercase tracking-wider mb-2">
                    Done (18)
                  </div>
                  <div className="rounded-lg bg-slate-900 p-2.5 border border-slate-800 text-xs">
                    <span className="font-mono text-[10px] text-emerald-400">OPS-98</span>
                    <p className="font-medium text-slate-200 mt-0.5">JWT RBAC security layer</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Grid */}
      <section id="features" className="py-20 border-t border-slate-800/80 bg-slate-900/20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-xs font-bold uppercase tracking-widest text-brand-400 mb-2">
              Engineered For Modern Teams
            </h2>
            <h3 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              Everything your engineering organization needs to execute.
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-500/10 text-brand-400 mb-4">
                <Kanban className="w-5 h-5" />
              </div>
              <h4 className="text-lg font-bold text-white mb-2">Live Kanban Board</h4>
              <p className="text-sm text-slate-400 leading-relaxed">
                Optimistic drag-and-drop column transitions, priority indicators, subtask checklists, and overdue alerts powered by automated query cache sync.
              </p>
            </div>

            <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-500/10 text-brand-400 mb-4">
                <Sparkles className="w-5 h-5" />
              </div>
              <h4 className="text-lg font-bold text-white mb-2">AI Productivity Assistant</h4>
              <p className="text-sm text-slate-400 leading-relaxed">
                Turn high-level product goals into technical tasks, break down complex stories into subtasks, and get workload prioritization matrix recommendations.
              </p>
            </div>

            <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-500/10 text-brand-400 mb-4">
                <Activity className="w-5 h-5" />
              </div>
              <h4 className="text-lg font-bold text-white mb-2">Real-Time Collaboration</h4>
              <p className="text-sm text-slate-400 leading-relaxed">
                WebSocket rooms sync card movements, comment updates, and teammate presence instantly across all browsers with zero page reloads.
              </p>
            </div>

            <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-500/10 text-brand-400 mb-4">
                <BarChart3 className="w-5 h-5" />
              </div>
              <h4 className="text-lg font-bold text-white mb-2">Productivity Analytics</h4>
              <p className="text-sm text-slate-400 leading-relaxed">
                Recharts visualization of team workloads, completion trends, and priority distribution with 7-day, 30-day, and 90-day filter scopes.
              </p>
            </div>

            <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-500/10 text-brand-400 mb-4">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h4 className="text-lg font-bold text-white mb-2">Role-Based Security</h4>
              <p className="text-sm text-slate-400 leading-relaxed">
                Enforced access control across Admin, Project Manager, Developer, and Member roles with rate-limiting, Helmet headers, and Zod contracts.
              </p>
            </div>

            <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-500/10 text-brand-400 mb-4">
                <Code2 className="w-5 h-5" />
              </div>
              <h4 className="text-lg font-bold text-white mb-2">Audit Trails & Activity</h4>
              <p className="text-sm text-slate-400 leading-relaxed">
                Complete traceability of project creations, assignments, status movements, and discussion history recorded in an immutable audit ledger.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Technology & Architecture Section */}
      <section id="architecture" className="py-20 border-t border-slate-800/80 bg-slate-950">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-xs font-bold uppercase tracking-widest text-brand-400 mb-2">
            Production Engineering
          </h2>
          <h3 className="text-3xl font-extrabold text-white tracking-tight mb-8">
            Built with modern industry standards.
          </h3>

          <div className="flex flex-wrap items-center justify-center gap-3 max-w-4xl mx-auto">
            {[
              'React 18',
              'TypeScript',
              'Node.js',
              'Express',
              'MongoDB & Mongoose',
              'Socket.IO',
              'Google Gemini API',
              'TanStack Query v5',
              'Tailwind CSS',
              'Recharts',
              'Zod Validation',
              'JWT & BCrypt',
              'Docker',
              'Vitest Testing',
            ].map((tech) => (
              <span
                key={tech}
                className="rounded-xl border border-slate-800 bg-slate-900/60 px-4 py-2 text-xs font-semibold text-slate-300"
              >
                {tech}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 border-t border-slate-800/80 bg-gradient-to-b from-slate-900/40 to-slate-950">
        <div className="mx-auto max-w-4xl px-4 text-center">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Ready to supercharge your engineering workflow?
          </h2>
          <p className="mt-4 text-slate-400 text-base">
            Join development teams using OpsForge to plan sprints, track deliverables, and ship higher-quality software.
          </p>
          <div className="mt-8 flex justify-center gap-4">
            <NavLink to="/register">
              <Button size="lg" className="px-8 shadow-lg shadow-brand-500/30">
                Create Free Account
              </Button>
            </NavLink>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-900 py-10 bg-slate-950 text-xs text-slate-500">
        <div className="mx-auto max-w-7xl px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-slate-400 font-medium">
            <Zap className="w-4 h-4 text-brand-500" />
            <span>OpsForge — Build better. Ship smarter.</span>
          </div>
          <div>© {new Date().getFullYear()} OpsForge Engineering. MIT Licensed.</div>
        </div>
      </footer>
    </div>
  );
};
