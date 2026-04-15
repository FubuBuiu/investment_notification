// import { UserControllers } from "@/modules/user/UserController";
// import { UserRepositories } from "@/modules/user/UserRepository";
// import { UserUseCases } from "@/modules/user/UserUseCase";
import express from 'express';

import { UserUseCase } from '@/domain/usecases/UserUseCase';
import { PrismaClient } from '@/generated/prisma/client';
import { UserRepository } from '@/infrastructure/repositories/UserRepository';

import { UserController } from '../controllers/UserController';
import { UserRoutes } from './UserRoutes';

const router = express.Router();

export function setConnection(connection: PrismaClient) {
  // Test route
  router.get('/test', (req, res) => {
    res.status(200).json({
      status: 'ok',
      message: 'Server is alive! 🚀',
    });
  });

  // User
  const userRepositories = new UserRepository(connection);
  const userUseCases = new UserUseCase(userRepositories);
  const userControllers = new UserController(userUseCases);
  const userRoutes = new UserRoutes(userControllers).getRoutes();
  router.use('/user', userRoutes);
}

export default router;
