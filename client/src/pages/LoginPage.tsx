import React, { useState } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { Zap, Lock, Mail, ArrowRight, UserCheck } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

export const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const { success, error: showError } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const from = (location.state as any)?.from?.pathname || '/app/dashboard';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;

    try {
      setLoading(true);
      await login(email, password);
      success('Welcome back to OpsForge!');
      navigate(from, { replace: true });
    } catch (err: any) {
      showError(err.response?.data?.message || 'Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  const fillDemo = (demoEmail: string) => {
    setEmail(demoEmail);
    setPassword('Demo1234!');
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-950 px-4 py-12 sm:px-6 lg:px-8 selection:bg-brand-500 selection:text-white">
      <div className="w-full max-w-md space-y-8 rounded-2xl border border-slate-800 bg-slate-900/70 p-8 shadow-2xl backdrop-blur-md">
        {/* Brand Header */}
        <div className="text-center">
          <NavLink to="/" className="inline-flex items-center gap-2 mb-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-brand-600 to-indigo-400 text-white shadow-md shadow-brand-500/20 font-bold">
              <Zap className="w-5 h-5 fill-current" />
            </div>
            <span className="text-xl font-bold tracking-tight text-white font-sans">
              OpsForge
            </span>
          </NavLink>
          <h2 className="text-2xl font-bold tracking-tight text-white">Sign in to your account</h2>
          <p className="mt-1 text-xs text-slate-400">
            Welcome back! Enter your credentials to access your workspaces.
          </p>
        </div>

        {/* Demo Fast-Fill Buttons for Interviewers/Reviewers */}
        <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-3 text-xs">
          <div className="flex items-center gap-1.5 font-semibold text-slate-300 mb-2">
            <UserCheck className="w-4 h-4 text-brand-400" />
            <span>1-Click Demo Logins for Evaluation:</span>
          </div>
          <div className="grid grid-cols-2 gap-1.5">
            <button
              type="button"
              onClick={() => fillDemo('admin@opsforge.demo')}
              className="rounded-lg bg-slate-900 border border-slate-800 py-1.5 px-2 text-[11px] text-slate-300 hover:border-brand-500 hover:text-white transition-all text-left"
            >
              👑 <span className="font-semibold">Admin</span> (Aniket)
            </button>
            <button
              type="button"
              onClick={() => fillDemo('manager@opsforge.demo')}
              className="rounded-lg bg-slate-900 border border-slate-800 py-1.5 px-2 text-[11px] text-slate-300 hover:border-brand-500 hover:text-white transition-all text-left"
            >
              📋 <span className="font-semibold">PM</span> (Sarah)
            </button>
            <button
              type="button"
              onClick={() => fillDemo('developer@opsforge.demo')}
              className="rounded-lg bg-slate-900 border border-slate-800 py-1.5 px-2 text-[11px] text-slate-300 hover:border-brand-500 hover:text-white transition-all text-left"
            >
              💻 <span className="font-semibold">Developer</span> (David)
            </button>
            <button
              type="button"
              onClick={() => fillDemo('member@opsforge.demo')}
              className="rounded-lg bg-slate-900 border border-slate-800 py-1.5 px-2 text-[11px] text-slate-300 hover:border-brand-500 hover:text-white transition-all text-left"
            >
              🧪 <span className="font-semibold">QA Member</span> (Elena)
            </button>
          </div>
        </div>

        {/* Form */}
        <form className="mt-8 space-y-4" onSubmit={handleSubmit}>
          <Input
            label="Email address"
            type="email"
            placeholder="developer@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            leftIcon={<Mail className="w-4 h-4" />}
            required
            autoComplete="email"
          />

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label
                htmlFor="password"
                className="text-xs font-semibold text-slate-300 uppercase tracking-wider"
              >
                Password
              </label>
              <NavLink
                to="/forgot-password"
                className="text-xs text-brand-400 hover:text-brand-300"
              >
                Forgot password?
              </NavLink>
            </div>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              leftIcon={<Lock className="w-4 h-4" />}
              required
              autoComplete="current-password"
            />
          </div>

          <Button
            type="submit"
            className="w-full mt-2"
            isLoading={loading}
            rightIcon={<ArrowRight className="w-4 h-4" />}
          >
            Sign In
          </Button>
        </form>

        {/* Footer Link */}
        <div className="text-center text-xs text-slate-400 pt-2 border-t border-slate-800/80">
          Don't have an account?{' '}
          <NavLink to="/register" className="font-semibold text-brand-400 hover:text-brand-300">
            Sign up now
          </NavLink>
        </div>
      </div>
    </div>
  );
};
