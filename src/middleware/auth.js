import jwt from 'jsonwebtoken';
import { findById } from '../repositories/taskRepo.js';

export function authenticate(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({ errors: 'Authorization header is missing' });
  }

  const parts = authHeader.split(' ');
  if (parts.length !== 2 || parts[0] !== 'Bearer') {
    return res.status(401).json({ errors: 'Authorization header is malformatted' });
  }

  const token = parts[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ errors: 'Invalid or expired token' });
  }
}

export function requireAdmin(req, res, next) {
  if (req.user.role !== 'ADMIN') {
    return res.status(403).json({ errors: 'Forbidden: Admin access required' });
  }
  next();
}

export async function requireTaskOwnership(req, res, next) {
  const taskId = parseInt(req.params.id);

  const task = await findById(taskId);

  if (!task) {
    return res.status(404).json({ errors: 'Task not found' });
  }

  if (req.user.role === 'ADMIN') {
    req.task = task;
    return next();
  }

  if (task.userId !== req.user.id) {
    return res.status(403).json({ errors: 'Forbidden: You do not own this task' });
  }

  req.task = task;
  next();
}
