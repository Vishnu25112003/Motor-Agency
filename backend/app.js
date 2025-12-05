const express = require("express");
const cors = require("cors");
const { loggerMiddleware } = require("./middleware/logger.middleware");
const { registerRoutes } = require("./routes");
const { errorMiddleware } = require("./middleware/error.middleware");

function createApp() {
  const app = express();
  
  // CORS middleware - Allow all origins for production
  app.use(cors({
    origin: true, // Allow all origins
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept'],
    exposedHeaders: ['Content-Length', 'X-Requested-With'],
    preflightContinue: false,
    optionsSuccessStatus: 204
  }));
  
  // Body parsing
  app.use(
    express.json({
      verify: (req, _res, buf) => {
        // Preserve raw body if needed by integrations
        req.rawBody = buf;
      },
    }),
  );
  app.use(express.urlencoded({ extended: false }));

  // Request logging
  app.use(loggerMiddleware);

  // API routes
  registerRoutes(app);

  // Global error handler (must be after routes)
  app.use(errorMiddleware);

  return app;
}

module.exports = { createApp };

