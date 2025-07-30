import winston from 'winston';
import { config } from './environment.js';

const logFormat = winston.format.combine(
  winston.format.timestamp(),
  winston.format.errors({ stack: true }),
  winston.format.json()
);

const developmentFormat = winston.format.combine(
  winston.format.colorize(),
  winston.format.simple()
);

export const logger = winston.createLogger({
  level: config.logLevel,
  format: config.nodeEnv === 'production' ? logFormat : developmentFormat,
  defaultMeta: { service: 'insiderpulse-api' },
  transports: [
    new winston.transports.Console(),
    ...(config.nodeEnv === 'production' 
      ? [
          new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
          new winston.transports.File({ filename: 'logs/combined.log' })
        ] 
      : []
    )
  ]
});

// Handle uncaught exceptions and unhandled rejections
if (config.nodeEnv === 'production') {
  logger.exceptions.handle(
    new winston.transports.File({ filename: 'logs/exceptions.log' })
  );
  
  logger.rejections.handle(
    new winston.transports.File({ filename: 'logs/rejections.log' })
  );
}