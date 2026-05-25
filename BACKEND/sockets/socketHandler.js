import logger from '../utils/logger.js';
import RescueTimeline from '../models/RescueTimeline.js';
import Message from '../models/Message.js';
import { getDBStatus } from '../config/db.js';
import * as inMemoryDb from '../utils/inMemoryDb.js';
import { SOCKET_EVENTS } from '../constants/socketEvents.js';

export const handleSocketConnections = (io) => {
  io.on(SOCKET_EVENTS.CONNECTION, (socket) => {
    logger.info(`New client socket connected: ${socket.id}`);

    // Join user ID room on auth confirmation
    socket.on(SOCKET_EVENTS.JOIN_USER, (userId) => {
      socket.join(userId);
      logger.info(`Socket ${socket.id} joined user room: ${userId}`);
    });

    // Join rescue-specific room
    socket.on(SOCKET_EVENTS.JOIN_RESCUE, (rescueId) => {
      socket.join(rescueId);
      logger.info(`Socket ${socket.id} joined rescue room: ${rescueId}`);
    });

    // Leave rescue-specific room
    socket.on(SOCKET_EVENTS.LEAVE_RESCUE, (rescueId) => {
      socket.leave(rescueId);
      logger.info(`Socket ${socket.id} left rescue room: ${rescueId}`);
    });

    // Handle incoming chat messages
    socket.on(SOCKET_EVENTS.CHAT_MESSAGE_SEND, async (data) => {
      const { rescueId, text, sender, senderId, role, timestamp } = data;
      if (!rescueId || !text) return;

      const messageObj = {
        rescueId,
        senderId: senderId || socket.id,
        senderRole: role || 'citizen',
        senderName: sender || 'Anonymous',
        message: text,
        createdAt: timestamp || new Date().toISOString(),
      };

      try {
        const useInMemory = !getDBStatus();
        if (useInMemory) {
          // Push to in-memory generic store if DB is down
          messageObj._id = 'msg_' + Date.now();
          if (!inMemoryDb.messages) inMemoryDb.messages = [];
          inMemoryDb.messages.push(messageObj);
        } else {
          const newMsg = await Message.create(messageObj);
          messageObj._id = newMsg._id;
        }
      } catch (err) {
        logger.error(`Error saving socket chat message to DB: ${err.message}`);
      }

      // Broadcast the message to all clients in the rescue room
      io.to(rescueId).emit(SOCKET_EVENTS.CHAT_MESSAGE_RECEIVED, {
        _id: messageObj._id,
        text: messageObj.message,
        sender: messageObj.senderName,
        senderId: messageObj.senderId,
        role: messageObj.senderRole,
        timestamp: messageObj.createdAt,
      });
      // Trigger general update event for timeline or active indicators
      io.to(rescueId).emit(SOCKET_EVENTS.RESCUE_UPDATED, { rescueId });
    });

    // Handle live volunteer location broadcasts
    socket.on(SOCKET_EVENTS.VOLUNTEER_LOCATION_UPDATE, (data) => {
      const { volunteerId, coordinates, name } = data;
      if (!volunteerId || !coordinates) return;

      logger.info(`Volunteer ${name || volunteerId} location update: ${coordinates}`);
      // Broadcast location change to all listening clients (e.g., live map)
      io.emit(SOCKET_EVENTS.VOLUNTEER_LOCATION_BROADCAST, { volunteerId, coordinates, name });
    });

    socket.on(SOCKET_EVENTS.DISCONNECT, () => {
      logger.info(`Socket disconnected: ${socket.id}`);
    });
  });
};
