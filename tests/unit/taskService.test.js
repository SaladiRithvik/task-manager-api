jest.mock('../../src/models', () => ({
  Task: {
    findAll: jest.fn(),
    findByPk: jest.fn(),
    create: jest.fn(),
  },
}));

const { Task } = require('../../src/models');
const taskService = require('../../src/services/taskService');

describe('taskService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('listTasks', () => {
    it('calls Task.findAll with no filters when none are provided', async () => {
      Task.findAll.mockResolvedValue([]);

      await taskService.listTasks();

      expect(Task.findAll).toHaveBeenCalledWith({
        where: {},
        order: [['created_at', 'DESC']],
      });
    });

    it('filters by status when provided', async () => {
      Task.findAll.mockResolvedValue([]);

      await taskService.listTasks({ status: 'todo' });

      expect(Task.findAll).toHaveBeenCalledWith({
        where: { status: 'todo' },
        order: [['created_at', 'DESC']],
      });
    });

    it('filters by priority when provided', async () => {
      Task.findAll.mockResolvedValue([]);

      await taskService.listTasks({ priority: 'high' });

      expect(Task.findAll).toHaveBeenCalledWith({
        where: { priority: 'high' },
        order: [['created_at', 'DESC']],
      });
    });
  });

  describe('getTaskById', () => {
    it('returns the task when found', async () => {
      const task = { id: 1, title: 'Test task' };
      Task.findByPk.mockResolvedValue(task);

      const result = await taskService.getTaskById(1);

      expect(Task.findByPk).toHaveBeenCalledWith(1);
      expect(result).toBe(task);
    });

    it('returns null when not found', async () => {
      Task.findByPk.mockResolvedValue(null);

      const result = await taskService.getTaskById(999);

      expect(result).toBeNull();
    });
  });

  describe('createTask', () => {
    it('creates a task with valid data', async () => {
      const data = { title: 'New task' };
      const created = { id: 1, ...data };
      Task.create.mockResolvedValue(created);

      const result = await taskService.createTask(data);

      expect(Task.create).toHaveBeenCalledWith(data);
      expect(result).toBe(created);
    });

    it('propagates a SequelizeValidationError when title is empty', async () => {
      const validationError = {
        name: 'SequelizeValidationError',
        errors: [{ message: 'Validation error: title cannot be empty' }],
      };
      Task.create.mockRejectedValue(validationError);

      await expect(taskService.createTask({ title: '' })).rejects.toBe(validationError);
    });

    // Gap: tutorial expects a custom validation error with a .status property
    // instead of Sequelize's native SequelizeValidationError.
    it.todo(
      'createTask should reject with a custom "Title is required" error exposing ' +
        '.status === 400 when title is empty/whitespace — currently propagates ' +
        "Sequelize's own SequelizeValidationError with no .status property"
    );
  });

  describe('updateTask', () => {
    it('updates and returns the task when found', async () => {
      const updated = { id: 1, title: 'Updated task' };
      const task = { update: jest.fn().mockResolvedValue(updated) };
      Task.findByPk.mockResolvedValue(task);

      const result = await taskService.updateTask(1, { title: 'Updated task' });

      expect(Task.findByPk).toHaveBeenCalledWith(1);
      expect(task.update).toHaveBeenCalledWith({ title: 'Updated task' });
      expect(result).toBe(updated);
    });

    it('returns null when not found', async () => {
      Task.findByPk.mockResolvedValue(null);

      const result = await taskService.updateTask(999, { title: 'Updated task' });

      expect(result).toBeNull();
    });
  });

  describe('deleteTask', () => {
    it('destroys the task and returns true when found', async () => {
      const task = { destroy: jest.fn().mockResolvedValue() };
      Task.findByPk.mockResolvedValue(task);

      const result = await taskService.deleteTask(1);

      expect(Task.findByPk).toHaveBeenCalledWith(1);
      expect(task.destroy).toHaveBeenCalled();
      expect(result).toBe(true);
    });

    it('returns false when not found', async () => {
      Task.findByPk.mockResolvedValue(null);

      const result = await taskService.deleteTask(999);

      expect(result).toBe(false);
    });
  });
});
