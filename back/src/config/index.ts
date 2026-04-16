export const databaseConfig = {
  databaseUrl: process.env.DATABASE_URL || 'postgresql://localhost:5432/investment_notification',
  port: parseInt(process.env.POSTGRES_PORT || '1234'),
  user: process.env.POSTGRES_USER || 'user-default',
  password: process.env.POSTGRES_PASSWORD || 'password-default',
  database: process.env.POSTGRES_DB || 'database-default',
};

export const apiConfig = {
  port: process.env.PORT,
};
