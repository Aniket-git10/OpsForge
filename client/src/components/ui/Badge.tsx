import React from 'react';
import { cn } from '../../utils/cn';
import { TaskPriority, TaskStatus, ProjectPriority, ProjectStatus } from '../../types/index';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'status' | 'priority' | 'role' | 'outline';
  status?: TaskStatus | ProjectStatus | string;
  priority?: TaskPriority | ProjectPriority | string;
  size?: 'sm' | 'md';
}

export const Badge: React.FC<BadgeProps> = ({
  className,
  children,
  variant = 'default',
  status,
  priority,
  size = 'sm',
  ...props
}) => {
  const getStatusClasses = (val: string) => {
    switch (val) {
      case 'done':
      case 'completed':
        return 'bg-emerald-950/70 text-emerald-400 border-emerald-800/60';
      case 'in_progress':
      case 'active':
        return 'bg-sky-950/70 text-sky-400 border-sky-800/60';
      case 'in_review':
      case 'on_hold':
        return 'bg-amber-950/70 text-amber-400 border-amber-800/60';
      case 'todo':
      case 'planning':
        return 'bg-slate-800 text-slate-300 border-slate-700';
      case 'backlog':
      case 'archived':
        return 'bg-slate-900 text-slate-400 border-slate-800';
      default:
        return 'bg-slate-800 text-slate-300 border-slate-700';
    }
  };

  const getPriorityClasses = (val: string) => {
    switch (val) {
      case 'critical':
        return 'bg-rose-950/80 text-rose-300 border-rose-800/60 font-semibold';
      case 'high':
        return 'bg-orange-950/70 text-orange-400 border-orange-800/60';
      case 'medium':
        return 'bg-amber-950/60 text-amber-400 border-amber-800/50';
      case 'low':
        return 'bg-slate-800/80 text-slate-400 border-slate-700';
      default:
        return 'bg-slate-800 text-slate-300 border-slate-700';
    }
  };

  let specificStyle = 'bg-slate-800 text-slate-300 border-slate-700';

  if (status) {
    specificStyle = getStatusClasses(status);
  } else if (priority) {
    specificStyle = getPriorityClasses(priority);
  }

  const sizes = {
    sm: 'text-[11px] px-2 py-0.5',
    md: 'text-xs px-2.5 py-1',
  };

  const formatText = (text: any) => {
    if (typeof text === 'string') {
      return text.replace(/_/g, ' ').toUpperCase();
    }
    return text;
  };

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 font-medium rounded-md border capitalize tracking-wide select-none',
        sizes[size],
        specificStyle,
        className
      )}
      {...props}
    >
      {children || formatText(status || priority)}
    </span>
  );
};
