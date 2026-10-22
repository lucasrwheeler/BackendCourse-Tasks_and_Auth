import jwt from 'jsonwebtoken';
import { findById } from '../repositories/taskRepo.js';

export function authenticate(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    const err = new Error('Authorization header is missing');
    err.status = 401;
    return next(err);
  }

  const parts = authHeader.split(' ');
  if (parts.length !== 2 || parts[0] !== 'Bearer') {
    const err = new Error('Authorization header is malformatted');
    err.status = 401;
    return next(err);
  }

  const token = parts[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    const err = new Error('Invalid or expired token');
    err.status = 401;
    return next(err);
  }
}

export function requireAdmin(req, res, next) {
  if (req.user.role !== 'ADMIN') {
    const err = new Error('Forbidden: Admin access required');
    err.status = 403;
    return next(err);
  }
  next();
}

export async function requireTaskOwnership(req, res, next) {
  const taskId = parseInt(req.params.id);

  const task = await findById(taskId);

  if (!task) {
    return res.status(404).json({ errors: 'Task not found' });
  }

  if (task.userId != req.user.id) {
    return res.status(403).json({ errors: 'Forbidden: You do not own this task' });
  }

  req.task = task;
  next();
}
