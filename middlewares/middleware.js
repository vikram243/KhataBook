const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");
const HisaabModel = require("../models/hisaab-model");

async function isLoggedIn(req, res, next) {
  try {
    const token = req.cookies.token;
    if (!token) return res.redirect("/");

    req.user = jwt.verify(token, process.env.JWT_SECRET);
    next();
  } catch (err) {
    res.status(401).send(err.message);
  }
}

function redirectIfLogin(req, res, next) {
  if (req.cookies.token) {
    return res.redirect("/profile");
  }
  next();
}

function validateObjectId(req, res, next) {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    req.flash("error", "Invalid Khata ID");
    return res.redirect("/profile");
  }

  next();
};

async function fetchHisaab(id, req, res) {
  try {
    const hisaab = await HisaabModel.findById(id);
    if (!hisaab) {
      req.flash("error", "Khata not found");
      return res.redirect("/profile");
    }
    return hisaab;
  } catch (error) {
    console.error("Error fetching Khata:", error.message);
    req.flash("error", "Something went wrong, please try again");
    res.redirect("/profile");
  }
}

module.exports = { fetchHisaab, validateObjectId, isLoggedIn, redirectIfLogin };