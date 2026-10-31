import dotenv from 'dotenv';
import { fileURLToPath } from 'node:url';

const apiEnvPath = fileURLToPath(new URL('../../.env', import.meta.url));
const projectEnvPath = fileURLToPath(new URL('../../../.env', import.meta.url));
dotenv.config({ path: apiEnvPath });
dotenv.config({ path: projectEnvPath, override: true });
