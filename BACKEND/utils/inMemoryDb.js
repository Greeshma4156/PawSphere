import { v4 as uuidv4 } from 'uuid';
import bcrypt from 'bcryptjs';

// Local collections arrays
export const users = [];
export const rescueCases = [];
export const rescueTimelines = [];
export const donations = [];
export const shelters = [];
export const adoptionPets = [];
export const reviews = [];
export const auditLogs = [];

// Seed initial in-memory data
export const seedInMemoryDB = async () => {
  if (users.length > 0) return; // Already seeded

  const salt = await bcrypt.genSalt(10);
  const hashPassword = await bcrypt.hash('password123', salt);

  // 1. Users
  const citizen = {
    _id: 'citizen_id_1',
    name: 'Sarah Connor',
    email: 'sarah@pawsphere.org',
    password: hashPassword,
    role: 'citizen',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&h=150',
    phone: '+1 555-0199',
    isVerified: true,
    points: 120,
    createdAt: new Date(),
  };

  const volunteer = {
    _id: 'volunteer_id_1',
    name: 'John Doe',
    email: 'john@pawsphere.org',
    password: hashPassword,
    role: 'volunteer',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&h=150',
    phone: '+1 555-0144',
    isVerified: true,
    experienceLevel: 'intermediate',
    documentUrl: 'https://pawsphere.org/docs/dummy_id.pdf',
    location: { type: 'Point', coordinates: [77.5946, 12.9716] }, // Bengaluru central
    availability: 'online',
    radius: 15,
    points: 450,
    streak: 4,
    badges: ['first_rescue', 'streak_3'],
    createdAt: new Date(),
  };

  const volunteer2 = {
    _id: 'volunteer_id_2',
    name: 'Alice Cooper',
    email: 'alice@pawsphere.org',
    password: hashPassword,
    role: 'volunteer',
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=150&h=150',
    phone: '+1 555-0166',
    isVerified: false, // Unverified
    experienceLevel: 'beginner',
    documentUrl: 'https://pawsphere.org/docs/dummy_id2.pdf',
    location: { type: 'Point', coordinates: [77.6476, 12.9784] }, // Indiranagar
    availability: 'offline',
    radius: 5,
    points: 0,
    streak: 0,
    badges: [],
    createdAt: new Date(),
  };

  const shelterUser = {
    _id: 'shelter_id_1',
    name: 'Hope Animal Shelter',
    email: 'hope@pawsphere.org',
    password: hashPassword,
    role: 'citizen',
    avatar: 'https://images.unsplash.com/photo-1544717297-fa95b6ee9643?auto=format&fit=crop&w=150&h=150',
    phone: '+1 555-0188',
    isVerified: true,
    createdAt: new Date(),
  };

  const admin = {
    _id: 'admin_id_1',
    name: 'Admin Commander',
    email: 'admin@pawsphere.org',
    password: hashPassword,
    role: 'admin',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=150&h=150',
    phone: '+1 555-9999',
    isVerified: true,
    createdAt: new Date(),
  };

  users.push(citizen, volunteer, volunteer2, shelterUser, admin);

  // 2. Shelters Capacity
  shelters.push({
    _id: 'shelter_info_1',
    user: 'shelter_id_1',
    registrationNumber: 'NGO-8827-2024',
    capacity: { total: 30, occupied: 3 },
    facilities: ['medical_ward', 'rehabilitation_yard', 'quarantine_zone'],
    emergencyHotline: '+1 555-9000',
    createdAt: new Date(),
  });

  // 3. Rescue Cases
  const case1 = {
    _id: 'case_id_1',
    title: 'Injured Puppy in Central Market',
    animalType: 'dog',
    injurySeverity: 'high',
    description: 'Found a street puppy with a severe limp on its hind leg. Appears to be in significant pain and hiding under a vendor cart.',
    location: { type: 'Point', coordinates: [77.5806, 12.9730] }, // Coordinates near central market
    address: 'Central Market Vendor Alley 4, Bengaluru',
    photos: ['https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&w=500&q=80'],
    reporter: 'citizen_id_1',
    assignedVolunteer: null,
    priorityScore: 8,
    upvotes: ['citizen_id_1'],
    status: 'pending',
    isDeleted: false,
    createdAt: new Date(Date.now() - 30 * 60 * 1000), // 30 mins ago
  };

  const case2 = {
    _id: 'case_id_2',
    title: 'Dehydrated Cat in Park',
    animalType: 'cat',
    injurySeverity: 'medium',
    description: 'A stray cat looks extremely weak and dehydrated due to heat. Curled up near the public drinking fountain.',
    location: { type: 'Point', coordinates: [77.5960, 12.9600] }, // Coordinates near park
    address: 'Cubbon Park, Near Fountain Gate, Bengaluru',
    photos: ['https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?auto=format&fit=crop&w=500&q=80'],
    reporter: 'citizen_id_1',
    assignedVolunteer: 'volunteer_id_1',
    priorityScore: 5,
    upvotes: [],
    status: 'assigned',
    isDeleted: false,
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
  };

  const case3 = {
    _id: 'case_id_3',
    title: 'Bird with Fractured Wing',
    animalType: 'bird',
    injurySeverity: 'low',
    description: 'Pigeon has a damaged left wing, unable to fly but active and drinking water provided by shopkeeper.',
    location: { type: 'Point', coordinates: [77.6101, 12.9340] }, // Koramangala
    address: '80 Feet Road, Near Coffee Day, Bengaluru',
    photos: ['https://images.unsplash.com/photo-1522441815192-d9f04eb0615c?auto=format&fit=crop&w=500&q=80'],
    reporter: 'citizen_id_1',
    assignedVolunteer: 'volunteer_id_1',
    priorityScore: 3,
    upvotes: [],
    status: 'rescued',
    isDeleted: false,
    createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000), // 5 hours ago
  };

  rescueCases.push(case1, case2, case3);

  // 4. Rescue Timelines
  rescueTimelines.push(
    {
      _id: 't_1',
      rescueCase: 'case_id_1',
      eventType: 'reported',
      description: 'Stray puppy reported by citizen Sarah Connor with HIGH severity.',
      author: 'Sarah Connor',
      createdAt: new Date(Date.now() - 30 * 60 * 1000),
    },
    {
      _id: 't_2',
      rescueCase: 'case_id_2',
      eventType: 'reported',
      description: 'Weak cat reported by citizen Sarah Connor with MEDIUM severity.',
      author: 'Sarah Connor',
      createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
    },
    {
      _id: 't_3',
      rescueCase: 'case_id_2',
      eventType: 'assigned',
      description: 'Mission claimed by verified rescuer John Doe.',
      author: 'John Doe',
      createdAt: new Date(Date.now() - 1.5 * 60 * 60 * 1000),
    },
    {
      _id: 't_4',
      rescueCase: 'case_id_3',
      eventType: 'reported',
      description: 'Injured pigeon reported with LOW severity.',
      author: 'Sarah Connor',
      createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000),
    },
    {
      _id: 't_5',
      rescueCase: 'case_id_3',
      eventType: 'assigned',
      description: 'Mission claimed by verified rescuer John Doe.',
      author: 'John Doe',
      createdAt: new Date(Date.now() - 4.5 * 60 * 60 * 1000),
    },
    {
      _id: 't_6',
      rescueCase: 'case_id_3',
      eventType: 'on_the_way',
      description: 'Volunteer started travel to coordinates.',
      author: 'John Doe',
      createdAt: new Date(Date.now() - 4.2 * 60 * 60 * 1000),
    },
    {
      _id: 't_7',
      rescueCase: 'case_id_3',
      eventType: 'rescued',
      description: 'Bird secured successfully and emergency wrap applied.',
      author: 'John Doe',
      createdAt: new Date(Date.now() - 3.8 * 60 * 60 * 1000),
    }
  );

  // 5. Donation Campaigns removed

  // 6. Adoption Rescued Pets
  adoptionPets.push(
    {
      _id: 'pet_id_1',
      name: 'Bella',
      animalType: 'dog',
      breed: 'Indie Stray Mix',
      age: '6 Months',
      story: 'Bella was rescued from a monsoon drain as a tiny pup. She is incredibly playful, loves children, and is fully potty-trained.',
      photo: 'https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?auto=format&fit=crop&w=500&q=80',
      shelter: 'shelter_id_1',
      medicalPassportId: 'PASS-BEL-882',
      qrCodeUrl: 'PASS-BEL-882-QR',
      vaccinations: [
        { name: 'Anti-Rabies', date: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000), status: 'completed' },
        { name: 'DHPPiL Multi', date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), status: 'completed' },
      ],
      healthLog: [
        { date: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000), notes: 'De-worming pill administered.', treatment: 'Drontal plus' },
        { date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), notes: 'Skin checkup: Minor flea treatment applied.', treatment: 'Frontline spot-on' },
      ],
      status: 'available',
      createdAt: new Date(),
    },
    {
      _id: 'pet_id_2',
      name: 'Oliver',
      animalType: 'cat',
      breed: 'Calico Cat',
      age: '1 Year',
      story: 'Oliver was trapped in an engine bay of a parked truck. After a minor burn recovery, he is now healthy and very friendly.',
      photo: 'https://images.unsplash.com/photo-1533738363-b7f9aef128ce?auto=format&fit=crop&w=500&q=80',
      shelter: 'shelter_id_1',
      medicalPassportId: 'PASS-OLI-190',
      qrCodeUrl: 'PASS-OLI-190-QR',
      vaccinations: [
        { name: 'Feline Rabies', date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), status: 'completed' },
      ],
      healthLog: [
        { date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), notes: 'Superficial paw pad burn healed fully.', treatment: 'Silver sulfadiazine cream' },
      ],
      status: 'available',
      createdAt: new Date(),
    }
  );

  // 7. Audit Logs
  auditLogs.push(
    {
      _id: 'audit_1',
      action: 'SYSTEM_SEED',
      details: 'PawSphere local in-memory database generated successfully.',
      createdAt: new Date(),
    }
  );
};
