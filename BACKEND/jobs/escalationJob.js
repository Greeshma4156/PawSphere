import RescueCase from '../models/RescueCase.js';
import RescueTimeline from '../models/RescueTimeline.js';
import AuditLog from '../models/AuditLog.js';
import * as inMemoryDb from '../utils/inMemoryDb.js';
import { getDBStatus } from '../config/db.js';
import { SOCKET_EVENTS } from '../constants/socketEvents.js';

// Helper to determine if case is stale (no updates in > 30 minutes)
const isStale = (updatedAt) => {
  const thirtyMinsAgo = Date.now() - 30 * 60 * 1000;
  return new Date(updatedAt).getTime() < thirtyMinsAgo;
};

const processEscalation = async (rescue, useInMemory, io) => {
  const previousScore = rescue.priorityScore || 0;
  
  if (useInMemory) {
    rescue.priorityScore = previousScore + 5;
    rescue.updatedAt = new Date();
    
    const timeline = {
      _id: 't_' + Date.now(),
      rescueCase: rescue._id,
      eventType: 'custom',
      description: 'System automatically escalated case priority due to inactivity.',
      author: 'System',
      createdAt: new Date(),
    };
    inMemoryDb.rescueTimelines.push(timeline);

    if (io) {
      io.emit(SOCKET_EVENTS.RESCUE_UPDATED, { rescue, timeline });
      io.emit(SOCKET_EVENTS.NOTIFICATION_CREATED, {
        title: 'Emergency Escalated',
        message: `Rescue "${rescue.title}" priority increased to ${rescue.priorityScore} due to delays.`,
        type: 'error',
        rescueId: rescue._id,
      });
    }
    return;
  }

  // MongoDB mode
  rescue.priorityScore = previousScore + 5;
  await rescue.save();

  const timeline = await RescueTimeline.create({
    rescueCase: rescue._id,
    eventType: 'custom',
    description: 'System automatically escalated case priority due to inactivity.',
    author: 'System',
  });

  await AuditLog.create({
    action: 'SYSTEM_ESCALATION',
    details: `Auto-escalated ${rescue._id} from ${previousScore} to ${rescue.priorityScore}`,
    targetId: rescue._id,
  });

  if (io) {
    io.emit(SOCKET_EVENTS.RESCUE_UPDATED, { rescue: rescue.toObject(), timeline });
    io.emit(SOCKET_EVENTS.NOTIFICATION_CREATED, {
      title: 'Emergency Escalated',
      message: `Rescue "${rescue.title}" priority increased to ${rescue.priorityScore} due to delays.`,
      type: 'error',
      rescueId: rescue._id,
    });
  }
};

export const runEscalationEngine = async (io) => {
  try {
    const useInMemory = !getDBStatus();
    console.log('[Escalation Engine] Running checks...');

    if (useInMemory) {
      const pendingCases = inMemoryDb.rescueCases.filter(c => c.status === 'pending' && !c.isDeleted);
      for (const rescue of pendingCases) {
        if (isStale(rescue.updatedAt || rescue.createdAt)) {
          await processEscalation(rescue, true, io);
        }
      }
      return;
    }

    // MongoDB mode
    const thirtyMinsAgo = new Date(Date.now() - 30 * 60 * 1000);
    const staleCases = await RescueCase.find({
      status: 'pending',
      isDeleted: false,
      updatedAt: { $lt: thirtyMinsAgo }
    });

    for (const rescue of staleCases) {
      await processEscalation(rescue, false, io);
    }

  } catch (error) {
    console.error('[Escalation Engine] Error:', error);
  }
};
