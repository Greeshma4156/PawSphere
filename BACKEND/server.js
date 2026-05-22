import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import dotenv from 'dotenv';
import morgan from 'morgan';

// Load env vars
dotenv.config();

// Imports from config & utils
import connectDB, { getDBStatus } from './config/db.js';
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
import shelterRoutes from './routes/v1/shelterRoutes.js';
import donationRoutes from './routes/v1/donationRoutes.js';

// Middleware files
import errorHandler from './middleware/error.js';

// Socket files
import { handleSocketConnections } from './sockets/socketHandler.js';

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
app.use(cors());

// Mount Security Middlewares
app.use(setupHelmet());
app.use(setupRateLimiter());
app.use(setupSanitizer());
app.use(setupXss());

// Mount API v1 Routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/rescues', rescueRoutes);
app.use('/api/v1/volunteers', volunteerRoutes);
app.use('/api/v1/shelters', shelterRoutes);
app.use('/api/v1/donations', donationRoutes);

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
    origin: '*',
    methods: ['GET', 'POST']
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
});

// Handle unhandled promise rejections gracefully
process.on('unhandledRejection', (err, promise) => {
  logger.error(`Error: ${err.message}`);
  // Do not crash the server in dev mode, just log it
});
