import { test } from 'node:test';
import assert from 'node:assert/strict';
import request from 'supertest';
import { createAuthApp } from '../src/app.js';

process.env.JWT_SECRET = 'test-secret-which-is-long-enough-for-signing';
const users = new Map();
const Usuario = {
  async findOne({ where }) { return users.get(where.email) ?? null; },
  async create(data) { const user = { id: users.size + 1, ...data }; users.set(user.email, user); return user; }
};
const events = [];
const app = createAuthApp({ Usuario, publishUserCreated: async (event) => events.push(event) });

test('GET /health identifica el servicio de autenticación', async () => {
  const response = await request(app).get('/health');
  assert.equal(response.status, 200);
  assert.equal(response.body.service, 'auth');
});

test('POST /auth/register crea usuario, token y publica usuario.creado', async () => {
  const response = await request(app).post('/auth/register').send({ nombre: 'Ana Pérez', email: 'ANA@example.com', password: 'password-segura' });
  assert.equal(response.status, 201);
  assert.ok(response.body.data.token);
  assert.equal(events[0].email, 'ana@example.com');
});

test('POST /auth/login emite un token con credenciales válidas', async () => {
  const response = await request(app).post('/auth/login').send({ email: 'ana@example.com', password: 'password-segura' });
  assert.equal(response.status, 200);
  assert.equal(response.body.data.user.email, 'ana@example.com');
});
