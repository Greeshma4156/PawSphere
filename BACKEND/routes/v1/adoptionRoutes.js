import express from 'express';
import { protect, authorize } from '../../middleware/auth.js';
import AdoptionPet from '../../models/AdoptionPet.js';
import * as inMemoryDb from '../../utils/inMemoryDb.js';
import { getDBStatus } from '../../config/db.js';

const router = express.Router();

// @route   GET /api/v1/adoptions
// @desc    Get all adoptable pets (with optional filters)
// @access  Public
router.get('/', async (req, res, next) => {
  try {
    const useInMemory = !getDBStatus();
    const { animalType, age, breed } = req.query;

    let pets;
    if (useInMemory) {
      pets = inMemoryDb.adoptionPets.filter((p) => p.status === 'available');
    } else {
      const query = { status: 'available' };
      if (animalType) query.animalType = animalType;
      if (age) query.age = age;
      if (breed) query.breed = new RegExp(breed, 'i');
      pets = await AdoptionPet.find(query).populate('shelter', 'name phone').sort({ createdAt: -1 });
    }

    // Filter in-memory if query supplied
    if (useInMemory) {
      if (animalType) pets = pets.filter(p => p.animalType === animalType);
      if (age) pets = pets.filter(p => p.age === age);
      if (breed) pets = pets.filter(p => p.breed.toLowerCase().includes(breed.toLowerCase()));
    }

    res.status(200).json({ success: true, count: pets.length, data: pets });
  } catch (err) {
    next(err);
  }
});

// @route   GET /api/v1/adoptions/:id
// @desc    Get single pet medical passport details
// @access  Private
router.get('/:id', protect, async (req, res, next) => {
  try {
    const { id } = req.params;
    const useInMemory = !getDBStatus();

    let pet;
    if (useInMemory) {
      pet = inMemoryDb.adoptionPets.find(p => p._id === id);
    } else {
      pet = await AdoptionPet.findById(id).populate('shelter', 'name phone email');
    }

    if (!pet) {
      return res.status(404).json({ success: false, error: 'Pet medical passport not found' });
    }

    res.status(200).json({ success: true, data: pet });
  } catch (err) {
    next(err);
  }
});

// @route   POST /api/v1/adoptions/:id/apply
// @desc    Apply for pet adoption
// @access  Private
router.post('/:id/apply', protect, async (req, res, next) => {
  try {
    const { id } = req.params;
    const useInMemory = !getDBStatus();
    const io = req.app.get('io');

    let pet;
    if (useInMemory) {
      pet = inMemoryDb.adoptionPets.find(p => p._id === id);
      if (pet) pet.status = 'pending_adoption';
    } else {
      pet = await AdoptionPet.findByIdAndUpdate(id, { status: 'pending_adoption' }, { new: true });
    }

    if (!pet) {
      return res.status(404).json({ success: false, error: 'Adoptable pet not found' });
    }

    // Broadcast a socket event to the shelter
    if (io) {
      io.emit('notification:new_adoption_application', {
        petId: pet._id,
        petName: pet.name,
        applicantName: req.user.name,
        shelterId: pet.shelter,
      });
    }

    res.status(200).json({ 
      success: true, 
      message: 'Adoption application successfully transmitted. Shelter team will review and scan digital passports.',
      data: pet 
    });
  } catch (err) {
    next(err);
  }
});

// @route   POST /api/v1/adoptions
// @desc    Add a pet for adoption
// @access  Private
router.post('/', protect, async (req, res, next) => {
  try {
    const { name, animalType, breed, age, story, photo } = req.body;
    const useInMemory = !getDBStatus();

    const medicalPassportId = `PASS-CITIZEN-${Date.now()}`;

    const newPetData = {
      name,
      animalType,
      breed: breed || 'Mixed Breed',
      age,
      story,
      photo: photo || 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&w=500&q=80',
      shelter: req.user._id,
      medicalPassportId,
      status: 'available',
      vaccinations: [],
      healthLog: []
    };

    let pet;
    if (useInMemory) {
      pet = { _id: 'pet_' + Date.now(), ...newPetData, createdAt: new Date() };
      inMemoryDb.adoptionPets.push(pet);
    } else {
      pet = await AdoptionPet.create(newPetData);
    }

    res.status(201).json({ success: true, data: pet });
  } catch (err) {
    next(err);
  }
});

export default router;
