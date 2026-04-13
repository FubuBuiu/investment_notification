export const databaseConfig = {
    databaseUrl: process.env.DATABASE_URL || 'localhost',
    port: parseInt(process.env.DATABASE_PORT || '5432'),
    user: process.env.DATABASE_USER || 'postgres',
    password: process.env.DATABASE_PASSWORD || '',
    database: process.env.DATABASE_DB || 'investment_notification',
};