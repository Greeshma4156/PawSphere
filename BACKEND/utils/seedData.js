import User from '../models/User.js';
import RescueCase from '../models/RescueCase.js';
import RescueTimeline from '../models/RescueTimeline.js';
import Donation from '../models/Donation.js';
import Shelter from '../models/Shelter.js';
import AdoptionPet from '../models/AdoptionPet.js';
import AuditLog from '../models/AuditLog.js';
import logger from './logger.js';
import bcrypt from 'bcryptjs';

export const seedMongoDB = async () => {
  try {
    const userCount = await User.countDocuments();
    if (userCount > 0) return; // DB already has data

    logger.info('DB collections are empty. Beginning automated MongoDB seeding...');

    const salt = await bcrypt.genSalt(10);
    const hashPassword = await bcrypt.hash('password123', salt);

    // 1. Create Users
    const citizen = await User.create({
      name: 'Sarah Connor',
      email: 'sarah@pawsphere.org',
      password: 'password123', // hooks will auto-hash this
      role: 'citizen',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&h=150',
      phone: '+1 555-0199',
      isVerified: true,
      points: 120,
    });

    const volunteer = await User.create({
      name: 'John Doe',
      email: 'john@pawsphere.org',
      password: 'password123',
      role: 'volunteer',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&h=150',
      phone: '+1 555-0144',
      isVerified: true,
      experienceLevel: 'intermediate',
      documentUrl: 'https://pawsphere.org/docs/dummy_id.pdf',
      location: { type: 'Point', coordinates: [77.5946, 12.9716] },
      availability: 'online',
      radius: 15,
      points: 450,
      streak: 4,
      badges: ['first_rescue', 'streak_3'],
    });

    const volunteer2 = await User.create({
      name: 'Alice Cooper',
      email: 'alice@pawsphere.org',
      password: 'password123',
      role: 'volunteer',
      avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=150&h=150',
      phone: '+1 555-0166',
      isVerified: false, // Unverified volunteer
      experienceLevel: 'beginner',
      documentUrl: 'https://pawsphere.org/docs/dummy_id2.pdf',
      location: { type: 'Point', coordinates: [77.6476, 12.9784] },
      availability: 'offline',
      radius: 5,
      points: 0,
      streak: 0,
      badges: [],
    });

    const shelterUser = await User.create({
      name: 'Hope Animal Shelter',
      email: 'hope@pawsphere.org',
      password: 'password123',
      role: 'shelter',
      avatar: 'https://images.unsplash.com/photo-1544717297-fa95b6ee9643?auto=format&fit=crop&w=150&h=150',
      phone: '+1 555-0188',
      isVerified: true,
    });

    const admin = await User.create({
      name: 'Admin Commander',
      email: 'admin@pawsphere.org',
      password: 'password123',
      role: 'admin',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=150&h=150',
      phone: '+1 555-9999',
      isVerified: true,
    });

    // 2. Shelter Info
    await Shelter.create({
      user: shelterUser._id,
      registrationNumber: 'NGO-8827-2024',
      capacity: { total: 30, occupied: 3 },
      facilities: ['medical_ward', 'rehabilitation_yard', 'quarantine_zone'],
      emergencyHotline: '+1 555-9000',
    });

    // 3. Rescue Cases
    const case1 = await RescueCase.create({
      title: 'Injured Puppy in Central Market',
      animalType: 'dog',
      injurySeverity: 'high',
      description: 'Found a street puppy with a severe limp on its hind leg. Appears to be in significant pain and hiding under a vendor cart.',
      location: { type: 'Point', coordinates: [77.5806, 12.9730] },
      address: 'Central Market Vendor Alley 4, Bengaluru',
      photos: ['https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&w=500&q=80'],
      reporter: citizen._id,
      assignedVolunteer: null,
      priorityScore: 8,
      upvotes: [citizen._id],
      status: 'pending',
    });

    const case2 = await RescueCase.create({
      title: 'Dehydrated Cat in Park',
      animalType: 'cat',
      injurySeverity: 'medium',
      description: 'A stray cat looks extremely weak and dehydrated due to heat. Curled up near the public drinking fountain.',
      location: { type: 'Point', coordinates: [77.5960, 12.9600] },
      address: 'Cubbon Park, Near Fountain Gate, Bengaluru',
      photos: ['https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?auto=format&fit=crop&w=500&q=80'],
      reporter: citizen._id,
      assignedVolunteer: volunteer._id,
      priorityScore: 5,
      upvotes: [],
      status: 'assigned',
    });

    const case3 = await RescueCase.create({
      title: 'Bird with Fractured Wing',
      animalType: 'bird',
      injurySeverity: 'low',
      description: 'Pigeon has a damaged left wing, unable to fly but active and drinking water provided by shopkeeper.',
      location: { type: 'Point', coordinates: [77.6101, 12.9340] },
      address: '80 Feet Road, Near Coffee Day, Bengaluru',
      photos: ['https://images.unsplash.com/photo-1522441815192-d9f04eb0615c?auto=format&fit=crop&w=500&q=80'],
      reporter: citizen._id,
      assignedVolunteer: volunteer._id,
      priorityScore: 3,
      upvotes: [],
      status: 'rescued',
    });

    // 4. Timelines
    await RescueTimeline.create([
      {
        rescueCase: case1._id,
        eventType: 'reported',
        description: 'Stray puppy reported by citizen Sarah Connor with HIGH severity.',
        author: 'Sarah Connor',
        createdAt: new Date(Date.now() - 30 * 60 * 1000),
      },
      {
        rescueCase: case2._id,
        eventType: 'reported',
        description: 'Weak cat reported by citizen Sarah Connor with MEDIUM severity.',
        author: 'Sarah Connor',
        createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
      },
      {
        rescueCase: case2._id,
        eventType: 'assigned',
        description: 'Mission claimed by verified rescuer John Doe.',
        author: 'John Doe',
        createdAt: new Date(Date.now() - 1.5 * 60 * 60 * 1000),
      },
      {
        rescueCase: case3._id,
        eventType: 'reported',
        description: 'Injured pigeon reported with LOW severity.',
        author: 'Sarah Connor',
        createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000),
      },
      {
        rescueCase: case3._id,
        eventType: 'assigned',
        description: 'Mission claimed by verified rescuer John Doe.',
        author: 'John Doe',
        createdAt: new Date(Date.now() - 4.5 * 60 * 60 * 1000),
      },
      {
        rescueCase: case3._id,
        eventType: 'on_the_way',
        description: 'Volunteer started travel to coordinates.',
        author: 'John Doe',
        createdAt: new Date(Date.now() - 4.2 * 60 * 60 * 1000),
      },
      {
        rescueCase: case3._id,
        eventType: 'rescued',
        description: 'Bird secured successfully and emergency wrap applied.',
        author: 'John Doe',
        createdAt: new Date(Date.now() - 3.8 * 60 * 60 * 1000),
      }
    ]);

    // 5. Donations campaigns
    await Donation.create([
      {
        title: 'Surgery fund for street dog Bruno',
        description: 'Bruno was rescued with a compound femur fracture. He requires immediate orthopedic surgery, screws, and post-op care.',
        targetAmount: 500,
        raisedAmount: 320,
        rescueCase: case2._id,
        expenses: [
          { title: 'Orthopedic Bone Plates & Screws', amount: 250, billUrl: '' },
          { title: 'Veterinary Surgeon consultation fees', amount: 150, billUrl: '' },
          { title: 'Post-op Antibiotics and painkillers (14 Days)', amount: 100, billUrl: '' },
        ],
        backers: [
          { user: citizen._id, name: 'Sarah Connor', amount: 120, timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000) },
          { user: null, name: 'Anonymous PawLover', amount: 200, timestamp: new Date(Date.now() - 45 * 60 * 1000) },
        ],
      },
      {
        title: 'Vaccine drive for stray colony',
        description: 'Funding 7-in-1 vaccines and anti-rabies doses for a community stray pack of 15 dogs.',
        targetAmount: 200,
        raisedAmount: 200,
        rescueCase: null,
        expenses: [
          { title: '15 Anti-Rabies Vaccine Doses', amount: 80, billUrl: '' },
          { title: '15 DHPPiL Multi-vaccine vials', amount: 120, billUrl: '' },
        ],
        backers: [
          { user: citizen._id, name: 'Sarah Connor', amount: 100, timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000) },
          { user: volunteer._id, name: 'John Doe', amount: 100, timestamp: new Date(Date.now() - 12 * 60 * 1000) },
        ],
        isCompleted: true,
      }
    ]);

    // 6. Adoption Pets
    await AdoptionPet.create([
      {
        name: 'Bella',
        animalType: 'dog',
        breed: 'Indie Stray Mix',
        age: '6 Months',
        story: 'Bella was rescued from a monsoon drain as a tiny pup. She is incredibly playful, loves children, and is fully potty-trained.',
        photo: 'https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?auto=format&fit=crop&w=500&q=80',
        shelter: shelterUser._id,
        medicalPassportId: 'PASS-BEL-882',
        vaccinations: [
          { name: 'Anti-Rabies', date: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000), status: 'completed' },
          { name: 'DHPPiL Multi', date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), status: 'completed' },
        ],
        healthLog: [
          { date: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000), notes: 'De-worming pill administered.', treatment: 'Drontal plus' },
          { date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), notes: 'Skin checkup: Minor flea treatment applied.', treatment: 'Frontline spot-on' },
        ],
        status: 'available',
      },
      {
        name: 'Oliver',
        animalType: 'cat',
        breed: 'Calico Cat',
        age: '1 Year',
        story: 'Oliver was trapped in an engine bay of a parked truck. After a minor burn recovery, he is now healthy and very friendly.',
        photo: 'https://images.unsplash.com/photo-1533738363-b7f9aef128ce?auto=format&fit=crop&w=500&q=80',
        shelter: shelterUser._id,
        medicalPassportId: 'PASS-OLI-190',
        vaccinations: [
          { name: 'Feline Rabies', date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), status: 'completed' },
        ],
        healthLog: [
          { date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), notes: 'Superficial paw pad burn healed fully.', treatment: 'Silver sulfadiazine cream' },
        ],
        status: 'available',
      }
    ]);

    // 7. Audit Log
    await AuditLog.create({
      action: 'MONGODB_SEED',
      details: 'Mongoose database seeded successfully on startup.',
    });

    logger.info('Database seeded successfully.');
  } catch (error) {
    logger.error(`Seed Data Error: ${error.message}`);
  }
};
