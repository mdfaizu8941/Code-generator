const mongoose = require("mongoose");
const dns = require("dns");

const connectDB = async () => {
  try {
    // Force Node.js to use Google DNS for SRV resolution
    dns.setServers(['8.8.8.8', '8.8.4.4']);
    const conn = await mongoose.connect(process.env.MONGO_URI);

    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error("❌ MongoDB Connection Error:", error);
    process.exit(1);
  }
};

module.exports = connectDB;