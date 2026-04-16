import express, { Router } from 'express';

import { IUserController } from '../controllers/UserController';

export class UserRoutes {
  constructor(private readonly userController: IUserController) {}

  getRoutes(): Router {
    const router = express.Router();

    router.post('/', (req, res) => {
      return this.userController.create(req, res);
    });

    router.put('/:id', (req, res) => {
      return this.userController.update(req, res);
    });

    router.get('/:id', (req, res) => {
      return this.userController.getById(req, res);
    });

    router.delete('/:id', (req, res) => {
      return this.userController.delete(req, res);
    });

    return router;
  }
}
