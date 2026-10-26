import { AppError } from '../../../domain/errors/app-error.js';

export function notFoundHandler(_req, _res, next) {
  next(new AppError('Ruta no encontrada.', 404, 'ROUTE_NOT_FOUND'));
}

export function errorHandler(error, _req, res, _next) {
  let statusCode = error.statusCode ?? 500;
  let code = error.code ?? 'INTERNAL_SERVER_ERROR';
  let message = error.message ?? 'Error interno del servidor.';

  if (error.name === 'SequelizeUniqueConstraintError' || error.original?.number === 2627 || error.original?.number === 2601) {
    statusCode = 409;
    code = 'CONFLICT';
    message = 'Ya existe un registro con ese valor.';
  } else if (error.name === 'SequelizeValidationError' || error.name === 'SequelizeDatabaseError' && error.original?.number === 547) {
    statusCode = 400;
    code = 'VALIDATION_ERROR';
    message = 'Los datos enviados no son válidos.';
  } else if (error instanceof SyntaxError && error.status === 400 && 'body' in error) {
    statusCode = 400;
    code = 'INVALID_JSON';
    message = 'El cuerpo de la solicitud contiene JSON inválido.';
  }

  if (statusCode >= 500) {
    console.error(error);
    message = 'Error interno del servidor.';
  }

  res.status(statusCode).json({ error: { code, message } });
}
