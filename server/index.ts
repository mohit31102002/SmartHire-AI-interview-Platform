import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import { createServer } from "http";

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Add basic logging middleware
app.use((req, res, next) => {
  const start = Date.now();
  res.on("finish", () => {
    const duration = Date.now() - start;
    if (req.path.startsWith("/api")) {
      log(`${req.method} ${req.path} ${res.statusCode} in ${duration}ms`);
    }
  });
  next();
});

// Add test route to verify server is running
app.get('/test', (req, res) => {
  res.json({ status: 'Server is running' });
});

let server: ReturnType<typeof createServer> | null = null;

async function startServer() {
  const PORT = process.env.PORT ? parseInt(process.env.PORT) : 3000;
  const HOST = '0.0.0.0';

  try {
    log("Initializing server...");

    // Register API routes
    await registerRoutes(app);

    // Global error handler
    app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
      console.error('Server Error:', err);
      res.status(500).json({ error: err.message || "Internal Server Error" });
    });

    // Create HTTP server with increased timeout
    server = createServer(app);
    server.setTimeout(120000); // 2 minute timeout
    server.keepAliveTimeout = 65000; // slightly higher than 60 second nginx timeout
    server.headersTimeout = 66000; // slightly higher than keepAliveTimeout

    const isDevelopment = process.env.NODE_ENV !== "production";

    if (isDevelopment) {
      log("Setting up Vite for development...");
      await setupVite(app, server);
      log("Vite setup completed");
    } else {
      log("Setting up static file serving for production...");
      serveStatic(app);
      log("Static file serving setup completed");
    }

    // Start listening with error handling and auto-reconnect
    await new Promise<void>((resolve, reject) => {
      const startListening = () => {
        server!.listen(PORT, HOST)
          .once('listening', () => {
            log(`Server started successfully on ${HOST}:${PORT}`);
            resolve();
          })
          .once('error', (error: NodeJS.ErrnoException) => {
            if (error.code === 'EADDRINUSE') {
              log(`Port ${PORT} is in use, retrying in 5 seconds...`);
              setTimeout(startListening, 5000);
            } else {
              reject(error);
            }
          });
      };
      
      startListening();
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

// Start the server
startServer().catch((error) => {
  console.error('Server startup failed:', error);
  process.exit(1);
});