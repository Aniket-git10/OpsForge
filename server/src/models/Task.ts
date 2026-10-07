import mongoose, { Document, Schema, Types } from 'mongoose';

export type TaskStatus = 'backlog' | 'todo' | 'in_progress' | 'in_review' | 'done';
export type TaskPriority = 'low' | 'medium' | 'high' | 'critical';

export interface ISubtask {
  _id: Types.ObjectId;
  title: string;
  completed: boolean;
  completedAt?: Date;
}

export interface ITask extends Document {
  _id: Types.ObjectId;
  key: string; // e.g. "OPS-4"
  taskNumber: number;
  project: Types.ObjectId;
  organization: Types.ObjectId;
  title: string;
  description?: string;
  status: TaskStatus;
  priority: TaskPriority;
  order: number;
  creator: Types.ObjectId;
  assignee?: Types.ObjectId;
  labels: string[];
  estimatedHours?: number;
  dueDate?: Date;
  subtasks: ISubtask[];
  createdAt: Date;
  updatedAt: Date;
}

const SubtaskSchema = new Schema<ISubtask>(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200,
    },
    completed: {
      type: Boolean,
      default: false,
    },
    completedAt: {
      type: Date,
    },
  },
  { _id: true }
);

const TaskSchema = new Schema<ITask>(
  {
    key: {
      type: String,
      required: true,
      trim: true,
    },
    taskNumber: {
      type: Number,
      required: true,
    },
    project: {
      type: Schema.Types.ObjectId,
      ref: 'Project',
      required: true,
      index: true,
    },
    organization: {
      type: Schema.Types.ObjectId,
      ref: 'Organization',
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: [true, 'Task title is required'],
      trim: true,
      maxlength: [200, 'Task title cannot exceed 200 characters'],
    },
    description: {
      type: String,
      default: '',
      maxlength: [5000, 'Description cannot exceed 5000 characters'],
    },
    status: {
      type: String,
      enum: ['backlog', 'todo', 'in_progress', 'in_review', 'done'],
      default: 'todo',
      index: true,
    },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high', 'critical'],
      default: 'medium',
      index: true,
    },
    order: {
      type: Number,
      default: 0,
    },
    creator: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    assignee: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      index: true,
    },
    labels: {
      type: [String],
      default: [],
    },
    estimatedHours: {
      type: Number,
      min: 0,
      max: 500,
    },
    dueDate: {
      type: Date,
      index: true,
    },
    subtasks: {
      type: [SubtaskSchema],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

// Helpful indexes for high-frequency queries
TaskSchema.index({ project: 1, status: 1, order: 1 });
TaskSchema.index({ organization: 1, assignee: 1, status: 1 });
TaskSchema.index({ project: 1, dueDate: 1 });
TaskSchema.index({ title: 'text', description: 'text' });

export const Task = mongoose.model<ITask>('Task', TaskSchema);
