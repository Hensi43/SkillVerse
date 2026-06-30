import http from 'http';
import { Server } from 'socket.io';
import { app } from './app';
import { config } from './config/env';
import { connectDatabase } from './config/db';
import { Message } from './modules/chat/entities/message';
import { logger } from './core/utils/logger';

const server = http.createServer(app);

// Initialize Socket.io with permissive CORS for local dev testing
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

// Real-Time Socket Connection Handlers
io.on('connection', (socket) => {
  logger.info(`Socket client connected: ${socket.id}`);

  // Client joins a specific room corresponding to a job matching thread
  socket.on('join_chat', async ({ chatId }) => {
    socket.join(`chat:${chatId}`);
    logger.info(`Socket client ${socket.id} joined chat room: chat:${chatId}`);
    
    // Auto-fetch and return last 50 messages for chat history
    try {
      const history = await Message.find({ chatId })
        .sort({ createdAt: 1 })
        .limit(50);
      
      socket.emit('chat_history', { chatId, history });
    } catch (err) {
      logger.error('Failed to retrieve chat logs:', err);
    }
  });

  // Client dispatches a text or voice message
  socket.on('send_message', async ({ chatId, senderId, content, messageType }) => {
    try {
      const message = new Message({
        chatId,
        senderId,
        content,
        messageType: messageType || 'text',
        sentAt: new Date()
      });

      await message.save();

      // Broadcast message to everyone in the room (including sender to confirm receipt)
      io.to(`chat:${chatId}`).emit('new_message', message);
      logger.info(`[CHAT ROOM ${chatId}] Message sent by ${senderId} (type: ${messageType})`);
    } catch (err) {
      logger.error('Socket message save failed:', err);
      socket.emit('error_alert', { message: 'Message delivery failed.' });
    }
  });

  socket.on('disconnect', () => {
    logger.info(`Socket client disconnected: ${socket.id}`);
  });
});

const startServer = async () => {
  // Boot MongoDB connection first
  await connectDatabase();

  server.listen(config.port, () => {
    logger.info(`\n======================================================`);
    logger.info(`⚡️ [SkillVerse Server] Running on http://localhost:${config.port}`);
    logger.info(`⚡️ [Socket.io Gateway] Ready for WS handshakes`);
    logger.info(`======================================================\n`);
  });
};

startServer().catch((error) => {
  logger.error('Server failed to start:', error);
  process.exit(1);
});
