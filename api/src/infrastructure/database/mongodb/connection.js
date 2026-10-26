import '../../../config/env.js';
import mongoose from 'mongoose';

const uri = process.env.MONGODB_URI;

if (!uri) {
  throw new Error('Falta la variable de entorno MONGODB_URI.');
}

export async function connectMongoDB() {
  await mongoose.connect(uri, {
    serverSelectionTimeoutMS: 10000
  });
  console.info(`Conexión a MongoDB establecida (${mongoose.connection.name}).`);
}

export async function disconnectMongoDB() {
  await mongoose.disconnect();
}
