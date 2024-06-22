const express = require("express");
const router = express.Router();
const usersModel = require("../models/users-model");
const bcrypt = require("bcrypt");
const jwt = require('jsonwebtoken');
const { isLoggedIn, redirectIfLogin} = require("../middlewares/login-middleware");

router.get("/", redirectIfLogin, function (req, res) {
  res.render("index", { loggedin: false });
});

router.get("/register", redirectIfLogin, function (req, res) {
  res.render("register", { loggedin: false });
});

router.get("/profile", isLoggedIn, async function (req, res) {
  let byDate = Number(req.query.byDate);
  let { startDate, endDate } = req.query;

  byDate = byDate ? byDate : -1;
  startDate = startDate ? startDate : new Date("2000-01-01");
  endDate = endDate ? endDate : new Date();

  let user = await usersModel.findOne({ email: req.user.email }).populate({
    path: "hisaab",
    match: { createdAt: { $gte: startDate, $lte: endDate } },
    options: { sort: { createdAt: byDate } },
  });

  res.render("profile", { user });
});

router.post("/createAccount", redirectIfLogin, async function (req, res) {
  let {username, password, email} = req.body;

  try {
    let user = await usersModel.findOne({email});
    if(user) return res.send("Sorry, you already have an account, please login.");

    bcrypt.genSalt(15, function (err, salt) {
      bcrypt.hash(password, salt, async function (err, hash) {
        let newUser = await usersModel.create({
          username,
          password:  hash,
          email
        });
        let token = jwt.sign({email, userid: newUser._id}, process.env.JWT_SECRET);
        res.cookie("token", token);
        res.redirect('/profile');
      });
    });
  } catch (error) {
    res.send(error.message);
  }
});

router.post("/login", async function (req, res) {
  let {password, email} = req.body;

  try {
    let user = await usersModel.findOne({email}).select("+password");
    if(!user) return res.status(500).send("Email or password is incorrect");

    bcrypt.compare(password, user.password, function (err, result) {
      if(result) {
        let token = jwt.sign({email, userid: user._id}, process.env.JWT_SECRET);
        res.cookie("token", token);
        res.redirect('/profile');
      } else {
        res.status(500).send("Email or password is incorrect");
      }
    });
  } catch (error) {
    res.send(error.message);
  }
});

router.get("/logout", isLoggedIn, function (req, res) {
  res.cookie("token", "");
  res.redirect("/");
});

module.exports = router;