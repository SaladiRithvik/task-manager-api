const request = require('supertest');
const app = require('../../src/app');
const { sequelize } = require('../../src/models');

beforeAll(() => sequelize.sync({ force: true }));
afterAll(() => sequelize.close());

describe('Task API integration', () => {
  describe('POST /api/tasks', () => {
    it('creates a task with a valid payload', async () => {
      const res = await request(app)
        .post('/api/tasks')
        .send({ title: 'Write tests' });

      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty('id');
      expect(res.body).toHaveProperty('created_at');
      expect(res.body.title).toBe('Write tests');
      expect(res.body.status).toBe('todo');
      expect(res.body.priority).toBe('medium');
    });
  });

  describe('GET /api/tasks', () => {
    let todoTask;
    let highPriorityTask;

    beforeAll(async () => {
      todoTask = (
        await request(app).post('/api/tasks').send({ title: 'Todo task', status: 'todo' })
      ).body;
      highPriorityTask = (
        await request(app).post('/api/tasks').send({ title: 'High priority task', priority: 'high' })
      ).body;
    });

    it('returns 200 with an array containing the created tasks', async () => {
      const res = await request(app).get('/api/tasks');

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      const ids = res.body.map((t) => t.id);
      expect(ids).toEqual(expect.arrayContaining([todoTask.id, highPriorityTask.id]));
    });

    it('filters by status', async () => {
      const res = await request(app).get('/api/tasks?status=todo');

      expect(res.status).toBe(200);
      res.body.forEach((task) => expect(task.status).toBe('todo'));
      expect(res.body.map((t) => t.id)).toContain(todoTask.id);
    });

    it('filters by priority', async () => {
      const res = await request(app).get('/api/tasks?priority=high');

      expect(res.status).toBe(200);
      res.body.forEach((task) => expect(task.priority).toBe('high'));
      expect(res.body.map((t) => t.id)).toContain(highPriorityTask.id);
    });
  });

  describe('GET /api/tasks/:id', () => {
    let task;

    beforeAll(async () => {
      task = (await request(app).post('/api/tasks').send({ title: 'Get me' })).body;
    });

    it('returns 200 with the task when it exists', async () => {
      const res = await request(app).get(`/api/tasks/${task.id}`);

      expect(res.status).toBe(200);
      expect(res.body.id).toBe(task.id);
      expect(res.body.title).toBe('Get me');
    });

    it('returns 404 when the task does not exist', async () => {
      const res = await request(app).get('/api/tasks/999999');

      expect(res.status).toBe(404);
    });
  });

  describe('PUT /api/tasks/:id', () => {
    let task;

    beforeAll(async () => {
      task = (await request(app).post('/api/tasks').send({ title: 'Update me' })).body;
    });

    it('returns 200 with the updated task', async () => {
      const res = await request(app)
        .put(`/api/tasks/${task.id}`)
        .send({ title: 'Updated title', status: 'in_progress' });

      expect(res.status).toBe(200);
      expect(res.body.title).toBe('Updated title');
      expect(res.body.status).toBe('in_progress');
    });

    it('returns 404 when the task does not exist', async () => {
      const res = await request(app)
        .put('/api/tasks/999999')
        .send({ title: 'Does not matter' });

      expect(res.status).toBe(404);
    });
  });

  describe('DELETE /api/tasks/:id', () => {
    let task;

    beforeAll(async () => {
      task = (await request(app).post('/api/tasks').send({ title: 'Delete me' })).body;
    });

    it('returns 204 when the task is deleted', async () => {
      const res = await request(app).delete(`/api/tasks/${task.id}`);

      expect(res.status).toBe(204);
    });

    it('returns 404 when the task does not exist', async () => {
      const res = await request(app).delete('/api/tasks/999999');

      expect(res.status).toBe(404);
    });
  });
});
