import express, { Router } from 'express';

import { IUserController } from '../controllers/UserController';

export class UserRoutes {
  constructor(private readonly userController: IUserController) {}

  getRoutes(): Router {
    const router = express.Router();

    router.post('/create', (req, res) => {
      return this.userController.create(req, res);
    });

    return router;
  }
}
