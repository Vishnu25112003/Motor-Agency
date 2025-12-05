const express = require("express");
const cors = require("cors");
const { loggerMiddleware } = require("./middleware/logger.middleware");
const { registerRoutes } = require("./routes");
const { errorMiddleware } = require("./middleware/error.middleware");

function createApp() {
  const app = express();
  
  // CORS middleware
  app.use(cors({
    origin: function (origin, callback) {
      // Allow requests with no origin (like mobile apps or curl requests)
      if (!origin) return callback(null, true);
      
      const allowedOrigins = ['http://localhost:5173', 'http://localhost:3000', 'http://localhost:5174'];
      if (allowedOrigins.indexOf(origin) !== -1) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    preflightContinue: false,
    optionsSuccessStatus: 200
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

