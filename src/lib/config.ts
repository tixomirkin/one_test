/**
 * Application configuration constants
 */

export const APP_CONFIG = {
  cookie: {
    name: 'token',
    maxAge: 60 * 60 * 24 * 7, // 7 days in seconds
  },
  jwt: {
    expiresIn: '7d',
  },
  db: {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || '',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || '',
    port: parseInt(process.env.DB_PORT || '3306', 10),
  },
} as const;


