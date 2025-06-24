const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const dotenv = require("dotenv");
const User = require("./models/User"); // adjust if needed

dotenv.config();

const createAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    const existingAdmin = await User.findOne({ role: "admin" });
    if (existingAdmin) {
      console.log("⚠️ Admin already exists.");
      return process.exit();
    }

    const hashedPassword = await bcrypt.hash("admin123", 10); // change password if needed

    const newAdmin = new User({
      firstName: "othniel",
      lastName: "Moube",
      email: "othnielmoube45@gmail.com",
      passwordHash: hashedPassword,
      role: "admin",
    });

    await newAdmin.save();
    console.log("✅ Admin user created successfully!");
    process.exit();
  } catch (err) {
    console.error("❌ Error creating admin:", err);
    process.exit(1);
  }
};

createAdmin();
