import signale from 'signale';

import { PrismaConnection } from '@/infrastructure/database/prismaClient';

export async function gracefulShutdown(signal: any, HttpServer: any, appListen: any) {
  if (signal) signale.info(`Gracefully closing http server. Received signal ${signal}`);

  try {
    await PrismaConnection.getInstance().disconnect();
    signale.info('Database connection closed successfully');
    //         await RedisServer.getInstance().stop();
    //         signale.info('Redis stopped successfully');
    //         await elasticSearch.stop();
    //         signale.info('ElasticSearch stopped successfully');

    HttpServer.close(function (err: any) {
      if (err) {
        signale.error('There was an error', err.message);
        process.exit(1);
      } else {
        signale.info('http server closed successfully');
      }
    });
    if (appListen.closeAllConnections) appListen.closeAllConnections();

    setTimeout(() => {
      signale.success('Server closed successfully');
      process.exit(0);
    }, 500);
  } catch (err: any) {
    signale.error('There was an error', err.message);
    setTimeout(() => process.exit(1), 500);
  }
}
