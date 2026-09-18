const mongoose = require("mongoose");
const { MongoMemoryServer } = require("mongodb-memory-server");

let mongoServer = null;

const connectDB = async () => {
  try {
    const useInMemory = process.env.USE_IN_MEMORY_DB === "true";
    const mongoUri = process.env.MONGO_URI;

    let uri;

    if (useInMemory || !mongoUri) {
      // Use in-memory MongoDB for development
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
    process.exit(1);
  }
};

const disconnectDB = async () => {
  await mongoose.disconnect();
  if (mongoServer) {
    await mongoServer.stop();
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