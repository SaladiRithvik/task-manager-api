const { Task } = require('../models');

async function listTasks(filters = {}) {
  const where = {};
  if (filters.status) where.status = filters.status;
  if (filters.priority) where.priority = filters.priority;

  return Task.findAll({ where, order: [['created_at', 'DESC']] });
}

async function getTaskById(id) {
  return Task.findByPk(id);
}

async function createTask(data) {
  return Task.create(data);
}

async function updateTask(id, data) {
  const task = await Task.findByPk(id);
  if (!task) return null;

  return task.update(data);
}

async function deleteTask(id) {
  const task = await Task.findByPk(id);
  if (!task) return false;

  await task.destroy();
  return true;
}

module.exports = {
  listTasks,
  getTaskById,
  createTask,
  updateTask,
  deleteTask,
};
