import mongoose, { Document, Schema, Types } from 'mongoose';

export type ActivityAction =
  | 'created'
  | 'updated'
  | 'status_changed'
  | 'priority_changed'
  | 'assigned'
  | 'commented'
  | 'deleted'
  | 'archived';

export type ActivityEntityType = 'project' | 'task' | 'comment' | 'member';

export interface IActivity extends Document {
  _id: Types.ObjectId;
  organization: Types.ObjectId;
  project?: Types.ObjectId;
  task?: Types.ObjectId;
  user: Types.ObjectId;
  action: ActivityAction;
  entityType: ActivityEntityType;
  details: {
    field?: string;
    from?: any;
    to?: any;
    summary: string;
  };
  createdAt: Date;
}

const ActivitySchema = new Schema<IActivity>(
  {
    organization: {
      type: Schema.Types.ObjectId,
      ref: 'Organization',
      required: true,
      index: true,
    },
    project: {
      type: Schema.Types.ObjectId,
      ref: 'Project',
      index: true,
    },
    task: {
      type: Schema.Types.ObjectId,
      ref: 'Task',
      index: true,
    },
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    action: {
      type: String,
      enum: [
        'created',
        'updated',
        'status_changed',
        'priority_changed',
        'assigned',
        'commented',
        'deleted',
        'archived',
      ],
      required: true,
    },
    entityType: {
      type: String,
      enum: ['project', 'task', 'comment', 'member'],
      required: true,
    },
    details: {
      field: { type: String },
      from: { type: Schema.Types.Mixed },
      to: { type: Schema.Types.Mixed },
      summary: { type: String, required: true },
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  }
);

ActivitySchema.index({ organization: 1, createdAt: -1 });
ActivitySchema.index({ project: 1, createdAt: -1 });
ActivitySchema.index({ task: 1, createdAt: -1 });

export const Activity = mongoose.model<IActivity>('Activity', ActivitySchema);
