// import { UserControllers } from "@/modules/user/UserController";
// import { UserRepositories } from "@/modules/user/UserRepository";
// import { UserUseCases } from "@/modules/user/UserUseCase";
import express from "express";

import { PrismaClient } from "@/generated/prisma/client";

import { UserRoutes } from "./UserRoutes";

const router = express.Router();

export function setConnection(connection: PrismaClient) {
  //   const userRepositories = new UserRepositories(connection);
  //   const userUseCases = new UserUseCases(userRepositories);
  //   const userControllers = new UserControllers(userUseCases);
  // const userRoutes = new UserRoutes(userControllers).getRoutes();
  // router.use("/user", userRoutes);
}

export default router;
