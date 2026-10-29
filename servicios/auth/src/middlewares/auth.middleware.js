import jwt from 'jsonwebtoken';
import { AppError } from '../../../../api/src/domain/errors/app-error.js';

export function authMiddleware(req, _res, next) {
  const [scheme, token] = (req.headers.authorization ?? '').split(' ');
  if (scheme !== 'Bearer' || !token) {
    return next(new AppError('Se requiere iniciar sesión para realizar esta acción.', 401, 'AUTH_REQUIRED'));
  }
  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET);
    return next();
  } catch {
    return next(new AppError('La sesión no es válida o ha expirado. Inicia sesión nuevamente.', 401, 'INVALID_TOKEN'));
  }
}
