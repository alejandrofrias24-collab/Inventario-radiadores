import '../../../config/env.js';
import mongoose from 'mongoose';

// En ejecución local, conecta con MongoDB instalado en el equipo. Docker Compose
// proporciona su propia URI y la reemplaza por la conexión interna del contenedor.
const uri = process.env.MONGODB_URI || 'mongodb://admin:Mongo_Dev_2026!@127.0.0.1:27017/invetario_db?authSource=admin';

export async function connectMongoDB() {
  await mongoose.connect(uri, {
    serverSelectionTimeoutMS: 10000
  });
  console.info(`Conexión a MongoDB establecida (${mongoose.connection.name}).`);
}

export async function disconnectMongoDB() {
  await mongoose.disconnect();
}
