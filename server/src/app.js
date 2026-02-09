const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const useragent = require('express-useragent');
const requestIp = require('request-ip');

const env = require('./config/env');
const { apiLimiter } = require('./middleware/rateLimiter');
const errorHandler = require('./middleware/errorHandler');
const authRoutes = require('./routes/auth.routes');
const sessionRoutes = require('./routes/session.routes');
const activityRoutes = require('./routes/activity.routes');

const app = express();

// Security middleware
app.use(helmet());
app.use(cors({
  origin: (origin, callback) => {
    const allowedOrigins = [
      'http://localhost:3000',
      env.CLIENT_URL?.replace(/\/$/, ''), // Remove trailing slash if present
      'https://authetication-system.vercel.app'
    ].filter(Boolean);

    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);

    if (allowedOrigins.includes(origin) || origin.endsWith('.vercel.app')) {
      callback(null, true);
    } else {
      console.log('Blocked by CORS:', origin);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-client-real-ip'],
}));

// Request parsing
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));
app.use(cookieParser());

// Device & IP detection
app.use(useragent.express());
// Configure request-ip to trust proxy headers
app.use(requestIp.mw({
  attributeName: 'clientIp',
}));

// Trust proxy (important for getting real IP behind reverse proxy/load balancer)
// Set to 1 to trust only the first proxy (more secure than 'true')
// In production behind a load balancer, set this to the number of proxies
app.set('trust proxy', env.TRUST_PROXY ? 1 : false);

// Logging
if (env.isDevelopment()) {
  app.use(morgan('dev'));
  // Additional request logging in development
  app.use((req, res, next) => {
    if (req.path.startsWith('/api')) {
      const logData = {
        method: req.method,
        path: req.path,
        origin: req.headers.origin,
        'x-client-real-ip': req.headers['x-client-real-ip'],
        ip: req.clientIp || req.ip,
      };
      if (req.method !== 'GET' && req.body) {
        // Log body keys but not sensitive data
        logData.bodyKeys = Object.keys(req.body);
        if (req.body.email) logData.email = req.body.email;
      }
      console.log(`[Request] ${req.method} ${req.path}`, logData);
    }
    next();
  });
} else {
  app.use(morgan('combined'));
}

// Rate limiting
app.use('/api', apiLimiter);

// Health check
app.get('/api/health', (_req, res) => {
  res.status(200).json({
    success: true,
    message: 'Auth System API is running',
    environment: env.NODE_ENV,
    timestamp: new Date().toISOString(),
  });
});

// Swagger Documentation
const { setupSwagger } = require('./config/swagger');
setupSwagger(app);

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/sessions', sessionRoutes);
app.use('/api/activity', activityRoutes);

// 404 handler
app.use((_req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
  });
});

// Global error handler
app.use(errorHandler);

module.exports = app;
