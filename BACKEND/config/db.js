import mongoose from 'mongoose';
import logger from '../utils/logger.js';
import { seedInMemoryDB } from '../utils/inMemoryDb.js';

let isMongoConnected = false;

/**
 * Connect to MongoDB with retry logic.
 * If connection fails, fallback to in‑memory DB.
 */
export const connectDB = async () => {
  const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/pawsphere';
  const maxAttempts = 3;
  let attempt = 0;
  while (attempt < maxAttempts) {
    try {
      await mongoose.connect(mongoUri, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      });
      isMongoConnected = true;
      logger.info('MongoDB connected');
      return;
    } catch (err) {
      attempt += 1;
      logger.warn(`MongoDB connection attempt ${attempt} failed: ${err.message}`);
      if (attempt < maxAttempts) {
        const delay = Math.pow(2, attempt) * 1000; // exponential backoff
        await new Promise((res) => setTimeout(res, delay));
      }
    }
  }
  // All attempts failed – switch to in‑memory mock
  isMongoConnected = false;
  logger.error('MongoDB unavailable – using in‑memory fallback');
  await seedInMemoryDB();
};

/**
 * Gracefully disconnect from MongoDB.
 */
export const disconnectDB = async () => {
  if (isMongoConnected) {
    await mongoose.disconnect();
    logger.info('MongoDB disconnected');
  }
};

/**
 * Returns true if the real MongoDB is active, false if in‑memory mock is used.
 */
export const getDBStatus = () => isMongoConnected;
