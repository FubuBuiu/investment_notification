import express, { Router } from "express";

export class UserRoutes {
    constructor(private readonly userController: IUserControllers) { }

    getRoutes(): Router {
        const router = express.Router();

        router.post("/", (req, res) => {
            return this.userController.create(req, res);
        });

        return router;
    }
}