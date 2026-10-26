import './config/env.js';
import { createApp } from './app.js';
import { connectMongoDB, disconnectMongoDB } from './infrastructure/database/mongodb/connection.js';
import { connectSqlServer, sequelize } from './infrastructure/database/sql-server/connection.js';

const port = Number(process.env.PORT ?? 3000);
const app = createApp();
let server;

async function connectWithRetry(label, connect, attempts = 10) {
  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    try {
      await connect();
      return;
    } catch (error) {
      const errorCode = error.original?.code ?? error.parent?.code ?? error.code;
      const retryable = ['ESOCKET', 'ECONNRESET', 'ECONNREFUSED', 'ECONNCLOSED', 'ETIMEOUT'].includes(errorCode);
      if (!retryable || attempt === attempts) throw error;
      const delayMs = 3000;
      console.warn(`${label} aún no está listo (intento ${attempt}/${attempts}). Reintentando en ${delayMs / 1000}s.`);
      await new Promise((resolve) => setTimeout(resolve, delayMs));
    }
  }
}

async function start() {
  await Promise.all([
    connectWithRetry('SQL Server', connectSqlServer),
    connectWithRetry('MongoDB', connectMongoDB)
  ]);
  server = app.listen(port, () => console.info(`API disponible en http://localhost:${port}`));
}

async function shutdown(signal) {
  console.info(`${signal} recibido; cerrando API.`);
  if (server) await new Promise((resolve, reject) => server.close((error) => error ? reject(error) : resolve()));
  await Promise.allSettled([sequelize.close(), disconnectMongoDB()]);
  process.exit(0);
}

process.once('SIGINT', () => shutdown('SIGINT'));
process.once('SIGTERM', () => shutdown('SIGTERM'));

start().catch(async (error) => {
  console.error('No fue posible iniciar la API:', error);
  await Promise.allSettled([sequelize.close(), disconnectMongoDB()]);
  process.exit(1);
});
