const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const dotenv = require("dotenv");
const Admin = require("./models/Admin");

dotenv.config();

mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log("✅ Connected to MongoDB"))
  .catch(err => console.error("❌ Connection error:", err));

async function createAdmin() {
  try {
    const existing = await Admin.findOne({ username: process.env.ADMIN_USERNAME });
    if (existing) {
      console.log("⚠ Admin already exists");
      return;
    }

    const hashedPassword = await bcrypt.hash(process.env.ADMIN_PASSWORD, 10);

    const admin = new Admin({
      username: process.env.ADMIN_USERNAME,
      password: hashedPassword
    });

    await admin.save();
    console.log("✅ Admin created successfully!");
  } catch (err) {
    console.error("❌ Error creating admin:", err);
  } finally {
    mongoose.connection.close();
  }
}

createAdmin();
