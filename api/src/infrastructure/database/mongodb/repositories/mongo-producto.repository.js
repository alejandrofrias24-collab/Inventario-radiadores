import mongoose from 'mongoose';
import { Producto } from '../../../../domain/entities/producto.js';
import { ProductoRepository } from '../../../../domain/repositories/producto.repository.js';
import { ProductoCounterModel, ProductoModel } from '../models/producto.model.js';

const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const toEntity = (value) => value ? new Producto({
  id: value.id ?? String(value._id),
  codigo: value.codigo,
  nombre: value.nombre,
  descripcion: value.descripcion ?? null,
  marca: value.marca,
  modelo: value.modelo,
  vehiculo: value.vehiculo_compatible ?? value.vehiculo,
  anioDesde: value.ano_desde ?? value.anioDesde,
  anioHasta: value.ano_hasta ?? value.anioHasta,
  precio: value.precio_dop ?? value.precio,
  stock: value.stock ?? 0,
  creadoEn: value.creadoEn,
  actualizadoEn: value.actualizadoEn
}) : null;

function toDocument(producto) {
  const value = producto.toJSON();
  return {
    codigo: value.codigo,
    nombre: value.nombre,
    marca: value.marca,
    modelo: value.modelo,
    vehiculo_compatible: value.vehiculo,
    ano_desde: value.anioDesde,
    ano_hasta: value.anioHasta,
    precio_dop: value.precio,
    descripcion: value.descripcion,
    stock: value.stock
  };
}

function byId(id) {
  const raw = String(id);
  if (/^\d+$/.test(raw)) return { id: Number(raw) };
  if (mongoose.isValidObjectId(raw)) return { _id: new mongoose.Types.ObjectId(raw) };
  return { _id: raw };
}

export class MongoProductoRepository extends ProductoRepository {
  async create(producto) {
    const counter = await ProductoCounterModel.findOneAndUpdate(
      { _id: 'productos' }, { $inc: { seq: 1 } }, { new: true, upsert: true, setDefaultsOnInsert: true }
    );
    const record = await ProductoModel.create({ ...toDocument(producto), id: counter.seq });
    return toEntity(record);
  }

  async findAll({ page, limit, search, marca, vehiculo }) {
    const clauses = [];
    if (search) {
      const pattern = new RegExp(escapeRegex(search), 'i');
      clauses.push({ $or: [{ codigo: pattern }, { nombre: pattern }, { modelo: pattern }, { vehiculo_compatible: pattern }] });
    }
    if (marca) clauses.push({ marca: new RegExp(escapeRegex(marca), 'i') });
    if (vehiculo) {
      const pattern = new RegExp(escapeRegex(vehiculo), 'i');
      clauses.push({ $or: [{ vehiculo_compatible: pattern }, { vehiculo: pattern }] });
    }
    const where = clauses.length ? { $and: clauses } : {};
    const [rows, total] = await Promise.all([
      ProductoModel.find(where).sort({ id: -1, _id: -1 }).skip((page - 1) * limit).limit(limit).lean(),
      ProductoModel.countDocuments(where)
    ]);
    return { data: rows.map(toEntity), pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } };
  }

  async findById(id) { return toEntity(await ProductoModel.findOne(byId(id)).lean()); }
  async findByCodigo(codigo) { return toEntity(await ProductoModel.findOne({ codigo }).lean()); }

  async update(id, producto) {
    const updated = await ProductoModel.findOneAndUpdate(byId(id), { $set: toDocument(producto) }, { new: true, runValidators: true }).lean();
    return toEntity(updated);
  }

  async delete(id) { return (await ProductoModel.deleteOne(byId(id))).deletedCount > 0; }
}
