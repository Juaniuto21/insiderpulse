import dotenv from 'dotenv';

dotenv.config();

interface Config {
  port: number;
  nodeEnv: string;
  geminiApiKey: string;
  corsOrigins: string[];
  rateLimitWindowMs: number;
  rateLimitMax: number;
  cacheDefaultTtl: number;
  logLevel: string;
  apiVersion: string;
  jwtSecret: string;
  bcryptRounds: number;
  sessionSecret: string;
  hstsMaxAge: number;
  cspReportUri?: string;
  sentryDsn?: string;
  databaseUrl?: string;
  redisUrl?: string;
  encryptionKey: string;
  maxRequestSize: string;
  trustedProxies: string[];
}

const requiredEnvVars = ['GEMINI_API_KEY'];

// Add conditional required vars for production
if (process.env.NODE_ENV === 'production') {
  requiredEnvVars.push('JWT_SECRET', 'SESSION_SECRET', 'ENCRYPTION_KEY');
}

// Validate required environment variables
for (const envVar of requiredEnvVars) {
  if (!process.env[envVar]) {
    console.warn(`Missing environment variable: ${envVar}`);
  }
}

// Validate JWT secret length in production
if (process.env.NODE_ENV === 'production' && process.env.JWT_SECRET && process.env.JWT_SECRET.length < 32) {
  throw new Error('JWT_SECRET must be at least 32 characters long in production');
}

// Validate encryption key length
if (process.env.ENCRYPTION_KEY && process.env.ENCRYPTION_KEY.length < 32) {
  console.warn('ENCRYPTION_KEY should be at least 32 characters long');
}

export const config: Config = {
  port: parseInt(process.env.PORT || '3001', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  geminiApiKey: process.env.GEMINI_API_KEY || '',
  corsOrigins: process.env.CORS_ORIGINS?.split(',') || ['http://localhost:5173', 'http://localhost:3000'],
  rateLimitWindowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000', 10), // 15 minutes
  rateLimitMax: parseInt(process.env.RATE_LIMIT_MAX || '100', 10), // 100 requests per window
  cacheDefaultTtl: parseInt(process.env.CACHE_DEFAULT_TTL || '300', 10), // 5 minutes
  logLevel: process.env.LOG_LEVEL || 'info',
  apiVersion: 'v1',
  jwtSecret: process.env.JWT_SECRET || 'dev-secret-key-change-in-production',
  bcryptRounds: parseInt(process.env.BCRYPT_ROUNDS || '12', 10),
  sessionSecret: process.env.SESSION_SECRET || 'dev-session-secret-change-in-production',
  hstsMaxAge: parseInt(process.env.HSTS_MAX_AGE || '31536000', 10),
  cspReportUri: process.env.CSP_REPORT_URI,
  sentryDsn: process.env.SENTRY_DSN,
  databaseUrl: process.env.DATABASE_URL,
  redisUrl: process.env.REDIS_URL,
  encryptionKey: process.env.ENCRYPTION_KEY || 'dev-encryption-key-change-in-production-32chars',
  maxRequestSize: process.env.MAX_REQUEST_SIZE || '10mb',
  trustedProxies: process.env.TRUSTED_PROXIES?.split(',') || ['127.0.0.1', '::1']
};

export const isProduction = config.nodeEnv === 'production';
export const isDevelopment = config.nodeEnv === 'development';