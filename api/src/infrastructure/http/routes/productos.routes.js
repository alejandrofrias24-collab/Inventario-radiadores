import { Router } from 'express';

export function createProductosRouter(controller, authMiddleware) {
  const router = Router();
  router.get('/', controller.listar);
  router.post('/', authMiddleware, controller.crear);
  router.get('/:id', controller.obtener);
  router.put('/:id', authMiddleware, controller.actualizar);
  router.delete('/:id', authMiddleware, controller.eliminar);
  return router;
}
