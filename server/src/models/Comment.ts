import mongoose, { Document, Schema, Types } from 'mongoose';

export interface IComment extends Document {
  _id: Types.ObjectId;
  task: Types.ObjectId;
  project: Types.ObjectId;
  organization: Types.ObjectId;
  author: Types.ObjectId;
  content: string;
  edited: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const CommentSchema = new Schema<IComment>(
  {
    task: {
      type: Schema.Types.ObjectId,
      ref: 'Task',
      required: true,
      index: true,
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
    },
    author: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    content: {
      type: String,
      required: [true, 'Comment content cannot be empty'],
      trim: true,
      maxlength: [3000, 'Comment cannot exceed 3000 characters'],
    },
    edited: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

CommentSchema.index({ task: 1, createdAt: 1 });

export const Comment = mongoose.model<IComment>('Comment', CommentSchema);
