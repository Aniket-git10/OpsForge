import React from 'react';
import { DragDropContext, DropResult } from '@hello-pangea/dnd';
import { Task, TaskStatus } from '../../types/index';
import { KanbanColumn } from './KanbanColumn';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../services/api';
import { useToast } from '../../context/ToastContext';

interface KanbanBoardProps {
  projectId: string;
  tasks: Task[];
  onTaskClick: (task: Task) => void;
  onAddTask: (status: TaskStatus) => void;
}

const COLUMNS: { status: TaskStatus; title: string }[] = [
  { status: 'backlog', title: 'Backlog' },
  { status: 'todo', title: 'To Do' },
  { status: 'in_progress', title: 'In Progress' },
  { status: 'in_review', title: 'In Review' },
  { status: 'done', title: 'Done' },
];

export const KanbanBoard: React.FC<KanbanBoardProps> = ({
  projectId,
  tasks,
  onTaskClick,
  onAddTask,
}) => {
  const queryClient = useQueryClient();
  const { error: showError } = useToast();

  // Task Status Mutation
  const moveTaskMutation = useMutation({
    mutationFn: async ({
      taskId,
      status,
      newOrder,
    }: {
      taskId: string;
      status: TaskStatus;
      newOrder: number;
    }) => {
      const res = await api.patch(`/tasks/${taskId}/status`, { status, newOrder });
      return res.data.data;
    },
    onError: (_err, _variables, context: any) => {
      if (context?.previousTasks) {
        queryClient.setQueryData(['tasks', projectId], context.previousTasks);
      }
      showError('Failed to move task. Reverting changes.');
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks', projectId] });
      queryClient.invalidateQueries({ queryKey: ['projects'] });
    },
  });

  const handleDragEnd = (result: DropResult) => {
    const { source, destination, draggableId } = result;

    if (!destination) return;

    if (
      source.droppableId === destination.droppableId &&
      source.index === destination.index
    ) {
      return;
    }

    const sourceStatus = source.droppableId as TaskStatus;
    const destStatus = destination.droppableId as TaskStatus;

    // Snapshot previous tasks for rollback
    const previousTasks = queryClient.getQueryData<Task[]>(['tasks', projectId]);

    // Optimistically update query cache
    if (previousTasks) {
      const updatedTasks = [...previousTasks];
      const taskIndex = updatedTasks.findIndex((t) => t._id === draggableId);

      if (taskIndex !== -1) {
        const movedTask = {
          ...updatedTasks[taskIndex],
          status: destStatus,
          order: destination.index,
        };

        updatedTasks.splice(taskIndex, 1);
        updatedTasks.push(movedTask);

        queryClient.setQueryData(['tasks', projectId], updatedTasks);
      }
    }

    // Call backend API
    moveTaskMutation.mutate({
      taskId: draggableId,
      status: destStatus,
      newOrder: destination.index,
    });
  };

  // Group tasks by column status
  const tasksByStatus = COLUMNS.reduce<Record<TaskStatus, Task[]>>((acc, col) => {
    acc[col.status] = tasks
      .filter((t) => t.status === col.status)
      .sort((a, b) => a.order - b.order);
    return acc;
  }, {} as any);

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <div className="flex gap-4 overflow-x-auto pb-4 h-[calc(100vh-13rem)] items-start">
        {COLUMNS.map((col) => (
          <KanbanColumn
            key={col.status}
            status={col.status}
            title={col.title}
            tasks={tasksByStatus[col.status] || []}
            onTaskClick={onTaskClick}
            onAddTask={onAddTask}
          />
        ))}
      </div>
    </DragDropContext>
  );
};
