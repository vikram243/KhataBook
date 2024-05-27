const mongoose = require("mongoose");

const userSchema = mongoose.Schema({
  username: {
    type: String,
    trim: true,
    minLength: 3,
    maxLength: 30,
    required: true,
  },
  name: {
    type: String,
    trim: true,
  },
  profilepicture: {
    type: String,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    trim: true,
  },
  password: {
    type: String,
    required: true,
    // select: false
  },
  hisaab: {
    type: Array,
  },
});

const User = mongoose.model("users-model", userSchema);

module.exports = User;
