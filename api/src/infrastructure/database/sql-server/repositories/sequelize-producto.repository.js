import { Op } from 'sequelize';
import { Producto } from '../../../../domain/entities/producto.js';
import { ProductoRepository } from '../../../../domain/repositories/producto.repository.js';
import { ProductoModel } from '../models/producto.model.js';

function toEntity(row) {
  if (!row) return null;
  const value = row.get ? row.get({ plain: true }) : row;
  return new Producto({ id: value.id, codigo: value.codigo, nombre: value.nombre, descripcion: value.descripcion, marca: value.marca, modelo: value.modelo, vehiculo: value.vehiculo, anioDesde: value.anioDesde, anioHasta: value.anioHasta, precio: value.precio, stock: value.stock, creadoEn: value.creadoEn, actualizadoEn: value.actualizadoEn });
}

export class SequelizeProductoRepository extends ProductoRepository {
  async create(producto) {
    const { codigo, nombre, descripcion, marca, modelo, vehiculo, anioDesde, anioHasta, precio, stock } = producto.toJSON();
    return toEntity(await ProductoModel.create({ codigo, nombre, descripcion, marca, modelo, vehiculo, anioDesde, anioHasta, precio, stock }));
  }
  async findAll({ page, limit, search, marca, vehiculo }) {
    const where = {};
    if (search) where[Op.or] = [{ codigo: { [Op.like]: `%${search}%` } }, { nombre: { [Op.like]: `%${search}%` } }, { modelo: { [Op.like]: `%${search}%` } }];
    if (marca) where.marca = { [Op.like]: `%${marca}%` };
    if (vehiculo) where.vehiculo = { [Op.like]: `%${vehiculo}%` };
    const { rows, count } = await ProductoModel.findAndCountAll({ where, order: [['id', 'DESC']], offset: (page - 1) * limit, limit });
    return { data: rows.map(toEntity), pagination: { page, limit, total: count, totalPages: Math.ceil(count / limit) } };
  }
  async findById(id) { return toEntity(await ProductoModel.findByPk(id)); }
  async findByCodigo(codigo) { return toEntity(await ProductoModel.findOne({ where: { codigo } })); }
  async update(id, producto) {
    const row = await ProductoModel.findByPk(id);
    if (!row) return null;
    const { codigo, nombre, descripcion, marca, modelo, vehiculo, anioDesde, anioHasta, precio, stock } = producto.toJSON();
    await row.update({ codigo, nombre, descripcion, marca, modelo, vehiculo, anioDesde, anioHasta, precio, stock, actualizadoEn: new Date() });
    return toEntity(row);
  }
  async delete(id) { return (await ProductoModel.destroy({ where: { id } })) > 0; }
}
