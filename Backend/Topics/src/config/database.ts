import mongoose from 'mongoose';

let isConnected = false;

export const connectDB = async (): Promise<void> => {
  if (isConnected) {
    console.log('Using existing MongoDB connection');
    return;
  }

  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/education_db', {
      serverSelectionTimeoutMS: 50000, // 30 seconds
      socketTimeoutMS: 50000, // 45 seconds
      bufferCommands: false,
      maxPoolSize: 10,
      minPoolSize: 5,
      maxIdleTimeMS: 50000,
      connectTimeoutMS: 30000,
    });
    
    isConnected = true;
    console.log(`MongoDB Connected: ${conn.connection.host}`);

    // Handle connection events
    mongoose.connection.on('disconnected', () => {
      console.log('MongoDB disconnected');
      isConnected = false;
    });

    mongoose.connection.on('error', (error) => {
      console.error('MongoDB connection error:', error);
      isConnected = false;
    });

  } catch (error) {
    console.error('Error connecting to MongoDB:', error);
    isConnected = false;
    throw error; // Don't exit process in serverless environment
  }
};