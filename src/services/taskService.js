import * as taskRepo from '../repositories/taskRepo.js';

export async function createTask(taskData) {
  return taskRepo.create(taskData);
}

export async function findTasksByUserId(userId) {
  return taskRepo.findByUserId(userId);
}

export async function findAllTasks() {
  return taskRepo.findAll();
}

export async function findTaskById(id) {
  const task = await taskRepo.findById(id);
  if (!task) {
    const error = new Error('Task not found');
    error.status = 404;
    throw error;
  }
  return task;
}

export async function updateTaskById(id, updatedData) {
  const task = await taskRepo.findById(id);
  if (!task) {
    const error = new Error('Task not found');
    error.status = 404;
    throw error;
  }
  return taskRepo.updateById(id, updatedData);
}

export async function deleteTaskById(id) {
  const task = await taskRepo.findById(id);
  if (!task) {
    const error = new Error('Task not found');
    error.status = 404;
    throw error;
  }
  return taskRepo.deleteById(id);
}
