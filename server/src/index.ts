import http from 'http';
import dotenv from 'dotenv';
dotenv.config();

import { Server as SocketIOServer } from 'socket.io';
import app from './app.js';
import { connectDB } from './config/db.js';
import { socketAuthMiddleware } from './sockets/socketAuth.js';
import { registerSocketHandlers } from './sockets/socketHandlers.js';
import { setSocketIO } from './services/socket.service.js';

const PORT = process.env.PORT || 5001;
const server = http.createServer(app);

// Initialize Socket.IO
const io = new SocketIOServer(server, {
  cors: {
    origin: [
      process.env.CLIENT_URL || 'http://localhost:5173',
      'http://localhost:3000',
      'http://127.0.0.1:5173',
    ],
    credentials: true,
  },
});

// Attach socket authentication and event handlers
io.use(socketAuthMiddleware as any);
registerSocketHandlers(io);
setSocketIO(io);

// Graceful startup
const startServer = async () => {
  try {
    await connectDB();

    server.listen(PORT, () => {
      console.log(`===================================================`);
      console.log(`🚀 OpsForge Backend Server running on port ${PORT}`);
      console.log(`📡 Socket.IO Real-Time Engine attached and active`);
      console.log(`📡 Health Check: http://localhost:${PORT}/api/health`);
      console.log(`🔒 Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`===================================================`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();

export { server, io };
