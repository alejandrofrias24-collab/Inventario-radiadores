import { AppError } from '../../../domain/errors/app-error.js';

const asyncHandler = (handler) => (req, res, next) => Promise.resolve(handler(req, res, next)).catch(next);
function parseId(rawId) {
  if (/^[1-9]\d*$/.test(rawId)) return Number(rawId);
  if (/^[a-f\d]{24}$/i.test(rawId)) return rawId;
  throw new AppError('El id debe ser un entero positivo o un ObjectId de MongoDB.', 400, 'INVALID_ID');
}
function parseOptionalText(value, field) {
  if (value === undefined) return undefined;
  if (typeof value !== 'string' || value.length > 120) throw new AppError(`${field} debe ser texto de hasta 120 caracteres.`, 400, 'VALIDATION_ERROR');
  return value.trim();
}

export class ProductosController {
  constructor({ crear, listar, obtener, actualizar, eliminar }) {
    this.crear = asyncHandler(async (req, res) => res.status(201).json({ data: await crear.execute(req.body) }));
    this.listar = asyncHandler(async (req, res) => {
      const page = Number(req.query.page ?? 1);
      const limit = Number(req.query.limit ?? 20);
      if (!Number.isInteger(page) || page < 1 || !Number.isInteger(limit) || limit < 1 || limit > 100) throw new AppError('page debe ser >= 1 y limit debe estar entre 1 y 100.', 400, 'INVALID_PAGINATION');
      const filters = { page, limit, search: parseOptionalText(req.query.search, 'search'), marca: parseOptionalText(req.query.marca, 'marca'), vehiculo: parseOptionalText(req.query.vehiculo, 'vehiculo') };
      res.json(await listar.execute(filters));
    });
    this.obtener = asyncHandler(async (req, res) => res.json({ data: await obtener.execute(parseId(req.params.id)) }));
    this.actualizar = asyncHandler(async (req, res) => res.json({ data: await actualizar.execute(parseId(req.params.id), req.body) }));
    this.eliminar = asyncHandler(async (req, res) => { await eliminar.execute(parseId(req.params.id)); res.status(204).send(); });
  }
}
