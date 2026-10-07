import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuth } from './AuthContext';
import { useToast } from './ToastContext';
import { useQueryClient } from '@tanstack/react-query';

interface SocketContextType {
  socket: Socket | null;
  isConnected: boolean;
  onlineUserIds: string[];
  joinProject: (projectId: string) => void;
  leaveProject: (projectId: string) => void;
}

const SocketContext = createContext<SocketContextType | undefined>(undefined);

export const SocketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { token, isAuthenticated } = useAuth();
  const { info } = useToast();
  const queryClient = useQueryClient();
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [onlineUserIds, setOnlineUserIds] = useState<string[]>([]);
  const currentProjectRef = useRef<string | null>(null);

  useEffect(() => {
    if (!isAuthenticated || !token) {
      if (socket) {
        socket.disconnect();
        setSocket(null);
        setIsConnected(false);
      }
      return;
    }

    const socketUrl = import.meta.env.VITE_SOCKET_URL || window.location.origin;

    const socketInstance = io(socketUrl, {
      auth: { token },
      transports: ['websocket', 'polling'],
      reconnectionAttempts: 10,
      reconnectionDelay: 1500,
    });

    socketInstance.on('connect', () => {
      setIsConnected(true);
      // Re-join active project if reconnected
      if (currentProjectRef.current) {
        socketInstance.emit('project:join', currentProjectRef.current);
      }
    });

    socketInstance.on('disconnect', () => {
      setIsConnected(false);
    });

    socketInstance.on('presence:update', (data: { onlineUserIds: string[] }) => {
      if (Array.isArray(data.onlineUserIds)) {
        setOnlineUserIds(data.onlineUserIds);
      }
    });

    // Real-time task board sync
    socketInstance.on('task:created', (task: any) => {
      queryClient.invalidateQueries({ queryKey: ['tasks', task.project] });
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      queryClient.invalidateQueries({ queryKey: ['analytics'] });
    });

    socketInstance.on('task:updated', (task: any) => {
      queryClient.invalidateQueries({ queryKey: ['tasks', task.project] });
      queryClient.invalidateQueries({ queryKey: ['task', task._id] });
      queryClient.invalidateQueries({ queryKey: ['projects'] });
    });

    socketInstance.on('task:moved', (payload: any) => {
      queryClient.invalidateQueries({ queryKey: ['tasks', payload.task?.project || currentProjectRef.current] });
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      queryClient.invalidateQueries({ queryKey: ['analytics'] });
    });

    socketInstance.on('task:deleted', () => {
      if (currentProjectRef.current) {
        queryClient.invalidateQueries({ queryKey: ['tasks', currentProjectRef.current] });
      }
      queryClient.invalidateQueries({ queryKey: ['projects'] });
    });

    socketInstance.on('comment:new', (comment: any) => {
      queryClient.invalidateQueries({ queryKey: ['comments', comment.task] });
    });

    socketInstance.on('notification:new', (notification: any) => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      info(`🔔 ${notification.title}: ${notification.message}`);
    });

    socketInstance.on('activity:logged', () => {
      if (currentProjectRef.current) {
        queryClient.invalidateQueries({ queryKey: ['activity', currentProjectRef.current] });
      }
      queryClient.invalidateQueries({ queryKey: ['activity', 'org'] });
    });

    setSocket(socketInstance);

    return () => {
      socketInstance.disconnect();
    };
  }, [isAuthenticated, token, queryClient, info]);

  const joinProject = useCallback(
    (projectId: string) => {
      currentProjectRef.current = projectId;
      if (socket && isConnected) {
        socket.emit('project:join', projectId);
      }
    },
    [socket, isConnected]
  );

  const leaveProject = useCallback(
    (projectId: string) => {
      if (currentProjectRef.current === projectId) {
        currentProjectRef.current = null;
      }
      if (socket && isConnected) {
        socket.emit('project:leave', projectId);
      }
    },
    [socket, isConnected]
  );

  return (
    <SocketContext.Provider
      value={{
        socket,
        isConnected,
        onlineUserIds,
        joinProject,
        leaveProject,
      }}
    >
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
};
