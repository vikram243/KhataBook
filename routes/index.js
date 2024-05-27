const express = require("express");
const router = express.Router();
const usersModel = require("../models/users-model");
const bcrypt = require("bcrypt");
const cookieParser = require('cookie-parser');
const jwt = require('jsonwebtoken');

router.get("/", function (req, res) {
  res.render("index");
});

function isLoggedIn(req, res, next) {
  if(req.cookies.token) {
    let token = req.cookies.token;
    jwt.verify(token, process.env.JWT_SECRET, function (err, decoded) {
      if(err) {
        res.send(err.message);
      } else {
        req.user = decoded;
        next();
      }
    });
  } else {
    res.redirect("/");
  }
};

router.get("/register", function (req, res) {
  res.render("register");
});

router.get("/profile", isLoggedIn, function (req, res) {
  res.send("This is a profile");
});

router.post("/createAccount", async function (req, res) {
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
        res.redirect('/Profile');
      });
    });
  } catch (error) {
    res.send(error.message);
  }
});

router.post("/login", async function (req, res) {
  let {username, password, email} = req.body;

  try {
    let user = await usersModel.findOne({email});
    if(!user) return res.status(500).send("Email or password is incorrect");

    bcrypt.compare(password, user.password, function (err, result) {
      if(result) {
        let token = jwt.sign({email, userid: user._id}, process.env.JWT_SECRET);
        res.cookie("token", token);
        res.redirect('/Profile');
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