import * as taskService from '../services/taskService.js';

export async function createTaskHandler(req, res) {
  const { title, completed } = req.body;
  const task = await taskService.createTask({
    title,
    completed,
    userId: req.user.id,
  });
  res.status(201).json(task);
}

export async function getAllTasksHandler(req, res) {
  const tasks = await taskService.findAllTasks();
  res.status(200).json(tasks);
}

export async function getMyTasksHandler(req, res) {
  const tasks = await taskService.findTasksByUserId(req.user.id);
  res.status(200).json(tasks);
}

export async function getTaskByIdHandler(req, res) {
  const task = await taskService.findTaskById(parseInt(req.params.id));
  res.status(200).json(task);
}

export async function updateTaskByIdHandler(req, res) {
  const { title, completed } = req.body;
  const updateData = {};
  if (title !== undefined) updateData.title = title;
  if (completed !== undefined) updateData.completed = completed;
  const task = await taskService.updateTaskById(parseInt(req.params.id), updateData);
  res.status(200).json(task);
}

export async function deleteTaskByIdHandler(req, res) {
  await taskService.deleteTaskById(parseInt(req.params.id));
  res.status(204).send();
}
