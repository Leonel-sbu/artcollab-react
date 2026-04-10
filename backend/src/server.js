const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "..", ".env") });

// Validate environment before starting
require("./utils/env");

const app = require("./app");
const connectDB = require("./config/db");
const { startScheduler } = require("./utils/scheduler");

const PORT = process.env.PORT || 5000;
const isProduction = process.env.NODE_ENV === 'production';

let server;

async function startServer() {
  try {
    await connectDB();
    startScheduler();

    server = app.listen(PORT, () => {
      if (isProduction) {
        console.log(`✓ Server running in production mode on port ${PORT}`);
        console.log(`✓ API available at: https://api.${process.env.CLIENT_URL?.replace(/^https?:\/\//, '')}`);
        console.log(`✓ Uploads served at: https://api.${process.env.CLIENT_URL?.replace(/^https?:\/\//, '')}/uploads/<filename>`);
      } else {
        console.log(`Server running on port ${PORT}`);
        console.log(`Uploads served at: http://localhost:${PORT}/uploads/<filename>`);
      }
    });

    // Graceful shutdown handling
    const shutdown = async (signal) => {
      console.log(`\n${signal} received. Starting graceful shutdown...`);

      if (server) {
        server.close(async () => {
          console.log('HTTP server closed');

          // Close database connection
          const mongoose = require('mongoose');
          if (mongoose.connection.readyState === 1) {
            await mongoose.connection.close();
            console.log('Database connection closed');
          }

          console.log('Graceful shutdown complete');
          process.exit(0);
        });
      }

      // Force exit after 10 seconds if graceful shutdown fails
      setTimeout(() => {
        console.error('Forced shutdown after timeout');
        process.exit(1);
      }, 10000);
    };

    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('SIGINT', () => shutdown('SIGINT'));

  } catch (err) {
    console.error("Server failed to start:", err);
    process.exit(1);
  }
}

startServer();
