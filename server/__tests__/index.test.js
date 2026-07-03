const request = require('supertest');
const app = require('../index');

describe('Melvine AI Assistant API', () => {
  describe('GET /', () => {
    it('should return health status', async () => {
      const res = await request(app).get('/');
      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('status', 'ok');
      expect(res.body).toHaveProperty('agent');
    });
  });

  describe('GET /health', () => {
    it('should return healthy status', async () => {
      const res = await request(app).get('/health');
      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('status', 'healthy');
    });
  });

  describe('POST /chat', () => {
    it('should reject request with missing system prompt', async () => {
      const res = await request(app)
        .post('/chat')
        .send({
          messages: [{ role: 'user', content: 'Hello' }],
        });
      expect(res.statusCode).toBe(400);
      expect(res.body).toHaveProperty('error');
    });

    it('should reject request with empty messages', async () => {
      const res = await request(app)
        .post('/chat')
        .send({
          system: 'You are a helpful assistant',
          messages: [],
        });
      expect(res.statusCode).toBe(400);
      expect(res.body).toHaveProperty('error');
    });

    it('should reject invalid max_tokens', async () => {
      const res = await request(app)
        .post('/chat')
        .send({
          system: 'You are a helpful assistant',
          messages: [{ role: 'user', content: 'Hello' }],
          max_tokens: 5000,
        });
      expect(res.statusCode).toBe(400);
      expect(res.body).toHaveProperty('error');
    });
  });

  describe('404 handler', () => {
    it('should return 404 for unknown route', async () => {
      const res = await request(app).get('/unknown');
      expect(res.statusCode).toBe(404);
      expect(res.body).toHaveProperty('error', 'Not found');
    });
  });
});
