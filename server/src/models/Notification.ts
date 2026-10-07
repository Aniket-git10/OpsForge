import mongoose, { Document, Schema, Types } from 'mongoose';

export type NotificationType =
  | 'task_assigned'
  | 'task_status'
  | 'comment_added'
  | 'mention'
  | 'deadline_approaching'
  | 'ai_summary'
  | 'project_member';

export interface INotification extends Document {
  _id: Types.ObjectId;
  recipient: Types.ObjectId;
  sender?: Types.ObjectId;
  organization: Types.ObjectId;
  project?: Types.ObjectId;
  task?: Types.ObjectId;
  type: NotificationType;
  title: string;
  message: string;
  isRead: boolean;
  link?: string;
  createdAt: Date;
}

const NotificationSchema = new Schema<INotification>(
  {
    recipient: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    sender: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    organization: {
      type: Schema.Types.ObjectId,
      ref: 'Organization',
      required: true,
    },
    project: {
      type: Schema.Types.ObjectId,
      ref: 'Project',
    },
    task: {
      type: Schema.Types.ObjectId,
      ref: 'Task',
    },
    type: {
      type: String,
      enum: [
        'task_assigned',
        'task_status',
        'comment_added',
        'mention',
        'deadline_approaching',
        'ai_summary',
        'project_member',
      ],
      required: true,
    },
    title: {
      type: String,
      required: true,
      maxlength: 150,
    },
    message: {
      type: String,
      required: true,
      maxlength: 500,
    },
    isRead: {
      type: Boolean,
      default: false,
      index: true,
    },
    link: {
      type: String,
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  }
);

NotificationSchema.index({ recipient: 1, isRead: 1, createdAt: -1 });

export const Notification = mongoose.model<INotification>('Notification', NotificationSchema);
