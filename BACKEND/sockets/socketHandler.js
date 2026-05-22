import logger from '../utils/logger.js';

export const handleSocketConnections = (io) => {
  io.on('connection', (socket) => {
    logger.info(`New client socket connected: ${socket.id}`);

    // Join user ID room on auth confirmation
    socket.on('join_user', (userId) => {
      socket.join(userId);
      logger.info(`Socket ${socket.id} joined user room: ${userId}`);
    });

    socket.on('disconnect', () => {
      logger.info(`Socket disconnected: ${socket.id}`);
    });
  });
};
