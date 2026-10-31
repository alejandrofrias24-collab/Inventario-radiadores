import express from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { createAuthRouter } from './routes/auth.routes.js';
class AppError extends Error {
  constructor(message, statusCode, code) { super(message); this.statusCode = statusCode; this.code = code; }
}

const normalizeEmail = (value) => typeof value === 'string' ? value.trim().toLowerCase() : '';
function credentials({ nombre, email, password }, needsName = false) {
  const normalizedEmail = normalizeEmail(email);
  if (needsName && (typeof nombre !== 'string' || nombre.trim().length < 2 || nombre.trim().length > 120)) throw new AppError('El nombre debe tener entre 2 y 120 caracteres.', 400, 'VALIDATION_ERROR');
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail) || normalizedEmail.length > 254) throw new AppError('Ingresa un correo electrónico válido.', 400, 'VALIDATION_ERROR');
  if (typeof password !== 'string' || password.length < 8 || password.length > 72) throw new AppError('La contraseña debe tener entre 8 y 72 caracteres.', 400, 'VALIDATION_ERROR');
  return { nombre: nombre?.trim(), email: normalizedEmail, password };
}
function tokenFor(user) {
  const expiresIn = process.env.JWT_EXPIRES_IN || '2h';
  const token = jwt.sign({ sub: String(user.id), email: user.email, nombre: user.nombre }, process.env.JWT_SECRET, { expiresIn });
  return { token, expiresIn, expiresAt: new Date(jwt.decode(token).exp * 1000).toISOString(), user: { id: user.id, nombre: user.nombre, email: user.email } };
}
export function createAuthApp({ Usuario, publishUserCreated = async () => {} }) {
  const app = express();
  app.disable('x-powered-by');
  app.use(express.json({ limit: '1mb' }));
  app.get('/health', (_req, res) => res.json({ status: 'ok', service: 'auth' }));
  app.use('/auth', createAuthRouter({
    register: async (req, res) => {
      const input = credentials(req.body ?? {}, true);
      if (await Usuario.findOne({ where: { email: input.email } })) throw new AppError('Ya existe una cuenta con ese correo.', 409, 'EMAIL_CONFLICT');
      const passwordHash = await bcrypt.hash(input.password, 12);
      const user = await Usuario.create({ nombre: input.nombre, email: input.email, passwordHash });
      await publishUserCreated({ id: user.id, nombre: user.nombre, email: user.email, creadoEn: new Date().toISOString() });
      res.status(201).json({ data: tokenFor(user) });
    },
    login: async (req, res) => {
      const input = credentials(req.body ?? {});
      const user = await Usuario.findOne({ where: { email: input.email } });
      if (!user || !(await bcrypt.compare(input.password, user.passwordHash))) throw new AppError('Correo o contraseña incorrectos.', 401, 'INVALID_CREDENTIALS');
      res.json({ data: tokenFor(user) });
    }
  }));
  app.use((_req, _res, next) => next(new AppError('Ruta no encontrada.', 404, 'ROUTE_NOT_FOUND')));
  app.use((error, _req, res, _next) => res.status(error.statusCode || 500).json({ error: { code: error.code || 'INTERNAL_SERVER_ERROR', message: error.statusCode ? error.message : 'Error interno del servidor.' } }));
  return app;
}
