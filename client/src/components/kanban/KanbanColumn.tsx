import React from 'react';
import { Droppable } from '@hello-pangea/dnd';
import { Plus } from 'lucide-react';
import { Task, TaskStatus } from '../../types/index';
import { KanbanCard } from './KanbanCard';
import { cn } from '../../utils/cn';

interface KanbanColumnProps {
  status: TaskStatus;
  title: string;
  tasks: Task[];
  onTaskClick: (task: Task) => void;
  onAddTask: (status: TaskStatus) => void;
}

export const KanbanColumn: React.FC<KanbanColumnProps> = ({
  status,
  title,
  tasks,
  onTaskClick,
  onAddTask,
}) => {
  const getHeaderTint = (colStatus: TaskStatus) => {
    switch (colStatus) {
      case 'backlog':
        return 'text-slate-400 bg-slate-800/80';
      case 'todo':
        return 'text-slate-300 bg-slate-800';
      case 'in_progress':
        return 'text-sky-400 bg-sky-950/70 border-sky-800/60';
      case 'in_review':
        return 'text-amber-400 bg-amber-950/70 border-amber-800/60';
      case 'done':
        return 'text-emerald-400 bg-emerald-950/70 border-emerald-800/60';
      default:
        return 'text-slate-300 bg-slate-800';
    }
  };

  return (
    <div className="flex flex-col w-80 flex-shrink-0 rounded-2xl bg-slate-950/60 border border-slate-800/80 p-3 h-full max-h-full">
      {/* Column Header */}
      <div className="flex items-center justify-between px-2 py-2 mb-2">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-xs tracking-wider uppercase text-slate-200">
            {title}
          </span>
          <span
            className={cn(
              'rounded-full px-2 py-0.5 text-[11px] font-bold border border-slate-700/60',
              getHeaderTint(status)
            )}
          >
            {tasks.length}
          </span>
        </div>

        <button
          onClick={() => onAddTask(status)}
          className="rounded-lg p-1 text-slate-400 hover:bg-slate-800 hover:text-white transition-colors"
          title={`Add task to ${title}`}
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>

      {/* Droppable Task List */}
      <Droppable droppableId={status}>
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            className={cn(
              'flex-1 overflow-y-auto px-1 py-1 rounded-xl transition-colors min-h-[150px]',
              snapshot.isDraggingOver ? 'bg-slate-900/40 ring-1 ring-brand-500/30' : ''
            )}
          >
            {tasks.map((task, index) => (
              <KanbanCard
                key={task._id}
                task={task}
                index={index}
                onClick={onTaskClick}
              />
            ))}
            {provided.placeholder}

            {tasks.length === 0 && !snapshot.isDraggingOver && (
              <div className="flex h-28 items-center justify-center rounded-xl border border-dashed border-slate-800/80 text-xs text-slate-500">
                No tasks
              </div>
            )}
          </div>
        )}
      </Droppable>

      {/* Add Task Quick Trigger */}
      <button
        onClick={() => onAddTask(status)}
        className="mt-2 flex w-full items-center justify-center gap-1.5 rounded-xl border border-dashed border-slate-800 py-2 text-xs font-medium text-slate-400 hover:border-slate-700 hover:bg-slate-900 hover:text-slate-200 transition-all"
      >
        <Plus className="w-3.5 h-3.5" />
        <span>Add Task</span>
      </button>
    </div>
  );
};
