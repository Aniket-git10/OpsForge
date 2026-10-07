import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { Zap, Mail, ArrowLeft, KeyRound } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { api } from '../services/api';
import { useToast } from '../context/ToastContext';

export const ForgotPasswordPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [resetToken, setResetToken] = useState<string | null>(null);

  const { success, error: showError } = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    try {
      setLoading(true);
      const res = await api.post('/auth/forgot-password', { email });
      success('Password reset token generated.');
      if (res.data.data?.resetToken) {
        setResetToken(res.data.data.resetToken);
      }
    } catch (err: any) {
      showError(err.response?.data?.message || 'Failed to request password reset');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-950 px-4 py-12 sm:px-6 lg:px-8 selection:bg-brand-500 selection:text-white">
      <div className="w-full max-w-md space-y-6 rounded-2xl border border-slate-800 bg-slate-900/70 p-8 shadow-2xl backdrop-blur-md">
        <div className="text-center">
          <NavLink to="/" className="inline-flex items-center gap-2 mb-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-brand-600 to-indigo-400 text-white shadow-md shadow-brand-500/20 font-bold">
              <Zap className="w-5 h-5 fill-current" />
            </div>
            <span className="text-xl font-bold tracking-tight text-white font-sans">
              OpsForge
            </span>
          </NavLink>
          <h2 className="text-2xl font-bold tracking-tight text-white">Reset your password</h2>
          <p className="mt-1 text-xs text-slate-400">
            Enter your account email to receive a password reset authorization token.
          </p>
        </div>

        {!resetToken ? (
          <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
            <Input
              label="Account Email"
              type="email"
              placeholder="developer@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              leftIcon={<Mail className="w-4 h-4" />}
              required
            />

            <Button type="submit" className="w-full" isLoading={loading}>
              Generate Reset Token
            </Button>
          </form>
        ) : (
          <div className="rounded-xl border border-emerald-500/30 bg-emerald-950/20 p-4 text-xs space-y-3">
            <div className="flex items-center gap-2 font-semibold text-emerald-400">
              <KeyRound className="w-4 h-4" />
              <span>Password Reset Token Generated (Demo Mode):</span>
            </div>
            <div className="p-2 rounded bg-slate-950 font-mono text-[11px] text-slate-200 break-all select-all border border-slate-800">
              {resetToken}
            </div>
            <Button
              className="w-full mt-2"
              onClick={() => navigate(`/reset-password?token=${resetToken}`)}
            >
              Continue to Reset Password →
            </Button>
          </div>
        )}

        <div className="text-center pt-2">
          <NavLink
            to="/login"
            className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Sign In
          </NavLink>
        </div>
      </div>
    </div>
  );
};
