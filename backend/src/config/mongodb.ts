import mongoose from 'mongoose';
import { startMockDB, stopMockDB } from './test-db';

export const connectDB = async () => {
  try {
    if (process.env.NODE_ENV === 'test') {
      await startMockDB();
      console.log('✅ Using in-memory mock database');
      return;
    }
    await mongoose.connect(process.env.DB_URI as string, {
      //   useNewUrlParser: true,
      //   useUnifiedTopology: true,
    });
    console.log('✅ Connected to MongoDB');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  }
};

export const disconnectDB = async () => {
  if (process.env.NODE_ENV === 'test') {
    await stopMockDB();
  } else {
    await mongoose.connection.close();
  }
};

process.on('SIGINT', disconnectDB);
process.on('SIGTERM', disconnectDB);
