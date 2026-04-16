import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import signale from 'signale';

import { databaseConfig } from '@/config';
import { PrismaClient } from '@/generated/prisma/client';

export interface Connection {
  readonly client: PrismaClient;
  connect(): Promise<PrismaClient>;
  disconnect(): Promise<void>;
}

export class PrismaConnection implements Connection {
  private static instance: PrismaConnection | null = null;

  private readonly pool: Pool;
  public readonly client: PrismaClient;
  private connected = false;

  private constructor() {
    const connectionString = databaseConfig.databaseUrl;
    if (!connectionString) {
      throw new Error('DATABASE_URL não definida');
    }
    this.pool = new Pool({
      connectionString,
      // Manter comportamento parecido com v6:
      connectionTimeoutMillis: 5_000,
      idleTimeoutMillis: 300_000,
    });
    const adapter = new PrismaPg(this.pool);
    this.client = new PrismaClient({ adapter });
  }

  public static getInstance(): PrismaConnection {
    if (!PrismaConnection.instance) {
      PrismaConnection.instance = new PrismaConnection();
    }
    return PrismaConnection.instance;
  }

  public async connect(): Promise<PrismaClient> {
    if (this.connected) {
      return this.client;
    }

    try {
      await this.client.$connect();

      // Validação real da conexão com o banco
      await this.client.$queryRaw`SELECT 1`;

      this.connected = true;
      signale.success('Successfully connected to database');

      return this.client;
    } catch (error) {
      this.connected = false;
      signale.error('Error connecting to database');
      signale.error(error);

      throw error;
    }
  }
  public async disconnect(): Promise<void> {
    try {
      await this.client.$disconnect();
    } finally {
      await this.pool.end();
      this.connected = false;
    }
  }
}
