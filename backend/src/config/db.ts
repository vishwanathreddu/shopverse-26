import mongoose from 'mongoose';
import { env } from './env.js';

export async function connectDB(): Promise<void> {
  mongoose.set('strictQuery', true);
  const uri = process.env.MONGODB_URI ?? env.mongoUri;
  await mongoose.connect(uri);
  if (process.env.NODE_ENV !== 'test') {
    console.log('MongoDB connected');
  }
}
