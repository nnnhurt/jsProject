// подключение к монго
import mongoose from 'mongoose';

let isConnected = false;

export async function connectToDatabase(): Promise<void> {
  if (isConnected) return;
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error('MONGODB_URI is not set');
  }
  await mongoose.connect(uri);
  isConnected = true;
}


