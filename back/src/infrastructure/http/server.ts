import express, { Request, Response } from "express";

import { PrismaClient } from "@/generated/prisma/internal/class";

import routes, { setConnection } from "./routes";

const app = express();

export default class HttpServer {
  constructor(readonly connection: PrismaClient) {}

  start() {
    //CORS
    app.use((_, res, next) => {
      res.header("Access-Control-Allow-Origin", process.env.CORS_ORIGIN ?? "*");
      res.header("Access-Control-Allow-Methods", "*"); // GET, PUT, POST, DELETE, OPTIONS
      res.header("Access-Control-Allow-Headers", "*"); // Origin, X-Requested-With, Content-Type, Accept, Authorization
      next();
    });

    //BODY PARSER
    app.use(express.json()); // <--- necessário para JSON
    app.use(express.urlencoded({ extended: true }));

    //ROUTES
    setConnection(this.connection);
    app.use("/api/v1", routes);

    return app;
  }
}
