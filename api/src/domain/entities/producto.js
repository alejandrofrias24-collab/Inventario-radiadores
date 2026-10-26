import { AppError } from '../errors/app-error.js';

const currentYear = new Date().getFullYear();

export class Producto {
  constructor({
    id = null,
    codigo,
    nombre,
    descripcion = null,
    marca,
    modelo,
    vehiculo,
    anioDesde,
    anioHasta,
    precio,
    stock = 0,
    creadoEn = null,
    actualizadoEn = null
  }) {
    this.id = id;
    this.codigo = Producto.requiredText(codigo, 'codigo', 40);
    this.nombre = Producto.requiredText(nombre, 'nombre', 160);
    this.descripcion = Producto.optionalText(descripcion, 'descripcion', 1000);
    this.marca = Producto.requiredText(marca, 'marca', 100);
    this.modelo = Producto.requiredText(modelo, 'modelo', 120);
    this.vehiculo = Producto.requiredText(vehiculo, 'vehiculo', 120);
    this.anioDesde = Producto.year(anioDesde, 'anioDesde');
    this.anioHasta = Producto.year(anioHasta, 'anioHasta');
    if (this.anioHasta < this.anioDesde) {
      throw new AppError('anioHasta no puede ser menor que anioDesde.', 400, 'VALIDATION_ERROR');
    }
    this.precio = Producto.nonNegativeNumber(precio, 'precio');
    this.stock = Producto.nonNegativeInteger(stock, 'stock');
    this.creadoEn = creadoEn;
    this.actualizadoEn = actualizadoEn;
  }

  static requiredText(value, field, maxLength) {
    if (typeof value !== 'string' || value.trim().length === 0 || value.trim().length > maxLength) {
      throw new AppError(`${field} es obligatorio y debe tener entre 1 y ${maxLength} caracteres.`, 400, 'VALIDATION_ERROR');
    }
    return value.trim();
  }

  static optionalText(value, field, maxLength) {
    if (value === null || value === undefined || value === '') return null;
    if (typeof value !== 'string' || value.trim().length > maxLength) {
      throw new AppError(`${field} debe ser texto de hasta ${maxLength} caracteres.`, 400, 'VALIDATION_ERROR');
    }
    return value.trim();
  }

  static year(value, field) {
    if (!Number.isInteger(Number(value)) || Number(value) < 1900 || Number(value) > currentYear + 1) {
      throw new AppError(`${field} debe ser un año entre 1900 y ${currentYear + 1}.`, 400, 'VALIDATION_ERROR');
    }
    return Number(value);
  }

  static nonNegativeNumber(value, field) {
    const number = Number(value);
    if (value === '' || value === null || value === undefined || !Number.isFinite(number) || number < 0) {
      throw new AppError(`${field} debe ser un número mayor o igual a cero.`, 400, 'VALIDATION_ERROR');
    }
    return number;
  }

  static nonNegativeInteger(value, field) {
    const number = Number(value);
    if (value === '' || value === null || value === undefined || !Number.isInteger(number) || number < 0) {
      throw new AppError(`${field} debe ser un entero mayor o igual a cero.`, 400, 'VALIDATION_ERROR');
    }
    return number;
  }

  toJSON() {
    return {
      id: this.id,
      codigo: this.codigo,
      nombre: this.nombre,
      descripcion: this.descripcion,
      marca: this.marca,
      modelo: this.modelo,
      vehiculo: this.vehiculo,
      anioDesde: this.anioDesde,
      anioHasta: this.anioHasta,
      precio: this.precio,
      stock: this.stock,
      creadoEn: this.creadoEn,
      actualizadoEn: this.actualizadoEn
    };
  }
}
