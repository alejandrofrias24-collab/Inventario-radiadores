import './config/env.js';
import { createApp } from './app.js';
import { connectMongoDB, disconnectMongoDB } from './infrastructure/database/mongodb/connection.js';
import { HistorialModel } from './infrastructure/database/mongodb/models/historial.model.js';
import { ProductoCounterModel, ProductoModel } from './infrastructure/database/mongodb/models/producto.model.js';
import { startUserCreatedConsumer } from './infrastructure/messaging/user-created.consumer.js';

const port = Number(process.env.PORT ?? 3002);
const app = createApp();
let server;
let closeConsumer = async () => {};
let rabbitRetryTimer;
let shuttingDown = false;

const rabbitUser = encodeURIComponent(process.env.RABBITMQ_USER || 'app');
const rabbitPassword = encodeURIComponent(process.env.RABBITMQ_PASSWORD || 'app-dev-password');
const rabbitHost = process.env.RABBITMQ_HOST || '127.0.0.1';
const rabbitPort = Number(process.env.RABBITMQ_PORT || 5672);
const rabbitUrl = process.env.RABBITMQ_URL || process.env.RABBIT_URL || `amqp://${rabbitUser}:${rabbitPassword}@${rabbitHost}:${rabbitPort}`;

async function connectWithRetry(label, connect, attempts = 10) {
  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    try {
      await connect();
      return;
    } catch (error) {
      const errorCode = error.original?.code ?? error.parent?.code ?? error.code;
      const retryable = ['ESOCKET', 'ECONNRESET', 'ECONNREFUSED', 'ECONNCLOSED', 'ETIMEOUT', 'ENOTFOUND', 'EAI_AGAIN'].includes(errorCode);
      if (!retryable || attempt === attempts) throw error;
      const delayMs = 3000;
      console.warn(`${label} aún no está listo (intento ${attempt}/${attempts}). Reintentando en ${delayMs / 1000}s.`);
      await new Promise((resolve) => setTimeout(resolve, delayMs));
    }
  }
}

async function connectUserCreatedConsumer() {
  if (shuttingDown) return;
  try {
    closeConsumer = await startUserCreatedConsumer(rabbitUrl);
    console.info('Consumidor usuario.creado conectado a RabbitMQ.');
  } catch (error) {
    console.warn(`RabbitMQ no está disponible; la API seguirá funcionando y reintentará en 5s. ${error.message}`);
    rabbitRetryTimer = setTimeout(() => void connectUserCreatedConsumer(), 5000);
    rabbitRetryTimer.unref?.();
  }
}

async function start() {
  await Promise.all([
    connectWithRetry('MongoDB', connectMongoDB)
  ]);
  await Promise.all([HistorialModel.init(), ProductoModel.init(), ProductoCounterModel.init()]);
  void connectUserCreatedConsumer();
  server = app.listen(port, () => console.info(`API disponible en http://localhost:${port}`));
}

async function shutdown(signal) {
  console.info(`${signal} recibido; cerrando API.`);
  shuttingDown = true;
  if (rabbitRetryTimer) clearTimeout(rabbitRetryTimer);
  if (server) await new Promise((resolve, reject) => server.close((error) => error ? reject(error) : resolve()));
  await closeConsumer();
  await disconnectMongoDB();
  process.exit(0);
}

process.once('SIGINT', () => shutdown('SIGINT'));
process.once('SIGTERM', () => shutdown('SIGTERM'));

start().catch(async (error) => {
  console.error('No fue posible iniciar la API:', error);
  await disconnectMongoDB();
  process.exit(1);
});
