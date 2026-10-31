import express from 'express';
import { createProxyMiddleware } from 'http-proxy-middleware';

const app = express();
const authTarget = process.env.AUTH_SERVICE_URL || 'http://localhost:3001';
const businessTarget = process.env.BUSINESS_SERVICE_URL || 'http://localhost:3002';

app.disable('x-powered-by');
app.get('/api/health', (_req, res) => res.json({ status: 'ok', service: 'gateway' }));
app.use('/api/auth', createProxyMiddleware({ target: authTarget, changeOrigin: true, pathRewrite: (path) => `/auth${path}` }));
app.use('/api/productos', createProxyMiddleware({ target: businessTarget, changeOrigin: true, pathRewrite: (path) => `/api/productos${path === '/' ? '' : path}` }));

const port = Number(process.env.PORT || 3000);
app.listen(port, () => console.info(`API Gateway disponible en http://localhost:${port}`));
