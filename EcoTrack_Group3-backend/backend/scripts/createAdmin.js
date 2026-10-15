const mongoose = require("mongoose");
const Admin = require("../models/Admin");
require("dotenv").config();

const createAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    console.log("MongoDB connected");

    const name = process.argv[2];
    const email = process.argv[3];
    const password = process.argv[4];

    if (!name || !email || !password) {
      console.log(
        'Usage: node scripts/createAdmin.js "Admin Name" "admin@email.com" "password"'
      );
      process.exit(1);
    }

    const existingAdmin = await Admin.findOne({ email });

    if (existingAdmin) {
      console.log("Admin with this email already exists.");
      process.exit(0);
    }

    await Admin.create({
      name,
      email,
      password,
    });

    console.log(`Admin created successfully: ${email}`);

    await mongoose.disconnect();
  } catch (error) {
    console.error("Failed to create admin:", error.message);
    process.exit(1);
  }
};

createAdmin();