import RescueCase from '../models/RescueCase.js';
import RescueTimeline from '../models/RescueTimeline.js';
import AuditLog from '../models/AuditLog.js';
import User from '../models/User.js';
import { getDBStatus } from '../config/db.js';
import * as inMemoryDb from '../utils/inMemoryDb.js';

// Helper to calculate Priority Score
const calculatePriority = (severity, upvotesCount = 1) => {
  let score = 0;
  switch (severity) {
    case 'critical': score += 8; break;
    case 'high': score += 6; break;
    case 'medium': score += 4; break;
    case 'low': score += 2; break;
  }
  // Upvotes increase priority weight
  score += Math.min(5, upvotesCount * 0.5);
  return score;
};

// @desc    Report a stray emergency
// @route   POST /api/v1/rescues
// @access  Private (Citizen or Admin)
export const reportRescue = async (req, res, next) => {
  try {
    const { title, animalType, injurySeverity, description, coordinates, address, photos } = req.body;
    const useInMemory = !getDBStatus();
    const priorityScore = calculatePriority(injurySeverity || 'medium', 1);

    if (useInMemory) {
      const caseId = 'case_id_' + Date.now();
      const newCase = {
        _id: caseId,
        title,
        animalType,
        injurySeverity: injurySeverity || 'medium',
        description,
        location: { type: 'Point', coordinates },
        address: address || '',
        photos: photos && photos.length > 0 ? photos : ['https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&w=500&q=80'],
        reporter: req.user._id,
        assignedVolunteer: null,
        priorityScore,
        upvotes: [req.user._id],
        status: 'pending',
        isDeleted: false,
        createdAt: new Date(),
      };

      inMemoryDb.rescueCases.push(newCase);

      // Create timeline record
      const timelineId = 't_' + Date.now();
      inMemoryDb.rescueTimelines.push({
        _id: timelineId,
        rescueCase: caseId,
        eventType: 'reported',
        description: `Stray animal emergency reported by citizen ${req.user.name}.`,
        author: req.user.name,
        createdAt: new Date(),
      });

      inMemoryDb.auditLogs.push({
        _id: 'audit_' + Date.now(),
        action: 'RESCUE_REPORTED',
        details: `Rescue case ${title} reported (In-Memory)`,
        targetId: caseId,
        createdAt: new Date(),
      });

      return res.status(201).json({ success: true, data: newCase });
    }

    // MONGODB Mode
    const rescueCase = await RescueCase.create({
      title,
      animalType,
      injurySeverity: injurySeverity || 'medium',
      description,
      location: { type: 'Point', coordinates },
      address: address || '',
      photos: photos && photos.length > 0 ? photos : ['https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&w=500&q=80'],
      reporter: req.user._id,
      priorityScore,
      upvotes: [req.user._id],
    });

    // Create Timeline
    await RescueTimeline.create({
      rescueCase: rescueCase._id,
      eventType: 'reported',
      description: `Stray animal emergency reported by citizen ${req.user.name}.`,
      author: req.user.name,
    });

    await AuditLog.create({
      user: req.user._id,
      username: req.user.name,
      action: 'RESCUE_REPORTED',
      details: `Rescue case ${rescueCase.title} reported (MongoDB)`,
      targetId: rescueCase._id.toString(),
    });

    // Trigger Socket.io broadcast to all connected clients (Phase 4 Event Emission)
    const io = req.app.get('io');
    if (io) {
      io.emit('rescue_created', {
        caseId: rescueCase._id,
        title: rescueCase.title,
        severity: rescueCase.injurySeverity,
        location: rescueCase.location.coordinates
      });
    }

    res.status(201).json({ success: true, data: rescueCase });
  } catch (err) {
    next(err);
  }
};

// @desc    Get all rescue cases (sorted by priority score)
// @route   GET /api/v1/rescues
// @access  Public
export const getRescues = async (req, res, next) => {
  try {
    const { status, animalType } = req.query;
    const useInMemory = !getDBStatus();

    if (useInMemory) {
      let list = [...inMemoryDb.rescueCases].filter(c => !c.isDeleted);
      if (status) {
        list = list.filter(c => c.status === status);
      }
      if (animalType) {
        list = list.filter(c => c.animalType === animalType);
      }
      // Sort by priorityScore desc
      list.sort((a, b) => b.priorityScore - a.priorityScore);
      return res.status(200).json({ success: true, count: list.length, data: list });
    }

    // MONGODB Mode
    let query = { isDeleted: false };
    if (status) query.status = status;
    if (animalType) query.animalType = animalType;

    const rescues = await RescueCase.find(query)
      .populate('reporter', 'name avatar')
      .populate('assignedVolunteer', 'name avatar availability phone')
      .sort({ priorityScore: -1 });

    res.status(200).json({ success: true, count: rescues.length, data: rescues });
  } catch (err) {
    next(err);
  }
};

// @desc    Get single rescue case details and its timeline events
// @route   GET /api/v1/rescues/:id
// @access  Public
export const getRescueDetails = async (req, res, next) => {
  try {
    const { id } = req.params;
    const useInMemory = !getDBStatus();

    if (useInMemory) {
      const rescue = inMemoryDb.rescueCases.find(c => c._id === id && !c.isDeleted);
      if (!rescue) {
        return res.status(404).json({ success: false, error: 'Rescue case not found' });
      }
      const timeline = inMemoryDb.rescueTimelines.filter(t => t.rescueCase === id);
      return res.status(200).json({ success: true, data: rescue, timeline });
    }

    // MONGODB Mode
    const rescue = await RescueCase.findById(id)
      .populate('reporter', 'name avatar phone')
      .populate('assignedVolunteer', 'name avatar phone availability');

    if (!rescue || rescue.isDeleted) {
      return res.status(404).json({ success: false, error: 'Rescue case not found' });
    }

    const timeline = await RescueTimeline.find({ rescueCase: id }).sort({ createdAt: 1 });

    res.status(200).json({ success: true, data: rescue, timeline });
  } catch (err) {
    next(err);
  }
};

// @desc    Upvote/verify an urgent case
// @route   PUT /api/v1/rescues/:id/upvote
// @access  Private
export const upvoteRescue = async (req, res, next) => {
  try {
    const { id } = req.params;
    const useInMemory = !getDBStatus();

    if (useInMemory) {
      const rescue = inMemoryDb.rescueCases.find(c => c._id === id && !c.isDeleted);
      if (!rescue) {
        return res.status(404).json({ success: false, error: 'Rescue case not found' });
      }

      const hasUpvoted = rescue.upvotes.includes(req.user._id);
      if (hasUpvoted) {
        // Remove upvote
        rescue.upvotes = rescue.upvotes.filter(uid => uid !== req.user._id);
      } else {
        // Add upvote
        rescue.upvotes.push(req.user._id);
      }

      // Recalculate priority
      rescue.priorityScore = calculatePriority(rescue.injurySeverity, rescue.upvotes.length);

      return res.status(200).json({ success: true, data: rescue });
    }

    // MONGODB Mode
    const rescue = await RescueCase.findById(id);
    if (!rescue || rescue.isDeleted) {
      return res.status(404).json({ success: false, error: 'Rescue case not found' });
    }

    const hasUpvoted = rescue.upvotes.includes(req.user._id);
    if (hasUpvoted) {
      rescue.upvotes = rescue.upvotes.filter(uid => uid.toString() !== req.user._id.toString());
    } else {
      rescue.upvotes.push(req.user._id);
    }

    // Update Priority Score
    rescue.priorityScore = calculatePriority(rescue.injurySeverity, rescue.upvotes.length);
    await rescue.save();

    res.status(200).json({ success: true, data: rescue });
  } catch (err) {
    next(err);
  }
};
