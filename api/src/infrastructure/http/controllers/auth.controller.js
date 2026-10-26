import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { AppError } from '../../../domain/errors/app-error.js';

const normalizeEmail = (value) => typeof value === 'string' ? value.trim().toLowerCase() : '';

function validateCredentials({ nombre, email, password }, includeName = false) {
  const normalizedEmail = normalizeEmail(email);
  if (includeName && (typeof nombre !== 'string' || nombre.trim().length < 2 || nombre.trim().length > 120)) {
    throw new AppError('El nombre debe tener entre 2 y 120 caracteres.', 400, 'VALIDATION_ERROR');
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail) || normalizedEmail.length > 254) {
    throw new AppError('Ingresa un correo electrónico válido.', 400, 'VALIDATION_ERROR');
  }
  if (typeof password !== 'string' || password.length < 8 || password.length > 72) {
    throw new AppError('La contraseña debe tener entre 8 y 72 caracteres.', 400, 'VALIDATION_ERROR');
  }
  return { nombre: typeof nombre === 'string' ? nombre.trim() : undefined, email: normalizedEmail, password };
}

function issueToken(user) {
  const expiresIn = process.env.JWT_EXPIRES_IN || '2h';
  const token = jwt.sign({ sub: String(user.id), email: user.email, nombre: user.nombre }, process.env.JWT_SECRET, { expiresIn });
  const expiresAt = new Date(jwt.decode(token).exp * 1000).toISOString();
  return { token, expiresIn, expiresAt, user: { id: user.id, nombre: user.nombre, email: user.email } };
}

export function createAuthController(Usuario) {
  return {
    register: async (req, res) => {
      const input = validateCredentials(req.body ?? {}, true);
      const existing = await Usuario.findOne({ where: { email: input.email } });
      if (existing) throw new AppError('Ya existe una cuenta con ese correo.', 409, 'EMAIL_CONFLICT');
      const passwordHash = await bcrypt.hash(input.password, 12);
      const user = await Usuario.create({ nombre: input.nombre, email: input.email, passwordHash });
      res.status(201).json({ data: issueToken(user) });
    },
    login: async (req, res) => {
      const input = validateCredentials(req.body ?? {});
      const user = await Usuario.findOne({ where: { email: input.email } });
      if (!user || !(await bcrypt.compare(input.password, user.passwordHash))) {
        throw new AppError('Correo o contraseña incorrectos.', 401, 'INVALID_CREDENTIALS');
      }
      res.json({ data: issueToken(user) });
    }
  };
}
