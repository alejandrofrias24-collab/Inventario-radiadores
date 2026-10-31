import { createAuthApp } from './app.js';
import { ensureAuthDatabase, sequelize } from './database.js';
import { Usuario } from './user.model.js';
import { createPublisher } from './publisher.js';

if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32) throw new Error('JWT_SECRET debe tener al menos 32 caracteres.');
const rabbitUrl = process.env.RABBITMQ_URL || process.env.RABBIT_URL || 'amqp://app:app-dev-password@127.0.0.1:5672';
const publishUserCreated = await createPublisher(rabbitUrl);
console.info('Preparando la base de autenticación.');
await ensureAuthDatabase();
console.info('Conectando el modelo de autenticación.');
await sequelize.authenticate();
await sequelize.sync();
const app = createAuthApp({ Usuario, publishUserCreated });
const server = app.listen(Number(process.env.PORT || 3001), () => console.info('Servicio de autenticación disponible.'));
async function shutdown() { server.close(); await Promise.allSettled([sequelize.close()]); process.exit(0); }
process.once('SIGINT', shutdown);
process.once('SIGTERM', shutdown);
