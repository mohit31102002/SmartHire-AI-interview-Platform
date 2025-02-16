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

let activeServer: any = null;

// Enhanced shutdown function with proper cleanup
async function shutdownServer() {
  if (activeServer) {
    return new Promise<void>((resolve) => {
      activeServer.close(() => {
        log('Server shutdown complete');
        activeServer = null;
        resolve();
      });
    });
  }
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

// Improved server start function with better error handling
const startServer = (port: number, host: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    if (activeServer) {
      activeServer.close();
      activeServer = null;
    }

    const newServer = activeServer ? activeServer : express();
    newServer.listen(port, host, () => {
      activeServer = newServer;
      log(`Server running on ${host}:${port}`);
      resolve();
    }).on('error', (error: any) => {
      if (error.code === 'EADDRINUSE') {
        reject(new Error(`Port ${port} is already in use`));
      } else {
        reject(error);
      }
    }).setMaxListeners(20);
  });
};

// Try different ports if the default one is in use
async function tryStartServer(initialPort: number, host: string, maxRetries: number = 10) {
  for (let port = initialPort; port < initialPort + maxRetries; port++) {
    try {
      await startServer(port, host);
      return port;
    } catch (error: any) {
      if (error.message.includes('already in use') && port < initialPort + maxRetries - 1) {
        log(`Port ${port} is in use, trying port ${port + 1}...`);
        continue;
      }
      throw error;
    }
  }
  throw new Error(`Could not find an available port after ${maxRetries} attempts`);
}

(async () => {
  try {
    log("Initializing server...");

    // First ensure any existing server is properly shutdown
    await shutdownServer();

    // Create HTTP server after registering routes
    activeServer = await registerRoutes(app);

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
        await setupVite(app, activeServer);
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

    const HOST = '0.0.0.0';
    const initialPort = Number(process.env.PORT || 5000);

    const actualPort = await tryStartServer(initialPort, HOST);
    log(`Server successfully started on port ${actualPort}`);

  } catch (error) {
    console.error('Application startup error:', error);
    process.exit(1);
  }
})();