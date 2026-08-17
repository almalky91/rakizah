// Database client configuration with MySQL connection pooling
import { drizzle } from 'drizzle-orm/mysql2';
import mysql from 'mysql2/promise';
import * as authSchema from './schema/auth';
import * as contentSchema from './schema/content';
import * as resultsSchema from './schema/results';
import * as trackingSchema from './schema/tracking';
import * as skillsSchema from './schema/skills';
import * as passwordResetSchema from './schema/password-reset';

// Create MySQL connection pool with configuration from environment variables
const poolConnection = mysql.createPool({
  host: process.env.DATABASE_HOST || 'localhost',
  user: process.env.DATABASE_USER || 'root',
  password: process.env.DATABASE_PASSWORD,
  database: process.env.DATABASE_NAME || 'rakizah',
  port: parseInt(process.env.DATABASE_PORT || '3306'),
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

// Create Drizzle client with all schemas
export const db = drizzle(poolConnection, {
  schema: {
    ...authSchema,
    ...contentSchema,
    ...resultsSchema,
    ...trackingSchema,
    ...skillsSchema,
    ...passwordResetSchema,
  },
  mode: 'default',
});

// Re-export all schema types for type inference
export * from './schema/auth';
export * from './schema/content';
export * from './schema/results';
export * from './schema/tracking';
export * from './schema/skills';
export * from './schema/password-reset';
