const mongoose = require("mongoose");

const userSchema = mongoose.Schema({
  username: {
    type: String,
    trim: true,
    minLength: 3,
    maxLength: 30,
    required: true,
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
    select: false
  },
  hisaab: [{ type: mongoose.Schema.Types.ObjectId, 
    ref: "Hisaab" }]
});

const User = mongoose.model("users-model", userSchema);

module.exports = User;