import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Add error handling middleware
app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
    }
  });

  next();
});

let server: any = null;

async function shutdownServer() {
  if (server) {
    return new Promise((resolve) => {
      server.close(() => {
        log('Server shutdown complete');
        resolve(true);
      });
    });
  }
  return Promise.resolve(true);
}

process.on('SIGTERM', async () => {
  log('SIGTERM received. Shutting down gracefully...');
  await shutdownServer();
  process.exit(0);
});

process.on('SIGINT', async () => {
  log('SIGINT received. Shutting down gracefully...');
  await shutdownServer();
  process.exit(0);
});

(async () => {
  try {
    log("Initializing server...");

    // First ensure any existing server is properly shutdown
    await shutdownServer();

    server = await registerRoutes(app);

    // Global error handler
    app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
      console.error('Server Error:', err);
      const status = err.status || err.statusCode || 500;
      const message = err.message || "Internal Server Error";
      res.status(status).json({ message });
    });

    const isDevelopment = app.get("env") === "development";

    try {
      if (isDevelopment) {
        log("Setting up Vite for development...");
        await setupVite(app, server);
        log("Vite setup completed successfully");
      } else {
        log("Setting up static file serving for production...");
        serveStatic(app);
        log("Static file serving setup completed");
      }
    } catch (setupError) {
      console.error('Setup error:', setupError);
      throw setupError;
    }

    // Bind to port 5000 consistently
    const PORT = 5000;

    server.listen(PORT, () => {
      log(`Server running on port ${PORT}`);
    }).on('error', (error: any) => {
      if (error.code === 'EADDRINUSE') {
        console.error(`Port ${PORT} is already in use. Please ensure no other process is using this port.`);
      } else {
        console.error('Server startup error:', error);
      }
      process.exit(1);
    });

  } catch (error) {
    console.error('Application startup error:', error);
    process.exit(1);
  }
})();