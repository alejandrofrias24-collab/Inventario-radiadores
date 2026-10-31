import { Router } from 'express';

const asyncHandler = (handler) => (req, res, next) => Promise.resolve(handler(req, res, next)).catch(next);
export function createAuthRouter(controller) {
  const router = Router();
  router.post('/register', asyncHandler(controller.register));
  router.post('/login', asyncHandler(controller.login));
  return router;
}
