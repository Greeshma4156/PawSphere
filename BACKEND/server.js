import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import dotenv from 'dotenv';
import morgan from 'morgan';

// Load env vars
dotenv.config();

// Imports from config & utils
import { connectDB, getDBStatus } from './config/db.js';
import logger from './utils/logger.js';
import { seedMongoDB } from './utils/seedData.js';
import { seedInMemoryDB } from './utils/inMemoryDb.js';
import {
  setupHelmet,
  setupRateLimiter,
  setupSanitizer,
  setupXss
} from './config/security.js';

// Route files
import authRoutes from './routes/v1/authRoutes.js';
import rescueRoutes from './routes/v1/rescueRoutes.js';
import volunteerRoutes from './routes/v1/volunteerRoutes.js';
import donationRoutes from './routes/v1/donationRoutes.js';
import adoptionRoutes from './routes/v1/adoptionRoutes.js';
import shelterRoutes from './routes/v1/shelterRoutes.js';

// Middleware files
import errorHandler from './middleware/error.js';

// Socket files
import { handleSocketConnections } from './sockets/socketHandler.js';

// Jobs
import { runEscalationEngine } from './jobs/escalationJob.js';

// Initialize express app
const app = express();
const server = http.createServer(app);

// Connect to Database
await connectDB();

// Body parser
app.use(express.json());

// Dev logging middleware
if (process.env.NODE_ENV === 'development' || !process.env.NODE_ENV) {
  app.use(morgan('dev'));
}

// Enable CORS
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:3000',
  'https://paw-sphere-two.vercel.app',
  'https://paw-sphere.vercel.app',
];
app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (mobile apps, curl, etc.)
    if (!origin) return callback(null, true);
    if (allowedOrigins.some(o => origin.startsWith(o))) {
      return callback(null, true);
    }
    callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
}));

// Mount Security Middlewares
app.use(setupHelmet());
app.use(setupRateLimiter());
app.use(setupSanitizer());
app.use(setupXss());

// Mount API v1 Routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/rescues', rescueRoutes);
app.use('/api/v1/volunteers', volunteerRoutes);
app.use('/api/v1/donations', donationRoutes);
app.use('/api/v1/adoptions', adoptionRoutes);
app.use('/api/v1/shelters', shelterRoutes);

// Base route
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Welcome to PawSphere API Server',
    database: getDBStatus() ? 'mongodb' : 'in-memory',
    version: '1.0.0'
  });
});

// Mount Global Error Handler
app.use(errorHandler);

// Setup Socket.io Server
const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    methods: ['GET', 'POST'],
    credentials: true,
  }
});
handleSocketConnections(io);
app.set('io', io); // Share socket.io instance globally in controllers

// Set PORT
const PORT = process.env.PORT || 5000;

// Start Server and run seeds
server.listen(PORT, async () => {
  logger.info(`PawSphere backend server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);

  // Seed Data based on runtime database mode
  if (getDBStatus()) {
    await seedMongoDB();
  } else {
    await seedInMemoryDB();
  }

  // Start Background Jobs (run every 1 minute for demo purposes, 15m in prod)
  setInterval(() => {
    runEscalationEngine(io);
  }, 60 * 1000);
});

// Handle unhandled promise rejections gracefully
process.on('unhandledRejection', (err, promise) => {
  logger.error(`Error: ${err.message}`);
  // Do not crash the server in dev mode, just log it
});
