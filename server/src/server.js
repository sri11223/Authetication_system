const app = require('./app');
const connectDB = require('./config/db');
const env = require('./config/env');

const startServer = async () => {
  await connectDB();

  const server = app.listen(env.PORT, () => {
    console.log(`\n[Server] Running in ${env.NODE_ENV} mode on port ${env.PORT}`);
    console.log(`[Server] API: http://localhost:${env.PORT}/api`);
    console.log(`[Server] Health: http://localhost:${env.PORT}/api/health\n`);
  });

  // Graceful shutdown
  const gracefulShutdown = (signal) => {
    console.log(`\n[Server] ${signal} received. Shutting down gracefully...`);
    server.close(() => {
      console.log('[Server] HTTP server closed');
      process.exit(0);
    });

    // Force shutdown after 10 seconds
    setTimeout(() => {
      console.error('[Server] Forced shutdown after timeout');
      process.exit(1);
    }, 10000);
  };

  process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
  process.on('SIGINT', () => gracefulShutdown('SIGINT'));

  process.on('unhandledRejection', (err) => {
    console.error('[Server] Unhandled rejection:', err);
    gracefulShutdown('UNHANDLED_REJECTION');
  });
};

startServer();
