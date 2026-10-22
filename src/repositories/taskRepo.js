import prisma from '../config/db.js';

export async function create(taskData) {
  return prisma.task.create({ data: taskData });
}

export async function findAll() {
  return prisma.task.findMany();
}

export async function findByUserId(userId) {
  return prisma.task.findMany({ where: { userId } });
}

export async function findById(id) {
  return prisma.task.findUnique({ where: { id } });
}

export async function updateById(id, updatedData) {
  return prisma.task.update({ where: { id }, data: updatedData });
}

export async function deleteById(id) {
  return prisma.task.delete({ where: { id } });
}
