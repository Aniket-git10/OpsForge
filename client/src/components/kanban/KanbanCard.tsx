import React from 'react';
import { Draggable } from '@hello-pangea/dnd';
import { Calendar, CheckSquare, Clock, AlertCircle } from 'lucide-react';
import { Task } from '../../types/index';
import { Badge } from '../ui/Badge';
import { cn } from '../../utils/cn';

interface KanbanCardProps {
  task: Task;
  index: number;
  onClick: (task: Task) => void;
}

export const KanbanCard: React.FC<KanbanCardProps> = ({ task, index, onClick }) => {
  const isOverdue =
    task.dueDate && task.status !== 'done' && new Date(task.dueDate) < new Date();

  const totalSubtasks = task.subtasks?.length || 0;
  const completedSubtasks = task.subtasks?.filter((s) => s.completed).length || 0;

  return (
    <Draggable draggableId={task._id} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          onClick={() => onClick(task)}
          className={cn(
            'group mb-3 rounded-xl border border-slate-800 bg-slate-900/90 p-4 shadow-sm transition-all duration-150 hover:border-slate-700 hover:shadow-md cursor-pointer select-none',
            snapshot.isDragging && 'border-brand-500 bg-slate-900 shadow-xl ring-2 ring-brand-500/20'
          )}
        >
          {/* Card Top: Key & Priority */}
          <div className="flex items-center justify-between gap-2 mb-2">
            <span className="font-mono text-[11px] font-semibold text-slate-400 group-hover:text-brand-400 transition-colors">
              {task.key}
            </span>
            <Badge priority={task.priority} size="sm" />
          </div>

          {/* Title */}
          <h4 className="text-sm font-medium text-slate-100 group-hover:text-white leading-snug line-clamp-2 mb-3">
            {task.title}
          </h4>

          {/* Labels */}
          {task.labels && task.labels.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mb-3">
              {task.labels.map((label) => (
                <span
                  key={label}
                  className="rounded px-1.5 py-0.5 text-[10px] font-medium bg-slate-800/80 text-slate-400 border border-slate-700/60"
                >
                  {label}
                </span>
              ))}
            </div>
          )}

          {/* Footer Metadata */}
          <div className="flex items-center justify-between pt-2 border-t border-slate-800/60 text-xs text-slate-400">
            <div className="flex items-center gap-3">
              {/* Subtasks Counter */}
              {totalSubtasks > 0 && (
                <div
                  className={cn(
                    'flex items-center gap-1 text-[11px]',
                    completedSubtasks === totalSubtasks
                      ? 'text-emerald-400'
                      : 'text-slate-400'
                  )}
                >
                  <CheckSquare className="w-3.5 h-3.5" />
                  <span>
                    {completedSubtasks}/{totalSubtasks}
                  </span>
                </div>
              )}

              {/* Due Date Indicator */}
              {task.dueDate && (
                <div
                  className={cn(
                    'flex items-center gap-1 text-[11px]',
                    isOverdue ? 'text-rose-400 font-semibold' : 'text-slate-400'
                  )}
                >
                  {isOverdue ? (
                    <AlertCircle className="w-3.5 h-3.5" />
                  ) : (
                    <Calendar className="w-3.5 h-3.5" />
                  )}
                  <span>
                    {new Date(task.dueDate).toLocaleDateString(undefined, {
                      month: 'short',
                      day: 'numeric',
                    })}
                  </span>
                </div>
              )}
            </div>

            {/* Assignee Avatar */}
            <div>
              {task.assignee ? (
                <div
                  title={`Assigned to ${task.assignee.name}`}
                  className="flex h-6 w-6 items-center justify-center rounded-full bg-slate-800 text-[10px] font-bold text-slate-200 border border-slate-700"
                >
                  {task.assignee.avatar ? (
                    <img
                      src={task.assignee.avatar}
                      alt={task.assignee.name}
                      className="h-full w-full rounded-full object-cover"
                    />
                  ) : (
                    task.assignee.name[0].toUpperCase()
                  )}
                </div>
              ) : (
                <div
                  title="Unassigned"
                  className="flex h-6 w-6 items-center justify-center rounded-full border border-dashed border-slate-700 text-[10px] text-slate-500"
                >
                  -
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </Draggable>
  );
};
