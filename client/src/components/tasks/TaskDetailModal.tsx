import React, { useState } from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { Task, ProjectMember, TaskStatus, TaskPriority, Comment } from '../../types/index';
import {
  Calendar,
  Clock,
  Trash2,
  Plus,
  CheckCircle2,
  Circle,
  MessageSquare,
  Sparkles,
  Send,
  User as UserIcon,
} from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { useAuth } from '../../context/AuthContext';

interface TaskDetailModalProps {
  task: Task | null;
  isOpen: boolean;
  onClose: () => void;
  members: ProjectMember[];
}

export const TaskDetailModal: React.FC<TaskDetailModalProps> = ({
  task,
  isOpen,
  onClose,
  members,
}) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { success, error: showError } = useToast();

  const [newSubtaskTitle, setNewSubtaskTitle] = useState('');
  const [newCommentContent, setNewCommentContent] = useState('');
  const [aiLoading, setAiLoading] = useState(false);

  // Fetch comments for task
  const { data: comments = [] } = useQuery<Comment[]>({
    queryKey: ['comments', task?._id],
    queryFn: async () => {
      if (!task?._id) return [];
      const res = await api.get(`/comments/task/${task._id}`);
      return res.data.data;
    },
    enabled: Boolean(task?._id && isOpen),
  });

  // Update Task Mutation
  const updateTaskMutation = useMutation({
    mutationFn: async (updates: Partial<Task>) => {
      const res = await api.patch(`/tasks/${task?._id}`, updates);
      return res.data.data;
    },
    onSuccess: (updated) => {
      const projId = typeof task?.project === 'object' ? task.project._id : task?.project;
      queryClient.invalidateQueries({ queryKey: ['tasks', projId] });
      queryClient.invalidateQueries({ queryKey: ['task', task?._id] });
      success('Task updated');
    },
    onError: (err: any) => {
      showError(err.response?.data?.message || 'Failed to update task');
    },
  });

  // Delete Task Mutation
  const deleteTaskMutation = useMutation({
    mutationFn: async () => {
      await api.delete(`/tasks/${task?._id}`);
    },
    onSuccess: () => {
      const projId = typeof task?.project === 'object' ? task.project._id : task?.project;
      queryClient.invalidateQueries({ queryKey: ['tasks', projId] });
      success('Task deleted');
      onClose();
    },
    onError: (err: any) => {
      showError(err.response?.data?.message || 'Failed to delete task');
    },
  });

  // Toggle Subtask Mutation
  const toggleSubtaskMutation = useMutation({
    mutationFn: async ({ subtaskId, completed }: { subtaskId: string; completed: boolean }) => {
      const res = await api.patch(`/tasks/${task?._id}/subtasks/${subtaskId}`, { completed });
      return res.data.data;
    },
    onSuccess: () => {
      const projId = typeof task?.project === 'object' ? task.project._id : task?.project;
      queryClient.invalidateQueries({ queryKey: ['tasks', projId] });
    },
  });

  // Add Subtask Mutation
  const addSubtaskMutation = useMutation({
    mutationFn: async (title: string) => {
      const res = await api.post(`/tasks/${task?._id}/subtasks`, { title });
      return res.data.data;
    },
    onSuccess: () => {
      setNewSubtaskTitle('');
      const projId = typeof task?.project === 'object' ? task.project._id : task?.project;
      queryClient.invalidateQueries({ queryKey: ['tasks', projId] });
    },
  });

  // Delete Subtask Mutation
  const deleteSubtaskMutation = useMutation({
    mutationFn: async (subtaskId: string) => {
      await api.delete(`/tasks/${task?._id}/subtasks/${subtaskId}`);
    },
    onSuccess: () => {
      const projId = typeof task?.project === 'object' ? task.project._id : task?.project;
      queryClient.invalidateQueries({ queryKey: ['tasks', projId] });
    },
  });

  // Add Comment Mutation
  const addCommentMutation = useMutation({
    mutationFn: async (content: string) => {
      const res = await api.post('/comments', { taskId: task?._id, content });
      return res.data.data;
    },
    onSuccess: () => {
      setNewCommentContent('');
      queryClient.invalidateQueries({ queryKey: ['comments', task?._id] });
    },
  });

  // AI Subtasks Generator
  const handleGenerateAISubtasks = async () => {
    if (!task) return;
    try {
      setAiLoading(true);
      const res = await api.post('/ai/generate-subtasks', {
        taskTitle: task.title,
        taskDescription: task.description,
      });

      const generated = res.data.data?.subtasks || [];
      for (const item of generated) {
        await api.post(`/tasks/${task._id}/subtasks`, { title: item.title });
      }

      const projId = typeof task?.project === 'object' ? task.project._id : task?.project;
      queryClient.invalidateQueries({ queryKey: ['tasks', projId] });
      success(`AI generated ${generated.length} actionable subtasks!`);
    } catch (err: any) {
      showError('Failed to generate AI subtasks');
    } finally {
      setAiLoading(false);
    }
  };

  if (!task) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`${task.key}: ${task.title}`}
      maxWidth="2xl"
    >
      <div className="space-y-6">
        {/* Header Controls */}
        <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <span className="font-mono text-sm font-bold text-brand-400">{task.key}</span>

            {/* Status Select */}
            <select
              value={task.status}
              onChange={(e) => updateTaskMutation.mutate({ status: e.target.value as TaskStatus })}
              className="rounded-lg bg-slate-900 border border-slate-700 px-2.5 py-1 text-xs font-semibold text-slate-200 capitalize focus:border-brand-500 focus:outline-none"
            >
              <option value="backlog">Backlog</option>
              <option value="todo">To Do</option>
              <option value="in_progress">In Progress</option>
              <option value="in_review">In Review</option>
              <option value="done">Done</option>
            </select>

            {/* Priority Select */}
            <select
              value={task.priority}
              onChange={(e) =>
                updateTaskMutation.mutate({ priority: e.target.value as TaskPriority })
              }
              className="rounded-lg bg-slate-900 border border-slate-700 px-2.5 py-1 text-xs font-semibold text-slate-200 capitalize focus:border-brand-500 focus:outline-none"
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="critical">Critical</option>
            </select>
          </div>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              if (window.confirm('Are you sure you want to delete this task?')) {
                deleteTaskMutation.mutate();
              }
            }}
            className="text-rose-400 hover:text-rose-300 hover:bg-rose-950/30"
          >
            <Trash2 className="w-4 h-4 mr-1" />
            Delete Task
          </Button>
        </div>

        {/* Task Details Form Fields */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 rounded-xl bg-slate-950/60 border border-slate-800">
          <div>
            <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
              Assignee
            </label>
            <select
              value={task.assignee?._id || ''}
              onChange={(e) =>
                updateTaskMutation.mutate({ assignee: (e.target.value || null) as any })
              }
              className="w-full rounded-lg bg-slate-900 border border-slate-700 px-2.5 py-1.5 text-xs text-slate-200 focus:border-brand-500 focus:outline-none"
            >
              <option value="">Unassigned</option>
              {members.map((m) => (
                <option key={m.user._id} value={m.user._id}>
                  {m.user.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
              Due Date
            </label>
            <input
              type="date"
              value={task.dueDate ? task.dueDate.split('T')[0] : ''}
              onChange={(e) =>
                updateTaskMutation.mutate({ dueDate: (e.target.value || null) as any })
              }
              className="w-full rounded-lg bg-slate-900 border border-slate-700 px-2.5 py-1.5 text-xs text-slate-200 focus:border-brand-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
              Estimated Hours
            </label>
            <input
              type="number"
              value={task.estimatedHours || ''}
              placeholder="e.g. 6"
              onChange={(e) =>
                updateTaskMutation.mutate({
                  estimatedHours: e.target.value ? Number(e.target.value) : (null as any),
                })
              }
              className="w-full rounded-lg bg-slate-900 border border-slate-700 px-2.5 py-1.5 text-xs text-slate-200 focus:border-brand-500 focus:outline-none"
            />
          </div>
        </div>

        {/* Description */}
        <div>
          <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
            Description
          </h4>
          <p className="text-sm text-slate-300 whitespace-pre-wrap bg-slate-950/40 p-3 rounded-lg border border-slate-800/80 leading-relaxed">
            {task.description || 'No description provided.'}
          </p>
        </div>

        {/* Subtasks Checklist */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Subtasks ({task.subtasks?.filter((s) => s.completed).length || 0}/
              {task.subtasks?.length || 0})
            </h4>

            {/* AI Assistant Button */}
            <Button
              variant="outline"
              size="sm"
              onClick={handleGenerateAISubtasks}
              isLoading={aiLoading}
              className="border-brand-500/40 text-brand-300 hover:bg-brand-500/10 text-xs py-1"
            >
              <Sparkles className="w-3.5 h-3.5 mr-1 text-brand-400" />
              Generate with AI
            </Button>
          </div>

          <div className="space-y-2 mb-3">
            {task.subtasks?.map((subtask) => (
              <div
                key={subtask._id}
                className="flex items-center justify-between group p-2 rounded-lg bg-slate-900/50 hover:bg-slate-900 border border-slate-800/60"
              >
                <div
                  onClick={() =>
                    toggleSubtaskMutation.mutate({
                      subtaskId: subtask._id,
                      completed: !subtask.completed,
                    })
                  }
                  className="flex items-center gap-2.5 flex-1 cursor-pointer"
                >
                  {subtask.completed ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                  ) : (
                    <Circle className="w-4 h-4 text-slate-500 flex-shrink-0" />
                  )}
                  <span
                    className={`text-xs ${
                      subtask.completed ? 'line-through text-slate-500' : 'text-slate-200'
                    }`}
                  >
                    {subtask.title}
                  </span>
                </div>
                <button
                  onClick={() => deleteSubtaskMutation.mutate(subtask._id)}
                  className="opacity-0 group-hover:opacity-100 text-slate-500 hover:text-rose-400 transition-opacity p-1"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>

          {/* Add Subtask Input */}
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Add actionable subtask..."
              value={newSubtaskTitle}
              onChange={(e) => setNewSubtaskTitle(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && newSubtaskTitle.trim()) {
                  e.preventDefault();
                  addSubtaskMutation.mutate(newSubtaskTitle.trim());
                }
              }}
              className="flex-1 rounded-lg bg-slate-900 border border-slate-800 px-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:border-brand-500 focus:outline-none"
            />
            <Button
              size="sm"
              variant="secondary"
              onClick={() => {
                if (newSubtaskTitle.trim()) {
                  addSubtaskMutation.mutate(newSubtaskTitle.trim());
                }
              }}
              disabled={!newSubtaskTitle.trim()}
            >
              Add
            </Button>
          </div>
        </div>

        {/* Comments Section */}
        <div className="pt-4 border-t border-slate-800">
          <h4 className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-400 mb-4">
            <MessageSquare className="w-4 h-4" />
            Comments & Discussion ({comments.length})
          </h4>

          {/* Comments List */}
          <div className="space-y-3 max-h-60 overflow-y-auto mb-4 divide-y divide-slate-800/40">
            {comments.map((comment) => (
              <div key={comment._id} className="pt-3 first:pt-0">
                <div className="flex items-center justify-between text-xs mb-1">
                  <div className="flex items-center gap-2 font-medium text-slate-200">
                    <span className="font-semibold text-white">{comment.author.name}</span>
                    <span className="text-[10px] text-slate-500">
                      {new Date(comment.createdAt).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed pl-1">{comment.content}</p>
              </div>
            ))}

            {comments.length === 0 && (
              <p className="text-xs text-slate-500 py-2">No comments yet. Start the conversation!</p>
            )}
          </div>

          {/* Post Comment Input */}
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Write a comment or update..."
              value={newCommentContent}
              onChange={(e) => setNewCommentContent(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && newCommentContent.trim()) {
                  e.preventDefault();
                  addCommentMutation.mutate(newCommentContent.trim());
                }
              }}
              className="flex-1 rounded-lg bg-slate-900 border border-slate-800 px-3 py-2 text-xs text-slate-200 placeholder-slate-500 focus:border-brand-500 focus:outline-none"
            />
            <Button
              size="sm"
              onClick={() => {
                if (newCommentContent.trim()) {
                  addCommentMutation.mutate(newCommentContent.trim());
                }
              }}
              disabled={!newCommentContent.trim()}
              isLoading={addCommentMutation.isPending}
            >
              <Send className="w-3.5 h-3.5 mr-1" />
              Post
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
};
