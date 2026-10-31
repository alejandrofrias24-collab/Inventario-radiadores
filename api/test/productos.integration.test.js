import { before, test } from 'node:test';
import assert from 'node:assert/strict';
import request from 'supertest';
import jwt from 'jsonwebtoken';
import { Producto } from '../src/domain/entities/producto.js';
import { CrearProducto } from '../src/application/use-cases/productos.use-cases.js';

process.env.SQL_SERVER = 'localhost';
process.env.SQL_DATABASE = 'test';
process.env.SQL_USER = 'sa';
process.env.SQL_PASSWORD = 'not-used-in-tests';
process.env.JWT_SECRET = 'test-secret-which-is-long-enough-for-signing';

let app;
let repository;
before(async () => {
  repository = {
    products: [],
    async create(product) { const saved = new Producto({ ...product.toJSON(), id: this.products.length + 1 }); this.products.push(saved); return saved; },
    async findAll(filters) { return { data: this.products, pagination: { ...filters, total: this.products.length, totalPages: this.products.length ? 1 : 0 } }; },
    async findById(id) { return this.products.find((item) => item.id === id) ?? null; },
    async findByCodigo(code) { return this.products.find((item) => item.codigo === code) ?? null; },
    async update(id, product) { const index = this.products.findIndex((item) => item.id === id); if (index < 0) return null; return this.products[index] = new Producto({ ...product.toJSON(), id }); },
    async delete(id) { const index = this.products.findIndex((item) => item.id === id); if (index < 0) return false; this.products.splice(index, 1); return true; }
  };
  ({ createApp } = await import('../src/app.js'));
  app = createApp({ repository });
});

let createApp;
const productPayload = { codigo: 'RAD-001', nombre: 'Radiador Corolla', marca: 'Toyota', modelo: 'Corolla', vehiculo: 'Toyota Corolla', anioDesde: 2018, anioHasta: 2024, precio: 12500, stock: 4 };

test('caso de uso CrearProducto valida y persiste el producto', async () => {
  const memory = { async findByCodigo() { return null; }, async create(product) { return product; } };
  const created = await new CrearProducto(memory).execute(productPayload);
  assert.equal(created.codigo, 'RAD-001');
  assert.equal(created.precio, 12500);
});

test('GET /api/health responde estado disponible', async () => {
  const response = await request(app).get('/api/health');
  assert.equal(response.status, 200);
  assert.equal(response.body.status, 'ok');
});

test('GET /api/productos lista productos y POST requiere token', async () => {
  const list = await request(app).get('/api/productos');
  assert.equal(list.status, 200);
  assert.ok(Array.isArray(list.body.data));
  const denied = await request(app).post('/api/productos').send(productPayload);
  assert.equal(denied.status, 401);
});

test('POST /api/productos acepta un token válido', async () => {
  const token = jwt.sign({ sub: '1', email: 'ana@example.com' }, process.env.JWT_SECRET, { expiresIn: '5m' });
  const response = await request(app).post('/api/productos').set('Authorization', `Bearer ${token}`).send(productPayload);
  assert.equal(response.status, 201);
  assert.equal(response.body.data.codigo, 'RAD-001');
});
