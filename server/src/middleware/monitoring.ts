import { Request, Response, NextFunction } from 'express';
import { logger } from '@/config/logger.js';
import { cacheService } from '@/services/cacheService.js';

interface RequestMetrics {
  totalRequests: number;
  errorRequests: number;
  averageResponseTime: number;
  requestsByEndpoint: Record<string, number>;
  errorsByEndpoint: Record<string, number>;
  requestsByIP: Record<string, number>;
  lastReset: number;
}

class MonitoringService {
  private metrics: RequestMetrics = {
    totalRequests: 0,
    errorRequests: 0,
    averageResponseTime: 0,
    requestsByEndpoint: {},
    errorsByEndpoint: {},
    requestsByIP: {},
    lastReset: Date.now()
  };

  private responseTimes: number[] = [];
  private readonly MAX_RESPONSE_TIMES = 1000;

  recordRequest(req: Request, res: Response, responseTime: number) {
    this.metrics.totalRequests++;
    
    // Track response times
    this.responseTimes.push(responseTime);
    if (this.responseTimes.length > this.MAX_RESPONSE_TIMES) {
      this.responseTimes.shift();
    }
    
    // Calculate average response time
    this.metrics.averageResponseTime = 
      this.responseTimes.reduce((sum, time) => sum + time, 0) / this.responseTimes.length;
    
    // Track by endpoint
    const endpoint = `${req.method} ${req.route?.path || req.path}`;
    this.metrics.requestsByEndpoint[endpoint] = (this.metrics.requestsByEndpoint[endpoint] || 0) + 1;
    
    // Track by IP
    const ip = req.ip;
    this.metrics.requestsByIP[ip] = (this.metrics.requestsByIP[ip] || 0) + 1;
    
    // Track errors
    if (res.statusCode >= 400) {
      this.metrics.errorRequests++;
      this.metrics.errorsByEndpoint[endpoint] = (this.metrics.errorsByEndpoint[endpoint] || 0) + 1;
    }
  }

  getMetrics(): RequestMetrics & { uptime: number; memoryUsage: NodeJS.MemoryUsage } {
    return {
      ...this.metrics,
      uptime: process.uptime(),
      memoryUsage: process.memoryUsage()
    };
  }

  resetMetrics() {
    this.metrics = {
      totalRequests: 0,
      errorRequests: 0,
      averageResponseTime: 0,
      requestsByEndpoint: {},
      errorsByEndpoint: {},
      requestsByIP: {},
      lastReset: Date.now()
    };
    this.responseTimes = [];
  }

  // Detect suspicious activity
  detectAnomalies(req: Request): string[] {
    const anomalies: string[] = [];
    const ip = req.ip;
    const endpoint = `${req.method} ${req.route?.path || req.path}`;
    
    // High request rate from single IP
    const ipRequests = this.metrics.requestsByIP[ip] || 0;
    if (ipRequests > 100) {
      anomalies.push(`High request rate from IP: ${ip} (${ipRequests} requests)`);
    }
    
    // High error rate for endpoint
    const endpointRequests = this.metrics.requestsByEndpoint[endpoint] || 0;
    const endpointErrors = this.metrics.errorsByEndpoint[endpoint] || 0;
    const errorRate = endpointRequests > 0 ? endpointErrors / endpointRequests : 0;
    
    if (errorRate > 0.5 && endpointRequests > 10) {
      anomalies.push(`High error rate for ${endpoint}: ${(errorRate * 100).toFixed(1)}%`);
    }
    
    return anomalies;
  }
}

export const monitoringService = new MonitoringService();

// Request monitoring middleware
export const requestMonitoring = (req: Request, res: Response, next: NextFunction) => {
  const startTime = Date.now();
  
  // Override res.end to capture response time
  const originalEnd = res.end;
  res.end = function(chunk?: any, encoding?: any) {
    const responseTime = Date.now() - startTime;
    
    // Record metrics
    monitoringService.recordRequest(req, res, responseTime);
    
    // Check for anomalies
    const anomalies = monitoringService.detectAnomalies(req);
    if (anomalies.length > 0) {
      logger.warn('Anomalies detected', {
        ip: req.ip,
        path: req.path,
        anomalies,
        requestId: req.requestId
      });
    }
    
    // Log slow requests
    if (responseTime > 5000) {
      logger.warn('Slow request detected', {
        path: req.path,
        method: req.method,
        responseTime,
        ip: req.ip,
        userAgent: req.get('User-Agent'),
        requestId: req.requestId
      });
    }
    
    // Set performance headers
    res.setHeader('X-Response-Time', `${responseTime}ms`);
    res.setHeader('X-Request-ID', req.requestId || 'unknown');
    
    originalEnd.call(this, chunk, encoding);
  };
  
  next();
};

// Performance monitoring middleware
export const performanceMonitoring = (req: Request, res: Response, next: NextFunction) => {
  const startTime = process.hrtime.bigint();
  
  res.on('finish', () => {
    const endTime = process.hrtime.bigint();
    const duration = Number(endTime - startTime) / 1000000; // Convert to milliseconds
    
    // Log performance metrics
    logger.info('Request completed', {
      method: req.method,
      path: req.path,
      statusCode: res.statusCode,
      duration: `${duration.toFixed(2)}ms`,
      contentLength: res.get('content-length'),
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      requestId: req.requestId
    });
    
    // Store in cache for monitoring dashboard
    const metricsKey = `metrics:${new Date().toISOString().split('T')[0]}`;
    const dailyMetrics = cacheService.get(metricsKey) || [];
    dailyMetrics.push({
      timestamp: new Date().toISOString(),
      method: req.method,
      path: req.path,
      statusCode: res.statusCode,
      duration,
      ip: req.ip
    });
    
    // Keep only last 1000 entries per day
    if (dailyMetrics.length > 1000) {
      dailyMetrics.shift();
    }
    
    cacheService.set(metricsKey, dailyMetrics, 86400); // 24 hours
  });
  
  next();
};

// Security monitoring middleware
export const securityMonitoring = (req: Request, res: Response, next: NextFunction) => {
  const suspiciousPatterns = [
    { pattern: /(\.\.|\/etc\/|\/proc\/|\/sys\/|\/var\/)/, type: 'Path Traversal' },
    { pattern: /(union|select|insert|delete|drop|create|alter|exec|execute)/i, type: 'SQL Injection' },
    { pattern: /(<script|javascript:|vbscript:|onload=|onerror=)/i, type: 'XSS Attempt' },
    { pattern: /(\${|<%|%>|{{|}})/i, type: 'Template Injection' },
    { pattern: /(wget|curl|nc|netcat|bash|sh|cmd|powershell)/i, type: 'Command Injection' }
  ];
  
  const requestData = JSON.stringify({
    query: req.query,
    body: req.body,
    params: req.params,
    headers: {
      'user-agent': req.get('User-Agent'),
      'referer': req.get('Referer'),
      'origin': req.get('Origin')
    }
  });
  
  const detectedThreats: string[] = [];
  
  for (const { pattern, type } of suspiciousPatterns) {
    if (pattern.test(requestData)) {
      detectedThreats.push(type);
    }
  }
  
  if (detectedThreats.length > 0) {
    logger.warn('Security threat detected', {
      threats: detectedThreats,
      ip: req.ip,
      path: req.path,
      method: req.method,
      userAgent: req.get('User-Agent'),
      requestId: req.requestId,
      requestData: requestData.substring(0, 500) // Limit logged data
    });
    
    // Could implement automatic blocking here
    // For now, just log and continue
  }
  
  next();
};