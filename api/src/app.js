import express from 'express';
import { MongoProductoRepository } from './infrastructure/database/mongodb/repositories/mongo-producto.repository.js';
import { ProductosController } from './infrastructure/http/controllers/productos.controller.js';
import { errorHandler, notFoundHandler } from './infrastructure/http/middlewares/error-handler.js';
import { createProductosRouter } from './infrastructure/http/routes/productos.routes.js';
import { authMiddleware } from './infrastructure/http/middlewares/auth.middleware.js';
import {
  ActualizarProducto,
  CrearProducto,
  EliminarProducto,
  ListarProductos,
  ObtenerProducto
} from './application/use-cases/productos.use-cases.js';

export function createApp({ repository = new MongoProductoRepository() } = {}) {
  const app = express();
  const controller = new ProductosController({
    crear: new CrearProducto(repository),
    listar: new ListarProductos(repository),
    obtener: new ObtenerProducto(repository),
    actualizar: new ActualizarProducto(repository),
    eliminar: new EliminarProducto(repository)
  });

  app.disable('x-powered-by');
  app.use(express.json({ limit: '1mb' }));
  app.get('/api/health', (_req, res) => res.json({ status: 'ok' }));
  app.use('/api/productos', createProductosRouter(controller, authMiddleware));
  app.use(notFoundHandler);
  app.use(errorHandler);
  return app;
}
