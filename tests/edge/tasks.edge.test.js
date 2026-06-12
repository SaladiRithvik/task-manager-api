const request = require('supertest');
const app = require('../../src/app');
const { sequelize } = require('../../src/models');

beforeAll(() => sequelize.sync({ force: true }));
afterAll(() => sequelize.close());

describe('Task API edge cases', () => {
  describe('POST /api/tasks', () => {
    it('returns 400 when title is missing', async () => {
      const res = await request(app).post('/api/tasks').send({});

      expect(res.status).toBe(400);
      expect(Array.isArray(res.body.errors)).toBe(true);
      expect(res.body.errors.length).toBeGreaterThan(0);
    });

    it('returns 400 when title exceeds 200 characters', async () => {
      const res = await request(app)
        .post('/api/tasks')
        .send({ title: 'a'.repeat(201) });

      expect(res.status).toBe(400);
      expect(Array.isArray(res.body.errors)).toBe(true);
      expect(res.body.errors.length).toBeGreaterThan(0);
    });

    // Gap: Sequelize's ENUM type isn't enforced by an `isIn` validator on
    // create(), so SQLite accepts any string value for status.
    it.todo(
      'POST /api/tasks with an invalid status enum value should return 400 — ' +
        "currently returns 201 because Sequelize doesn't validate ENUM values " +
        'on create() without an explicit isIn validator'
    );
  });

  describe('GET /api/tasks/:id', () => {
    it('returns 404 for a non-existent id', async () => {
      const res = await request(app).get('/api/tasks/999999');

      expect(res.status).toBe(404);
    });
  });

  describe('DELETE /api/tasks/:id', () => {
    it('returns 204 then 404 when deleting the same task twice', async () => {
      const created = (
        await request(app).post('/api/tasks').send({ title: 'Delete me twice' })
      ).body;

      const firstDelete = await request(app).delete(`/api/tasks/${created.id}`);
      expect(firstDelete.status).toBe(204);

      const secondDelete = await request(app).delete(`/api/tasks/${created.id}`);
      expect(secondDelete.status).toBe(404);
    });
  });

  // Gaps: tutorial expects stricter validation than the current implementation provides.
  it.todo(
    'PUT /api/tasks/:id with an empty body {} should return 400 — currently returns ' +
      '200 with the task unchanged'
  );

  it.todo(
    'GET /api/tasks?status=<invalid> should return 400 — currently returns 200 with ' +
      'an empty array (no query-param whitelist validation)'
  );

  it.todo(
    'GET /api/tasks?priority=<invalid> should return 400 — currently returns 200 ' +
      'with an empty array (no query-param whitelist validation)'
  );
});
