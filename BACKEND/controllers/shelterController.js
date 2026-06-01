import Shelter from '../models/Shelter.js';
import RescueCase from '../models/RescueCase.js';
import AdoptionPet from '../models/AdoptionPet.js';
import Foster from '../models/Foster.js';
import AuditLog from '../models/AuditLog.js';
import * as inMemoryDb from '../utils/inMemoryDb.js';
import { getDBStatus } from '../config/db.js';
import { updateRescueStatusService } from '../services/rescueLifecycleService.js';
import { SOCKET_EVENTS } from '../constants/socketEvents.js';

// @route   GET /api/v1/shelters/me/capacity
// @desc    Get shelter capacity
// @access  Private (volunteer, admin)
export const getCapacity = async (req, res, next) => {
  try {
    const useInMemory = !getDBStatus();
    if (useInMemory) {
      const shelter = inMemoryDb.shelters?.find((s) => s.user === req.user._id);
      return res.status(200).json({ success: true, data: shelter?.capacity || { total: 20, occupied: 0 } });
    }

    const shelter = await Shelter.findOne({ user: req.user._id });
    if (!shelter) {
      // Auto-create a shelter profile for this volunteer/admin if missing
      const newShelter = await Shelter.create({
        user: req.user._id,
        name: `${req.user.name}'s Shelter`,
        capacity: { total: 20, occupied: 0 },
      });
      return res.status(200).json({ success: true, data: newShelter.capacity });
    }

    res.status(200).json({ success: true, data: shelter.capacity });
  } catch (err) {
    next(err);
  }
};

// @route   GET /api/v1/shelters/me/queue
// @desc    Incoming rescued queue (rescues marked as rescued)
// @access  Private (volunteer, admin)
export const getIncomingQueue = async (req, res, next) => {
  try {
    const useInMemory = !getDBStatus();

    if (useInMemory) {
      const queue = (inMemoryDb.rescueCases || []).filter((c) => !c.isDeleted && c.status === 'rescued');
      return res.status(200).json({ success: true, count: queue.length, data: queue });
    }

    const queue = await RescueCase.find({ isDeleted: false, status: 'rescued' })
      .populate('reporter', 'name avatar')
      .populate('assignedVolunteer', 'name avatar availability phone')
      .sort({ priorityScore: -1, createdAt: 1 })
      .limit(20);

    res.status(200).json({ success: true, count: queue.length, data: queue });
  } catch (err) {
    next(err);
  }
};

// @route   POST /api/v1/shelters/:rescueId/intake
// @desc    Intake a rescued animal → creates medical passport
// @access  Private (volunteer, admin)
export const intakeRescue = async (req, res, next) => {
  try {
    const { rescueId } = req.params;
    const io = req.app.get('io');
    const useInMemory = !getDBStatus();

    let rescue;
    if (useInMemory) {
      rescue = (inMemoryDb.rescueCases || []).find((c) => c._id === rescueId && !c.isDeleted);
    } else {
      rescue = await RescueCase.findById(rescueId);
    }

    if (!rescue || rescue.isDeleted) {
      return res.status(404).json({ success: false, error: 'Rescue case not found' });
    }

    if (rescue.status !== 'rescued') {
      return res.status(400).json({
        success: false,
        error: `Rescue case must be in 'rescued' status for intake. Current status: '${rescue.status}'`,
      });
    }

    // Advance lifecycle status
    const { timeline } = await updateRescueStatusService(
      rescueId,
      'sheltered',
      req.user,
      io,
      `Shelter intake completed by ${req.user.name}.`
    );

    if (useInMemory) {
      const alreadyIntaked = (inMemoryDb.adoptionPets || []).find((p) => p.medicalPassportId === 'PASS-' + rescue._id);
      if (!alreadyIntaked) {
        inMemoryDb.adoptionPets = inMemoryDb.adoptionPets || [];
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

    // Update shelter capacity (auto-create shelter if missing)
    await Shelter.findOneAndUpdate(
      { user: req.user._id },
      { $inc: { 'capacity.occupied': 1 }, $setOnInsert: { name: `${req.user.name}'s Shelter`, 'capacity.total': 20 } },
      { new: true, upsert: true }
    );

    // Check if passport already exists to prevent duplicates
    const existingPassport = await AdoptionPet.findOne({ medicalPassportId: 'PASS-' + rescue._id });
    const adoptionPetDoc = existingPassport || await AdoptionPet.create({
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
        medicalPassportId: adoptionPetDoc.medicalPassportId,
      });
    }

    res.status(200).json({ success: true, data: { rescue, passport: adoptionPetDoc, timeline } });
  } catch (err) {
    next(err);
  }
};

// @route   GET /api/v1/shelters/me/adoptions
// @desc    List adoptable pets managed by this shelter user
// @access  Private (volunteer, admin)
export const getAdoptions = async (req, res, next) => {
  try {
    const useInMemory = !getDBStatus();
    if (useInMemory) {
      const pets = (inMemoryDb.adoptionPets || []).filter((p) => p.shelter === req.user._id && p.status === 'available');
      return res.status(200).json({ success: true, count: pets.length, data: pets });
    }

    const pets = await AdoptionPet.find({ shelter: req.user._id, status: { $in: ['available', 'pending_adoption'] } })
      .sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: pets.length, data: pets });
  } catch (err) {
    next(err);
  }
};

// @route   GET /api/v1/shelters/me/passports
// @desc    List all medical passports for pets intaked by this shelter user
// @access  Private (volunteer, admin)
export const getMedicalPassports = async (req, res, next) => {
  try {
    const useInMemory = !getDBStatus();
    if (useInMemory) {
      const pets = (inMemoryDb.adoptionPets || []).filter((p) => p.shelter === req.user._id);
      return res.status(200).json({ success: true, count: pets.length, data: pets });
    }

    const pets = await AdoptionPet.find({ shelter: req.user._id }).sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: pets.length, data: pets });
  } catch (err) {
    next(err);
  }
};

// @route   GET /api/v1/shelters/me/fosters
// @desc    Get all foster applications for pets at this shelter
// @access  Private (volunteer, admin)
export const getFosterRequests = async (req, res, next) => {
  try {
    const useInMemory = !getDBStatus();
    if (useInMemory) {
      return res.status(200).json({ success: true, count: 0, data: [] });
    }

    // Get all pets managed by this shelter user, then find foster applications for them
    const shelterPetIds = await AdoptionPet.find({ shelter: req.user._id }).distinct('_id');
    const fosters = await Foster.find({ pet: { $in: shelterPetIds } })
      .populate('pet', 'name animalType breed photo medicalPassportId')
      .populate('applicant', 'name email phone avatar')
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, count: fosters.length, data: fosters });
  } catch (err) {
    next(err);
  }
};

// @route   POST /api/v1/shelters/me/passports/:petId/log
// @desc    Add a health log entry to a pet's medical passport
// @access  Private (volunteer, admin)
export const addMedicalLog = async (req, res, next) => {
  try {
    const { petId } = req.params;
    const { notes, treatment } = req.body;
    const useInMemory = !getDBStatus();

    if (!notes) {
      return res.status(400).json({ success: false, error: 'Notes are required for a health log entry' });
    }

    if (useInMemory) {
      const pet = (inMemoryDb.adoptionPets || []).find((p) => p._id === petId);
      if (!pet) return res.status(404).json({ success: false, error: 'Pet not found' });
      pet.healthLog = pet.healthLog || [];
      pet.healthLog.push({ date: new Date(), notes, treatment: treatment || '' });
      return res.status(200).json({ success: true, data: pet });
    }

    const pet = await AdoptionPet.findOneAndUpdate(
      { _id: petId, shelter: req.user._id },
      { $push: { healthLog: { date: new Date(), notes, treatment: treatment || '' } } },
      { new: true }
    );

    if (!pet) {
      return res.status(404).json({ success: false, error: 'Pet not found or not under your shelter' });
    }

    res.status(200).json({ success: true, data: pet });
  } catch (err) {
    next(err);
  }
};

// @route   POST /api/v1/shelters/me/passports/:petId/vaccination
// @desc    Add a vaccination record to a pet's medical passport
// @access  Private (volunteer, admin)
export const addVaccination = async (req, res, next) => {
  try {
    const { petId } = req.params;
    const { name, date, status } = req.body;
    const useInMemory = !getDBStatus();

    if (!name || !date) {
      return res.status(400).json({ success: false, error: 'Vaccine name and date are required' });
    }

    if (useInMemory) {
      const pet = (inMemoryDb.adoptionPets || []).find((p) => p._id === petId);
      if (!pet) return res.status(404).json({ success: false, error: 'Pet not found' });
      pet.vaccinations = pet.vaccinations || [];
      pet.vaccinations.push({ name, date: new Date(date), status: status || 'completed' });
      return res.status(200).json({ success: true, data: pet });
    }

    const pet = await AdoptionPet.findOneAndUpdate(
      { _id: petId, shelter: req.user._id },
      { $push: { vaccinations: { name, date: new Date(date), status: status || 'completed' } } },
      { new: true }
    );

    if (!pet) {
      return res.status(404).json({ success: false, error: 'Pet not found or not under your shelter' });
    }

    res.status(200).json({ success: true, data: pet });
  } catch (err) {
    next(err);
  }
};

// @route   PATCH /api/v1/shelters/me/fosters/:fosterId/approve
// @desc    Approve a foster application
// @access  Private (volunteer, admin)
export const approveFoster = async (req, res, next) => {
  try {
    const { fosterId } = req.params;
    const { reviewNote } = req.body;
    const useInMemory = !getDBStatus();

    if (useInMemory) {
      return res.status(200).json({ success: true, message: 'Foster approved (demo mode)' });
    }

    const foster = await Foster.findByIdAndUpdate(
      fosterId,
      {
        status: 'approved',
        reviewNote: reviewNote || '',
        reviewedBy: req.user._id,
        reviewedAt: new Date(),
      },
      { new: true }
    ).populate('pet', 'name').populate('applicant', 'name email');

    if (!foster) {
      return res.status(404).json({ success: false, error: 'Foster application not found' });
    }

    // Mark pet as in foster (still "available" type but flagged)
    await AdoptionPet.findByIdAndUpdate(foster.pet._id, { status: 'pending_adoption' });

    res.status(200).json({ success: true, data: foster });
  } catch (err) {
    next(err);
  }
};

// @route   PATCH /api/v1/shelters/me/fosters/:fosterId/reject
// @desc    Reject a foster application
// @access  Private (volunteer, admin)
export const rejectFoster = async (req, res, next) => {
  try {
    const { fosterId } = req.params;
    const { reviewNote } = req.body;
    const useInMemory = !getDBStatus();

    if (useInMemory) {
      return res.status(200).json({ success: true, message: 'Foster rejected (demo mode)' });
    }

    const foster = await Foster.findByIdAndUpdate(
      fosterId,
      {
        status: 'rejected',
        reviewNote: reviewNote || '',
        reviewedBy: req.user._id,
        reviewedAt: new Date(),
      },
      { new: true }
    ).populate('pet', 'name').populate('applicant', 'name email');

    if (!foster) {
      return res.status(404).json({ success: false, error: 'Foster application not found' });
    }

    res.status(200).json({ success: true, data: foster });
  } catch (err) {
    next(err);
  }
};
