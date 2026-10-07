import React from 'react';
import { NavLink } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { ShieldAlert, ArrowLeft } from 'lucide-react';

export const UnauthorizedPage: React.FC = () => {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-slate-950 px-4 text-center selection:bg-brand-500 selection:text-white">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-rose-950/40 border border-rose-800 text-rose-400 mb-6 shadow-xl">
        <ShieldAlert className="w-8 h-8" />
      </div>
      <h1 className="text-4xl font-extrabold text-white tracking-tight sm:text-5xl">403</h1>
      <h2 className="mt-2 text-xl font-bold text-slate-200">Access Restricted</h2>
      <p className="mt-2 text-sm text-slate-400 max-w-sm">
        You do not have the required permissions or role to perform this operation. Contact your workspace administrator for access.
      </p>
      <div className="mt-6 flex gap-3">
        <NavLink to="/app/dashboard">
          <Button leftIcon={<ArrowLeft className="w-4 h-4" />}>Back to Safety</Button>
        </NavLink>
      </div>
    </div>
  );
};
