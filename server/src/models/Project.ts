import mongoose, { Document, Schema, Types } from 'mongoose';

export type ProjectStatus = 'planning' | 'active' | 'on_hold' | 'completed' | 'archived';
export type ProjectPriority = 'low' | 'medium' | 'high' | 'critical';
export type ProjectMemberRole = 'manager' | 'contributor' | 'viewer';

export interface IProjectMember {
  user: Types.ObjectId;
  role: ProjectMemberRole;
}

export interface IProject extends Document {
  _id: Types.ObjectId;
  name: string;
  key: string;
  description?: string;
  organization: Types.ObjectId;
  owner: Types.ObjectId;
  members: IProjectMember[];
  status: ProjectStatus;
  priority: ProjectPriority;
  startDate?: Date;
  deadline?: Date;
  isArchived: boolean;
  taskCounter: number;
  createdAt: Date;
  updatedAt: Date;
}

const ProjectSchema = new Schema<IProject>(
  {
    name: {
      type: String,
      required: [true, 'Project name is required'],
      trim: true,
      maxlength: [100, 'Project name cannot exceed 100 characters'],
    },
    key: {
      type: String,
      required: [true, 'Project key is required'],
      uppercase: true,
      trim: true,
      minlength: [2, 'Project key must be at least 2 characters'],
      maxlength: [10, 'Project key cannot exceed 10 characters'],
    },
    description: {
      type: String,
      default: '',
      maxlength: [1000, 'Description cannot exceed 1000 characters'],
    },
    organization: {
      type: Schema.Types.ObjectId,
      ref: 'Organization',
      required: true,
      index: true,
    },
    owner: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    members: [
      {
        user: {
          type: Schema.Types.ObjectId,
          ref: 'User',
          required: true,
        },
        role: {
          type: String,
          enum: ['manager', 'contributor', 'viewer'],
          default: 'contributor',
        },
      },
    ],
    status: {
      type: String,
      enum: ['planning', 'active', 'on_hold', 'completed', 'archived'],
      default: 'active',
      index: true,
    },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high', 'critical'],
      default: 'medium',
      index: true,
    },
    startDate: {
      type: Date,
    },
    deadline: {
      type: Date,
      index: true,
    },
    isArchived: {
      type: Boolean,
      default: false,
      index: true,
    },
    taskCounter: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Compound index for uniqueness of project key per organization
ProjectSchema.index({ organization: 1, key: 1 }, { unique: true });
ProjectSchema.index({ organization: 1, isArchived: 1 });
ProjectSchema.index({ 'members.user': 1 });

export const Project = mongoose.model<IProject>('Project', ProjectSchema);
