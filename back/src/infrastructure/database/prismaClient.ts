import { databaseConfig } from "@/config/database";
import { PrismaClient } from "@/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import signale from "signale";

export interface Connection {
    readonly client: PrismaClient;
    connect(): Promise<PrismaClient>;
    disconnect(): Promise<void>;
}

export class PrismaConnection implements Connection {
    private static instance: PrismaConnection | null = null;
    public readonly client: PrismaClient;

    private constructor() {
        const connectionString = databaseConfig.databaseUrl
        if (!connectionString) {
            throw new Error("DATABASE_URL não definida");
        }
        const pool = new Pool({
            connectionString,
            // Manter comportamento parecido com v6:
            connectionTimeoutMillis: 5_000,
            idleTimeoutMillis: 300_000,
        })
        const adapter = new PrismaPg(pool)
        this.client = new PrismaClient({ adapter });
    }

    public static getInstance(): PrismaConnection {
        if (!PrismaConnection.instance) {
            PrismaConnection.instance = new PrismaConnection();
        }
        return PrismaConnection.instance;
    }

    async connect(): Promise<PrismaClient> {
        await this.client
            .$connect()
            .then(() => {
                signale.success("Successfully connected to database");
            })
            .catch((error: any) => {
                signale.error("Error connecting to database");
                signale.error(error);
                process.exit(1);
            });
        return this.client;
    }
    async disconnect(): Promise<void> {
        await this.client.$disconnect();
    }
}
