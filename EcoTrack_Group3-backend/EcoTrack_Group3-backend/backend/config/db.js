const mongoose = require("mongoose");

let mongoServer = null;

const connectDB = async () => {
  if (mongoose.connection.readyState === 1) {
    return;
  }

  try {
    const useInMemory = process.env.USE_IN_MEMORY_DB === "true";
    const mongoUri = process.env.MONGO_URI?.trim();
    const isProduction = process.env.NODE_ENV === "production";

    if (isProduction && !mongoUri) {
      throw new Error("MONGO_URI is required when NODE_ENV=production");
    }

    let uri;

    if (useInMemory || !mongoUri) {
      // Load the test-only package only when the in-memory fallback is used.
      const { MongoMemoryServer } = require("mongodb-memory-server");
      mongoServer = await MongoMemoryServer.create();
      uri = mongoServer.getUri();
      console.log("📦 Using in-memory MongoDB");
    } else {
      uri = mongoUri;
    }

    await mongoose.connect(uri);

    console.log("✅ MongoDB connected successfully");
    console.log(`   Database: ${mongoose.connection.name}`);
    console.log(`   Host: ${mongoose.connection.host}`);
    console.log(`   Mode: ${useInMemory ? "In-Memory" : "Persistent"}`);
  } catch (error) {
    console.error("❌ MongoDB connection failed:", error.message);
    throw error;
  }
};

const disconnectDB = async () => {
  await mongoose.disconnect();
  if (mongoServer) {
    await mongoServer.stop();
    mongoServer = null;
    console.log("📦 In-memory MongoDB stopped");
  }
};

// Handle connection events
mongoose.connection.on("disconnected", () => {
  console.log("⚠️  MongoDB disconnected");
});

mongoose.connection.on("error", (err) => {
  console.error("❌ MongoDB error:", err.message);
});

module.exports = { connectDB, disconnectDB };