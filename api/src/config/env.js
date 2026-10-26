import dotenv from 'dotenv';
import { fileURLToPath } from 'node:url';

const envPath = fileURLToPath(new URL('../../.env', import.meta.url));
const result = dotenv.config({ path: envPath, override: true });

if (result.error) {
  throw new Error(`No se pudo cargar el archivo de entorno ${envPath}: ${result.error.message}`);
}

if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32) {
  throw new Error('JWT_SECRET es obligatorio y debe tener al menos 32 caracteres. Configúralo en api/.env.');
}
