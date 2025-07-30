import express from 'express';
import cors from 'cors';
import compression from 'compression';
import morgan from 'morgan';
import session from 'express-session';
import { config, isProduction } from '@/config/environment.js';
import { logger } from '@/config/logger.js';
import { databaseService } from '@/config/database.js';
import { 
  rateLimiter, 
  speedLimiter, 
  helmetConfig, 
  sanitizeInput, 
  validateRequest,
  validateApiKey,
  addRequestId,
  generateCSRFToken
} from '@/middleware/security.js';
import { requestMonitoring, performanceMonitoring } from '@/middleware/monitoring.js';
import { errorHandler, notFoundHandler } from '@/middleware/errorHandler.js';
import routes from '@/routes/index.js';

const app = express();

// Trust proxy for accurate IP addresses behind reverse proxy
app.set('trust proxy', 1);

// Request ID middleware (must be first)
app.use(addRequestId);

// Session configuration
app.use(session({
  secret: config.sessionSecret,
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: isProduction,
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
    sameSite: 'strict'
  },
  name: 'insiderpulse.sid'
}));

// CSRF token generation
app.use(generateCSRFToken);

// Security middleware
app.use(helmetConfig);
app.use(rateLimiter);
app.use(speedLimiter);

// CORS configuration
app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (mobile apps, Postman, etc.)
    if (!origin) return callback(null, true);
    
    if (config.corsOrigins.includes(origin)) {
      return callback(null, true);
    }
    
    // In development, allow localhost with any port
    if (!isProduction && origin.match(/^https?:\/\/localhost:\d+$/)) {
      return callback(null, true);
    }
    
    callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-API-Key', 'X-Request-ID'],
  exposedHeaders: ['X-Request-ID']
}));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Compression middleware
app.use(compression());

// Logging middleware
if (isProduction) {
  app.use(morgan('combined', {
    stream: { write: (message) => logger.info(message.trim()) }
  }));
} else {
  app.use(morgan('dev'));
}

// Input sanitization and validation
app.use(sanitizeInput);
app.use(validateRequest);
app.use(validateApiKey);

// Monitoring middleware
app.use(requestMonitoring);
app.use(performanceMonitoring);

// API routes
app.use('/', routes);

// Error handling middleware (must be last)
app.use(notFoundHandler);
app.use(errorHandler);

// Graceful shutdown handling
const gracefulShutdown = (signal: string) => {
  logger.info(`Received ${signal}. Starting graceful shutdown...`);
  
  server.close((err) => {
    if (err) {
      logger.error('Error during server shutdown', { error: err });
      process.exit(1);
    }
    
    // Close database connection
    try {
      await databaseService.disconnect();
    } catch (error) {
      logger.error('Error closing database connection', { error });
    }
    
    logger.info('Server closed successfully');
    process.exit(0);
  });
  
  // Force shutdown after 30 seconds
  setTimeout(() => {
    logger.error('Forced shutdown after timeout');
    process.exit(1);
  }, 30000);
};

// Start server
const server = app.listen(config.port, async () => {
  // Initialize database connection
  try {
    await databaseService.connect();
  } catch (error) {
    logger.error('Failed to connect to database', { error });
    process.exit(1);
  }
  
  logger.info(`InsiderPulse API server running on port ${config.port}`, {
    environment: config.nodeEnv,
    version: config.apiVersion,
    port: config.port
  });
});

// Handle graceful shutdown
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// Handle uncaught exceptions and unhandled rejections
process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception', { error });
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection', { reason, promise });
  process.exit(1);
});

export default app;