const mongoose = require("mongoose");
const dbgr = require("debug")("development:mongoose");
require('dotenv').config();
mongoose
  .connect(`${process.env.MONGODB_URL}`)
  .then(function () {
    dbgr("connected to Mongo");
  })
  .catch(function (err) {
    dbgr(err);
  });

let db = mongoose.connection;

module.exports = db;

