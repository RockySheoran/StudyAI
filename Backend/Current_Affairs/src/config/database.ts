import mongoose from 'mongoose';

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/currentaffairs', {
      serverSelectionTimeoutMS: 50000, // 50 seconds
      connectTimeoutMS: 50000, // 50 seconds
      socketTimeoutMS: 50000, // 50 seconds
      maxPoolSize: 10,
      retryWrites: true,
      w: 'majority'
    });
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error('Error connecting to MongoDB:', error);
    process.exit(1);
  }
};

export default connectDB;