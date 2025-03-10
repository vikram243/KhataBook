const mongoose = require("mongoose");
const debug = require("debug")("development:mongoose");
require("dotenv").config();

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URL, {
    });
    debug("Connected to MongoDB");
  } catch (error) {
    console.error("MongoDB connection error:", error);
    process.exit(1); // Exit the process in case of a failure
  }
};

module.exports = connectDB;