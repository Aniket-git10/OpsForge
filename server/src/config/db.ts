import mongoose from 'mongoose';

export const connectDB = async (): Promise<typeof mongoose> => {
  const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/opsforge';
  try {
    const conn = await mongoose.connect(uri, {
      autoIndex: true, // Build indexes automatically in development
    });
    console.log(`[Database] MongoDB connected successfully: ${conn.connection.host}/${conn.connection.name}`);
    return conn;
  } catch (error) {
    console.error('[Database] MongoDB connection failed:', error);
    process.exit(1);
  }
};
