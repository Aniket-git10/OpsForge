import { Server as SocketIOServer } from 'socket.io';

let ioInstance: SocketIOServer | null = null;

export const setSocketIO = (io: SocketIOServer) => {
  ioInstance = io;
};

export const getSocketIO = (): SocketIOServer | null => {
  return ioInstance;
};

// Project room events
export const emitTaskCreated = (projectId: string, task: any) => {
  ioInstance?.to(`project:${projectId}`).emit('task:created', task);
};

export const emitTaskUpdated = (projectId: string, task: any) => {
  ioInstance?.to(`project:${projectId}`).emit('task:updated', task);
};

export const emitTaskMoved = (projectId: string, payload: any) => {
  ioInstance?.to(`project:${projectId}`).emit('task:moved', payload);
};

export const emitTaskDeleted = (projectId: string, taskId: string) => {
  ioInstance?.to(`project:${projectId}`).emit('task:deleted', { taskId });
};

export const emitCommentCreated = (projectId: string, comment: any) => {
  ioInstance?.to(`project:${projectId}`).emit('comment:new', comment);
};

// User specific notifications
export const emitNotification = (userId: string, notification: any) => {
  ioInstance?.to(`user:${userId}`).emit('notification:new', notification);
};

// Org and Project activities
export const emitActivityLogged = (orgId: string, projectId?: string, activity?: any) => {
  if (projectId) {
    ioInstance?.to(`project:${projectId}`).emit('activity:logged', activity);
  }
  if (orgId) {
    ioInstance?.to(`org:${orgId}`).emit('activity:logged', activity);
  }
};
