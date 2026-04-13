import signale from "signale";

import { PrismaConnection } from "./infrastructure/database/prismaClient";

async function main() {
  try {
    //DATABASE CONNECTION
    const connection = await PrismaConnection.getInstance().connect();

    //HTTP SERVER
    const httpApp = new HttpServer(connection);
    const app = httpApp.start();

    //HTTP LISTEN
    if (!process.env.PORT) {
      signale.warn("PORTA NÃO DEFINIDA, UTILIZANDO PORTA PADRÃO");
    }
    const port = process.env.PORT ?? "3001";
    const httpserver = app.listen(port, () => {
      signale.success(`HTTP Server running at http://localhost:${port}`);
    });

    process.on("SIGINT", () =>
      gracefulShutdown("SIGINT", httpserver, httpserver),
    );
    process.on("SIGTERM", () =>
      gracefulShutdown("SIGTERM", httpserver, httpserver),
    );
  } catch (error) {
    console.log(error);
    process.exit(1);
  }
}

main();
