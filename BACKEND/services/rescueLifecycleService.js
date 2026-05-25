import RescueCase from '../models/RescueCase.js';
import RescueTimeline from '../models/RescueTimeline.js';
import AuditLog from '../models/AuditLog.js';
import { getDBStatus } from '../config/db.js';
import * as inMemoryDb from '../utils/inMemoryDb.js';
import { SOCKET_EVENTS } from '../constants/socketEvents.js';
import logger from '../utils/logger.js';

export const validateTransition = (currentStatus, nextStatus) => {
  const matrix = {
    'pending': ['assigned'],
    'assigned': ['on_the_way'],
    'on_the_way': ['rescued'],
    'rescued': ['treatment', 'sheltered'],
    'treatment': ['safe', 'sheltered'],
    'sheltered': ['safe', 'adopted'],
    'safe': ['adopted'],
    'adopted': []
  };

  const allowed = matrix[currentStatus] || [];
  return allowed.includes(nextStatus);
};

export const eventForStatus = (status) => {
  switch (status) {
    case 'assigned': return 'assigned';
    case 'on_the_way': return 'on_the_way';
    case 'rescued': return 'rescued';
    case 'treatment': return 'treatment';
    case 'sheltered': return 'sheltered';
    case 'safe': return 'safe';
    default: return 'custom';
  }
};

/**
 * Update the status of a rescue and automate side-effects.
 * @param {string} rescueId - Rescue ID
 * @param {string} newStatus - The new status
 * @param {Object} user - User performing the action (req.user)
 * @param {Object} io - Socket.io instance
 * @param {string} descriptionOverride - Optional manual description
 * @returns {Promise<{rescue, timeline}>}
 */
export const updateRescueStatusService = async (rescueId, newStatus, user, io, descriptionOverride = null) => {
  const allowed = ['assigned', 'on_the_way', 'rescued', 'treatment', 'safe', 'sheltered', 'adopted'];
  if (!allowed.includes(newStatus)) {
    throw new Error('Invalid status');
  }

  const useInMemory = !getDBStatus();

  if (useInMemory) {
    const rescue = inMemoryDb.rescueCases.find((c) => c._id === rescueId && !c.isDeleted);
    if (!rescue) throw new Error('Rescue case not found');
    
    if (!validateTransition(rescue.status, newStatus)) {
      throw new Error(`Invalid status transition from '${rescue.status}' to '${newStatus}'`);
    }

    if (newStatus === 'assigned' && !rescue.assignedVolunteer) {
      rescue.assignedVolunteer = user._id;
    }

    rescue.status = newStatus;

    const timeline = {
      _id: 't_' + Date.now(),
      rescueCase: rescueId,
      eventType: eventForStatus(newStatus),
      description: descriptionOverride || `Status updated to ${newStatus} by ${user.name}.`,
      author: user.name,
      createdAt: new Date(),
    };
    inMemoryDb.rescueTimelines.push(timeline);

    if (io) {
      const eventName = newStatus === 'assigned' ? SOCKET_EVENTS.RESCUE_CLAIMED : SOCKET_EVENTS.RESCUE_STATUS_UPDATED;
      io.to(rescueId).emit(eventName, { rescue, timeline });
      io.to(rescueId).emit(SOCKET_EVENTS.RESCUE_UPDATED, { rescueId });
      io.emit(SOCKET_EVENTS.RESCUE_UPDATED, { rescue, timeline });
    }

    return { rescue, timeline };
  }

  // MongoDB path
  const rescue = await RescueCase.findById(rescueId);
  if (!rescue || rescue.isDeleted) {
    throw new Error('Rescue case not found');
  }

  if (!validateTransition(rescue.status, newStatus)) {
    throw new Error(`Invalid status transition from '${rescue.status}' to '${newStatus}'`);
  }

  if (newStatus === 'assigned' && !rescue.assignedVolunteer) {
    rescue.assignedVolunteer = user._id;
  }

  rescue.status = newStatus;
  await rescue.save();

  const timeline = await RescueTimeline.create({
    rescueCase: rescue._id,
    eventType: eventForStatus(newStatus),
    description: descriptionOverride || `Status updated to ${newStatus} by ${user.name}.`,
    author: user.name,
  });

  await AuditLog.create({
    user: user._id,
    username: user.name,
    action: 'RESCUE_STATUS_UPDATED',
    details: `Rescue ${rescueId} -> ${newStatus}`,
    targetId: rescueId,
  });

  if (io) {
    const populated = await RescueCase.findById(rescueId)
      .populate('reporter', 'name avatar')
      .populate('assignedVolunteer', 'name avatar availability phone');
    
    const eventName = newStatus === 'assigned' ? SOCKET_EVENTS.RESCUE_CLAIMED : SOCKET_EVENTS.RESCUE_STATUS_UPDATED;
    io.to(rescueId).emit(eventName, { rescue: populated, timeline });
    io.to(rescueId).emit(SOCKET_EVENTS.RESCUE_UPDATED, { rescueId });
    io.emit(SOCKET_EVENTS.RESCUE_UPDATED, { rescue: populated, timeline });

    // Emit a notification broadcast
    io.emit(SOCKET_EVENTS.NOTIFICATION_CREATED, {
      title: 'Rescue Update',
      message: `Case ${populated.title} is now ${newStatus.replace('_', ' ')}`,
      type: 'info',
      rescueId: rescueId
    });
  }

  return { rescue, timeline };
};
