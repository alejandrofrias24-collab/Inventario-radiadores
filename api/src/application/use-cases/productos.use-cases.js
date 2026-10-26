import { Producto } from '../../domain/entities/producto.js';
import { AppError } from '../../domain/errors/app-error.js';

export class CrearProducto {
  constructor(repository) { this.repository = repository; }
  async execute(input) {
    const producto = new Producto(input ?? {});
    if (await this.repository.findByCodigo(producto.codigo)) {
      throw new AppError('Ya existe un producto con ese código.', 409, 'PRODUCT_CODE_CONFLICT');
    }
    return this.repository.create(producto);
  }
}

export class ListarProductos {
  constructor(repository) { this.repository = repository; }
  async execute(filters) { return this.repository.findAll(filters); }
}

export class ObtenerProducto {
  constructor(repository) { this.repository = repository; }
  async execute(id) {
    const producto = await this.repository.findById(id);
    if (!producto) throw new AppError('Producto no encontrado.', 404, 'PRODUCT_NOT_FOUND');
    return producto;
  }
}

export class ActualizarProducto {
  constructor(repository) { this.repository = repository; }
  async execute(id, input) {
    const existing = await this.repository.findById(id);
    if (!existing) throw new AppError('Producto no encontrado.', 404, 'PRODUCT_NOT_FOUND');
    const producto = new Producto({ ...(input ?? {}), id: existing.id, creadoEn: existing.creadoEn });
    const duplicate = await this.repository.findByCodigo(producto.codigo);
    if (duplicate && Number(duplicate.id) !== Number(id)) {
      throw new AppError('Ya existe un producto con ese código.', 409, 'PRODUCT_CODE_CONFLICT');
    }
    return this.repository.update(id, producto);
  }
}

export class EliminarProducto {
  constructor(repository) { this.repository = repository; }
  async execute(id) {
    const deleted = await this.repository.delete(id);
    if (!deleted) throw new AppError('Producto no encontrado.', 404, 'PRODUCT_NOT_FOUND');
  }
}
