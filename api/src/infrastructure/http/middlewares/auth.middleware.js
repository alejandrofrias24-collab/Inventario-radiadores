import jwt from 'jsonwebtoken';
import { AppError } from '../../../domain/errors/app-error.js';

export function authMiddleware(req, _res, next) {
  if (!process.env.JWT_SECRET) return next(new AppError('La autenticación no está configurada.', 500, 'AUTH_NOT_CONFIGURED'));
  const [scheme, token] = (req.headers.authorization ?? '').split(' ');
  if (scheme !== 'Bearer' || !token) return next(new AppError('Se requiere iniciar sesión para realizar esta acción.', 401, 'AUTH_REQUIRED'));
  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET);
    return next();
  } catch {
    return next(new AppError('La sesión no es válida o ha expirado. Inicia sesión nuevamente.', 401, 'INVALID_TOKEN'));
  }
}
