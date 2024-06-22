const mongoose = require("mongoose");
const config = require("config");
const dbgr = require("debug")("development:mongoose");

mongoose
  .connect(`${config.get("MONGODB_URL")}/khaatabook`)
  .then(function () {
    dbgr("connected to Mongo");
  })
  .catch(function (err) {
    dbgr(err);
  });

let db = mongoose.connection;

module.exports = db;

