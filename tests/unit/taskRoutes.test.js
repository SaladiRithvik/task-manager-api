jest.mock('../../src/services/taskService', () => ({
  listTasks: jest.fn(),
  getTaskById: jest.fn(),
  createTask: jest.fn(),
  updateTask: jest.fn(),
  deleteTask: jest.fn(),
}));

const express = require('express');
const request = require('supertest');
const taskService = require('../../src/services/taskService');
const taskRoutes = require('../../src/routes/taskRoutes');
const errorHandler = require('../../src/middleware/errorHandler');

const app = express();
app.use(express.json());
app.use('/api/tasks', taskRoutes);
app.use(errorHandler);

describe('taskRoutes error handling', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    console.error.mockRestore();
  });

  it('GET / forwards service errors to the error handler', async () => {
    taskService.listTasks.mockRejectedValue(new Error('boom'));

    const res = await request(app).get('/api/tasks');

    expect(res.status).toBe(500);
  });

  it('GET /:id forwards service errors to the error handler', async () => {
    taskService.getTaskById.mockRejectedValue(new Error('boom'));

    const res = await request(app).get('/api/tasks/1');

    expect(res.status).toBe(500);
  });

  it('PUT /:id forwards service errors to the error handler', async () => {
    taskService.updateTask.mockRejectedValue(new Error('boom'));

    const res = await request(app).put('/api/tasks/1').send({ title: 'Updated' });

    expect(res.status).toBe(500);
  });

  it('DELETE /:id forwards service errors to the error handler', async () => {
    taskService.deleteTask.mockRejectedValue(new Error('boom'));

    const res = await request(app).delete('/api/tasks/1');

    expect(res.status).toBe(500);
  });
});
