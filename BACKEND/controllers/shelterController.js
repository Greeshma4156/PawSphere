import Shelter from '../models/Shelter.js';
import RescueCase from '../models/RescueCase.js';
import AdoptionPet from '../models/AdoptionPet.js';
import AuditLog from '../models/AuditLog.js';
import * as inMemoryDb from '../utils/inMemoryDb.js';
import { getDBStatus } from '../config/db.js';
import { updateRescueStatusService } from '../services/rescueLifecycleService.js';
import { SOCKET_EVENTS } from '../constants/socketEvents.js';

// @route   GET /api/v1/shelters/me/capacity
// @desc    Get shelter capacity
// @access  Private
export const getCapacity = async (req, res, next) => {
  try {
    const useInMemory = !getDBStatus();
    if (useInMemory) {
      const shelter = inMemoryDb.shelters.find((s) => s.user === req.user._id);
      return res.status(200).json({ success: true, data: shelter?.capacity || { total: 0, occupied: 0 } });
    }

    const shelter = await Shelter.findOne({ user: req.user._id });
    if (!shelter) return res.status(404).json({ success: false, error: 'Shelter not found' });

    res.status(200).json({ success: true, data: shelter.capacity });
  } catch (err) {
    next(err);
  }
};

// @route   GET /api/v1/shelters/me/queue
// @desc    Incoming rescued queue (rescues marked as rescued)
// @access  Private
export const getIncomingQueue = async (req, res, next) => {
  try {
    const useInMemory = !getDBStatus();

    if (useInMemory) {
      const queue = inMemoryDb.rescueCases.filter((c) => !c.isDeleted && c.status === 'rescued');
      return res.status(200).json({ success: true, count: queue.length, data: queue });
    }

    const queue = await RescueCase.find({ isDeleted: false, status: 'rescued' })
      .populate('reporter', 'name avatar')
      .populate('assignedVolunteer', 'name avatar availability phone');

    res.status(200).json({ success: true, count: queue.length, data: queue });
  } catch (err) {
    next(err);
  }
};

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
      return res.status(400).json({ success: false, error: `Rescue case must be in 'rescued' status for intake, current status is '${rescue.status}'` });
    }

    // Process status update using the central service
    const { timeline } = await updateRescueStatusService(
      rescueId,
      'sheltered',
      req.user,
      io,
      `Shelter intake completed by ${req.user.name}.`
    );

    if (useInMemory) {
      if (!inMemoryDb.adoptionPets.find((p) => p.medicalPassportId === rescueId)) {
        inMemoryDb.adoptionPets.push({
          _id: 'pet_' + Date.now(),
          name: rescue.title,
          animalType: rescue.animalType,
          breed: 'Mixed Breed',
          age: 'Unknown',
          story: rescue.description,
          photo: rescue.photos?.[0] || '',
          shelter: req.user._id,
          medicalPassportId: 'PASS-' + rescue._id,
          qrCodeUrl: 'PASS-' + rescue._id + '-QR',
          vaccinations: [],
          healthLog: [],
          status: 'available',
        });
      }
      return res.status(200).json({ success: true, data: { rescue, timeline } });
    }

    // Update shelter capacity occupied
    await Shelter.findOneAndUpdate(
      { user: req.user._id },
      { $inc: { 'capacity.occupied': 1 } },
      { new: true }
    );

    const AdoptionPetDoc = await AdoptionPet.create({
      name: rescue.title,
      animalType: rescue.animalType,
      breed: 'Mixed Breed',
      age: 'Unknown',
      story: rescue.description,
      photo: rescue.photos?.[0] || '',
      shelter: req.user._id,
      medicalPassportId: 'PASS-' + rescue._id,
      qrCodeUrl: 'PASS-' + rescue._id + '-QR',
      vaccinations: [],
      healthLog: [],
      status: 'available',
    });

    if (io) {
      io.emit('rescue:intake_completed', {
        rescueId: rescue._id,
        medicalPassportId: AdoptionPetDoc.medicalPassportId,
      });
    }

    res.status(200).json({ success: true, data: { rescue, passport: AdoptionPetDoc } });
  } catch (err) {
    next(err);
  }
};

// @route   GET /api/v1/shelters/me/adoptions
// @desc    List adoptable pets
// @access  Private
export const getAdoptions = async (req, res, next) => {
  try {
    const useInMemory = !getDBStatus();
    if (useInMemory) {
      const pets = inMemoryDb.adoptionPets.filter((p) => p.shelter === req.user._id && p.status === 'available');
      return res.status(200).json({ success: true, count: pets.length, data: pets });
    }

    const pets = await AdoptionPet.find({ shelter: req.user._id, status: 'available' }).sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: pets.length, data: pets });
  } catch (err) {
    next(err);
  }
};

// @route   GET /api/v1/shelters/me/passports
// @desc    List medical passports
// @access  Private
export const getMedicalPassports = async (req, res, next) => {
  try {
    const useInMemory = !getDBStatus();
    if (useInMemory) {
      const pets = inMemoryDb.adoptionPets.filter((p) => p.shelter === req.user._id);
      return res.status(200).json({ success: true, count: pets.length, data: pets });
    }

    const pets = await AdoptionPet.find({ shelter: req.user._id }).sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: pets.length, data: pets });
  } catch (err) {
    next(err);
  }
};

// @route   GET /api/v1/shelters/me/fosters
// @desc    Foster management (simplified demo, uses adoptionPet status)
// @access  Private
export const getFosterRequests = async (req, res, next) => {
  try {
    const useInMemory = !getDBStatus();

    if (useInMemory) {
      // No foster model yet; return empty but actionable list would require backend model.
      return res.status(200).json({ success: true, count: 0, data: [] });
    }

    return res.status(200).json({ success: true, count: 0, data: [] });
  } catch (err) {
    next(err);
  }
};

