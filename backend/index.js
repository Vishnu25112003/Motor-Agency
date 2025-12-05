require("dotenv").config();
const { createServer } = require("http");
const { createApp } = require("./app");
const { serveStatic } = require("./static");
const { connectMongo } = require("./config/mongo");
const { log } = require("./middleware/logger.middleware");

(async () => {
  await connectMongo();

  const app = createApp();
  const httpServer = createServer(app);

  // In production, serve the built client from the dist/public folder.
  // In development, the client runs separately via Vite on its own port.
  if (process.env.NODE_ENV === "production") {
    serveStatic(app);
  }

  // ALWAYS serve the app on the port specified in the environment variable PORT
  // Other ports are firewalled. Default to 5000 if not specified.
  // this serves both the API and the client.
  // It is the only port that is not firewalled.
  const port = parseInt(process.env.PORT || "5000", 10);
  httpServer.listen(port, "0.0.0.0", () => {
    log(`serving on port ${port}`);
  });
})();
