import User from '../models/User.js';
import RescueCase from '../models/RescueCase.js';
import AdoptionPet from '../models/AdoptionPet.js';
import RescueTimeline from '../models/RescueTimeline.js';
import AuditLog from '../models/AuditLog.js';
import { getDBStatus } from '../config/db.js';
import * as inMemoryDb from '../utils/inMemoryDb.js';

import { updateRescueStatusService } from '../services/rescueLifecycleService.js';
import { SOCKET_EVENTS } from '../constants/socketEvents.js';

// @route   PUT /api/v1/volunteers/availability
// @desc    Set volunteer online/offline
// @access  Private (volunteer/admin)
export const setAvailability = async (req, res, next) => {
  try {
    const { availability } = req.body;
    if (!['online', 'offline'].includes(availability)) {
      return res.status(400).json({ success: false, error: 'Invalid availability' });
    }

    const useInMemory = !getDBStatus();

    if (useInMemory) {
      const user = inMemoryDb.users.find((u) => u._id === req.user._id);
      if (!user) return res.status(404).json({ success: false, error: 'User not found' });
      user.availability = availability;

      return res.status(200).json({ success: true, data: { _id: user._id, availability } });
    }

    const updated = await User.findByIdAndUpdate(
      req.user._id,
      { availability },
      { new: true }
    );

    await AuditLog.create({
      user: req.user._id,
      username: req.user.name,
      action: 'VOLUNTEER_AVAILABILITY_SET',
      details: `Availability set to ${availability}`,
    });

    const io = req.app.get('io');
    if (io) {
      io.to(req.user._id.toString()).emit('volunteer:availability', {
        userId: req.user._id,
        availability,
      });
      io.emit('volunteer:availability_broadcast', {
        userId: req.user._id,
        availability,
      });
    }

    res.status(200).json({ success: true, data: updated });
  } catch (err) {
    next(err);
  }
};

// @route   POST /api/v1/volunteers/:rescueId/claim
// @desc    Claim/assign a rescue case to a volunteer
// @access  Private (volunteer/admin)
export const claimRescue = async (req, res, next) => {
  try {
    const { rescueId } = req.params;
    const io = req.app.get('io');
    
    // updateRescueStatusService automatically handles the "assigned" logic (setting assignedVolunteer)
    // if we pass 'assigned' as the new status.
    const result = await updateRescueStatusService(
      rescueId, 
      'assigned', 
      req.user, 
      io, 
      `Mission claimed by ${req.user.name}.`
    );

    res.status(200).json({ success: true, data: result });
  } catch (err) {
    if (err.message === 'Rescue case not found') {
      return res.status(404).json({ success: false, error: err.message });
    }
    if (err.message.startsWith('Invalid status')) {
      return res.status(400).json({ success: false, error: err.message });
    }
    next(err);
  }
};

// @route   PUT /api/v1/volunteers/:rescueId/status
// @desc    Update rescue mission status for a volunteer
// @access  Private (volunteer/admin)
export const updateRescueStatus = async (req, res, next) => {
  try {
    const { rescueId } = req.params;
    const { status } = req.body;
    const io = req.app.get('io');

    // First fetch the rescue quickly to check authorization
    const useInMemory = !getDBStatus();
    let rescue;
    if (useInMemory) {
      rescue = inMemoryDb.rescueCases.find((c) => c._id === rescueId && !c.isDeleted);
    } else {
      rescue = await RescueCase.findById(rescueId);
    }

    if (!rescue) {
      return res.status(404).json({ success: false, error: 'Rescue case not found' });
    }

    // Volunteers can advance any status; admins have full access
    if (req.user.role !== 'admin') {
      if (['on_the_way', 'rescued', 'treatment', 'sheltered', 'safe', 'adopted'].includes(status)) {
        if (!rescue.assignedVolunteer || rescue.assignedVolunteer.toString() !== req.user._id.toString()) {
          return res.status(403).json({ success: false, error: 'Only the assigned volunteer can update mission status' });
        }
      }
    }

    const result = await updateRescueStatusService(rescueId, status, req.user, io);
    res.status(200).json({ success: true, data: result });
  } catch (err) {
    if (err.message === 'Rescue case not found') {
      return res.status(404).json({ success: false, error: err.message });
    }
    if (err.message.startsWith('Invalid status')) {
      return res.status(400).json({ success: false, error: err.message });
    }
    next(err);
  }
};


// @route   GET /api/v1/volunteers/me/queue
// @desc    Fetch pending nearby rescues for volunteer (uses radius)
// @access  Private
export const getNearbyQueue = async (req, res, next) => {
  try {
    const useInMemory = !getDBStatus();

    if (useInMemory) {
      const volunteer = inMemoryDb.users.find((u) => u._id === req.user._id);
      const pending = inMemoryDb.rescueCases.filter((c) => !c.isDeleted && c.status === 'pending');
      return res.status(200).json({ success: true, data: pending });
    }

    // Simple implementation: pending cases only; geospatial filtering can be added later.
    const pending = await RescueCase.find({ isDeleted: false, status: 'pending' })
      .populate('reporter', 'name avatar')
      .populate('assignedVolunteer', 'name avatar availability phone');

    res.status(200).json({ success: true, count: pending.length, data: pending });
  } catch (err) {
    next(err);
  }
};

// @route   GET /api/v1/volunteers/me/missions
// @desc    Fetch assigned missions for the logged-in volunteer
// @access  Private
export const getAssignedMissions = async (req, res, next) => {
  try {
    const useInMemory = !getDBStatus();

    if (useInMemory) {
      const missions = inMemoryDb.rescueCases.filter((c) => c.assignedVolunteer === req.user._id && !c.isDeleted);
      return res.status(200).json({ success: true, count: missions.length, data: missions });
    }

    const missions = await RescueCase.find({
      isDeleted: false,
      assignedVolunteer: req.user._id,
    })
      .populate('reporter', 'name avatar phone')
      .populate('assignedVolunteer', 'name avatar availability phone');

    res.status(200).json({ success: true, count: missions.length, data: missions });
  } catch (err) {
    next(err);
  }
};

// @route   GET /api/v1/volunteers/me/stats
// @desc    Volunteer stats
// @access  Private
export const getVolunteerStats = async (req, res, next) => {
  try {
    // Minimal stats derivation from missions
    const useInMemory = !getDBStatus();

    if (useInMemory) {
      const completed = inMemoryDb.rescueCases.filter((c) => c.assignedVolunteer === req.user._id && ['safe', 'rescued', 'treatment'].includes(c.status));
      return res.status(200).json({
        success: true,
        data: {
          rescuesCompleted: completed.length,
          streak: req.user.streak || 0,
          badges: req.user.badges || [],
          responseTimeMinutes: 0,
        },
      });
    }

    const missions = await RescueCase.find({ assignedVolunteer: req.user._id, isDeleted: false });
    const rescuesCompleted = missions.filter((m) => ['safe', 'sheltered', 'rescued'].includes(m.status)).length;

    res.status(200).json({
      success: true,
      data: {
        rescuesCompleted,
        streak: req.user.streak || 0,
        badges: req.user.badges || [],
        responseTimeMinutes: 0,
      },
    });
  } catch (err) {
    next(err);
  }
};
// @route   POST /api/v1/volunteers/:rescueId/intake
// @desc    Complete intake: mark rescued→sheltered and create AdoptionPet record
// @access  Private (volunteer/admin)
export const intakeRescue = async (req, res, next) => {
  try {
    const { rescueId } = req.params;
    const io = req.app.get('io');
    const useInMemory = !getDBStatus();

    let rescue;
    if (useInMemory) {
      rescue = inMemoryDb.rescueCases.find((c) => c._id === rescueId && !c.isDeleted);
    } else {
      rescue = await RescueCase.findById(rescueId);
    }

    if (!rescue || rescue.isDeleted) {
      return res.status(404).json({ success: false, error: 'Rescue case not found' });
    }

    if (rescue.status !== 'rescued') {
      return res.status(400).json({
        success: false,
        error: `Rescue must be in 'rescued' status for intake. Current: '${rescue.status}'`,
      });
    }

    // Advance status to sheltered
    const { timeline } = await updateRescueStatusService(
      rescueId,
      'sheltered',
      req.user,
      io,
      `Intake completed by volunteer ${req.user.name}.`
    );

    const passportId = 'PASS-' + rescue._id;

    if (useInMemory) {
      if (!inMemoryDb.adoptionPets.find((p) => p.medicalPassportId === passportId)) {
        inMemoryDb.adoptionPets.push({
          _id: 'pet_' + Date.now(),
          name: rescue.title,
          animalType: rescue.animalType,
          breed: 'Mixed Breed',
          age: 'Unknown',
          story: rescue.description,
          photo: rescue.photos?.[0] || '',
          shelter: req.user._id,
          medicalPassportId: passportId,
          qrCodeUrl: passportId + '-QR',
          vaccinations: [],
          healthLog: [],
          status: 'available',
        });
      }
      return res.status(200).json({ success: true, data: { rescue, timeline } });
    }

    // Avoid duplicate passport creation
    const existing = await AdoptionPet.findOne({ medicalPassportId: passportId });
    if (!existing) {
      await AdoptionPet.create({
        name: rescue.title,
        animalType: rescue.animalType,
        breed: 'Mixed Breed',
        age: 'Unknown',
        story: rescue.description,
        photo: rescue.photos?.[0] || '',
        shelter: req.user._id,
        medicalPassportId: passportId,
        qrCodeUrl: passportId + '-QR',
        vaccinations: [],
        healthLog: [],
        status: 'available',
      });
    }

    if (io) {
      io.emit('rescue:intake_completed', { rescueId: rescue._id, medicalPassportId: passportId });
    }

    res.status(200).json({ success: true, data: { rescue, timeline } });
  } catch (err) {
    next(err);
  }
};
