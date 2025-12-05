function log(message, source = "express") {
  // Logging disabled for production
}

function loggerMiddleware(req, res, next) {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse = undefined;

  const originalResJson = res.json.bind(res);
  res.json = function (bodyJson) {
    capturedJsonResponse = bodyJson;
    return originalResJson(bodyJson);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        try {
          logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
        } catch {
          // ignore serialization issues
        }
      }

      log(logLine);
    }
  });

  next();
}

module.exports = { log, loggerMiddleware };

