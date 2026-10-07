import { Server as SocketIOServer } from 'socket.io';
import { AuthenticatedSocket } from './socketAuth.js';

// In-memory registry of online users per organization
const onlineUsers = new Map<string, Set<string>>(); // orgId -> Set of userIds

export const registerSocketHandlers = (io: SocketIOServer) => {
  io.on('connection', (socket: AuthenticatedSocket) => {
    const user = socket.user;
    if (!user) {
      socket.disconnect(true);
      return;
    }

    const userId = user.id;
    const orgId = user.organization;

    // Join personal notification channel
    socket.join(`user:${userId}`);

    // Join organization channel
    if (orgId) {
      socket.join(`org:${orgId}`);

      if (!onlineUsers.has(orgId)) {
        onlineUsers.set(orgId, new Set());
      }
      onlineUsers.get(orgId)!.add(userId);

      // Broadcast updated online presence to org
      io.to(`org:${orgId}`).emit('presence:update', {
        onlineUserIds: Array.from(onlineUsers.get(orgId)!),
      });
    }

    // Handle joining a project's live workspace / Kanban room
    socket.on('project:join', (projectId: string) => {
      socket.join(`project:${projectId}`);
    });

    // Handle leaving a project room
    socket.on('project:leave', (projectId: string) => {
      socket.leave(`project:${projectId}`);
    });

    // Disconnect cleanup
    socket.on('disconnect', () => {
      if (orgId && onlineUsers.has(orgId)) {
        const orgSet = onlineUsers.get(orgId)!;
        orgSet.delete(userId);
        if (orgSet.size === 0) {
          onlineUsers.delete(orgId);
        }

        io.to(`org:${orgId}`).emit('presence:update', {
          onlineUserIds: Array.from(orgSet || []),
        });
      }
    });
  });
};
