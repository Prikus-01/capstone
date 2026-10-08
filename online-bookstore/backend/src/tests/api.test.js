const request = require('supertest');
const app = require('../app');

describe('Auth API', () => {
  test('GET /health returns ok', async () => {
    const res = await request(app).get('/health');
    expect(res.statusCode).toBe(200);
    expect(res.body.status).toBe('ok');
  });

  test('POST /api/auth/login with invalid credentials returns 401', async () => {
    const res = await request(app).post('/api/auth/login').send({ email: 'nobody@example.com', password: 'wrong' });
    expect(res.statusCode).toBe(401);
    expect(res.body.success).toBe(false);
  });

  test('POST /api/auth/register with short password returns 400', async () => {
    const res = await request(app).post('/api/auth/register').send({ fullName: 'Test', email: 'test@t.com', password: '123' });
    expect(res.statusCode).toBe(400);
  });
});

describe('Products API', () => {
  test('GET /api/products returns array', async () => {
    const res = await request(app).get('/api/products');
    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data.products)).toBe(true);
  });

  test('GET /api/products with search returns filtered results', async () => {
    const res = await request(app).get('/api/products?search=book');
    expect(res.statusCode).toBe(200);
  });

  test('GET /api/products/:id with invalid id returns 404', async () => {
    const res = await request(app).get('/api/products/00000000-0000-0000-0000-000000000000');
    expect(res.statusCode).toBe(404);
  });
});

describe('Categories API', () => {
  test('GET /api/categories returns list', async () => {
    const res = await request(app).get('/api/categories');
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body.data.categories)).toBe(true);
  });
});
