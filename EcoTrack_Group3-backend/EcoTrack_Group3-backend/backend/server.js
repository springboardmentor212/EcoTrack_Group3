const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const { connectDB, disconnectDB } = require("./config/db");

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(helmet());
app.use(express.json());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
});
app.use(limiter);

// Health and test routes
app.get("/", (req, res) => {
  res.json({
    message: "EcoTrack Backend is running",
    version: "1.0.0",
  });
});

app.get("/api/health", async (req, res) => {
  res.json({
    success: true,
    database:
      mongooseConnectionState() === 1 ? "connected" : "disconnected",
  });
});

function mongooseConnectionState() {
  const mongoose = require("mongoose");
  return mongoose.connection.readyState;
}

// API Routes
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/activities", require("./routes/activityRoutes"));
app.use("/api/carbon-records", require("./routes/carbonRoutes"));
app.use("/api/goals", require("./routes/goalRoutes"));
app.use("/api/challenges", require("./routes/challengeRoutes"));
app.use("/api/dashboard", require("./routes/dashboardRoutes"));

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`,
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: "Something went wrong!",
    error: process.env.NODE_ENV === "development" ? err.message : undefined,
  });
});

let server = null;

const shutdown = async () => {
  await disconnectDB();
  if (server) {
    await new Promise((resolve) => server.close(resolve));
    server = null;
  }
};

const startServer = async () => {
  await connectDB();

  const configuredPort = Number(process.env.PORT);
  const port = Number.isFinite(configuredPort) && configuredPort >= 0
    ? configuredPort
    : 5000;
  server = app.listen(port, () => {
    console.log(`🌱 EcoTrack backend running on port ${port}`);
    console.log(`   Environment: ${process.env.NODE_ENV || "development"}`);
    console.log(`   API URL: http://localhost:${port}/api`);
  });

  return { app, server, shutdown };
};

if (require.main === module) {
  startServer().catch((error) => {
    console.error("Failed to start EcoTrack backend:", error);
    process.exit(1);
  });

  const handleShutdown = async () => {
    console.log("\n Shutting down gracefully...");
    await shutdown();
    process.exit(0);
  };

  process.once("SIGINT", handleShutdown);
  process.once("SIGTERM", handleShutdown);
}

module.exports = { app, startServer, shutdown };