const express = require("express");
const router = express.Router();
const usersModel = require("../models/users-model");
require("joi");
const userJoiSchema = require("../models/users-validation");
const bcrypt = require("bcrypt");
const jwt = require('jsonwebtoken');
const { isLoggedIn, redirectIfLogin } = require("../middlewares/middleware");

router.get("/", redirectIfLogin, (req, res) => {
  const errors = req.flash("error");
  return res.render("index", { loggedin: false, error: errors });
});

router.get("/register", redirectIfLogin, (req, res) => {
  const errors = req.flash("error"); 
  return res.render("register", { loggedin: false, error: errors });
});

router.get("/profile", isLoggedIn, async (req, res) => {
  try {
    const err = req.flash("error");
    const byDate = req.query.byDate ? Number(req.query.byDate) : -1;
    const startDate = req.query.startDate ? new Date(req.query.startDate) : new Date("2000-01-01");
    const endDate = req.query.endDate ? new Date(req.query.endDate) : new Date();

    // Ensure valid date range
    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
      req.flash("error", "Invalid date format.");
      return res.redirect("/profile");
    }

    // Fetch user with filtered Hisaab entries
    const user = await usersModel
      .findOne({ email: req.user.email })
      .populate({
        path: "hisaab",
        match: { createdAt: { $gte: startDate, $lte: endDate } },
        options: { sort: { createdAt: byDate } },
      });

    return res.render("profile", { user, error: err });
  } catch (error) {
    console.error("Error loading profile:", error.message);
    req.flash("error", "Something went wrong, please try again.");
    return res.redirect("/");
  }
});

router.post("/createAccount", redirectIfLogin, async (req, res) => {
  try {
    const { username, password, email } = req.body;

    // Validate input using Joi schema
    const { error } = userJoiSchema.validate(req.body);
    if (error) {
      req.flash("error", error.details[0].message);
      return res.redirect("/register");
    }

    // Check if the user already exists
    const existingUser = await usersModel.findOne({ email });
    if (existingUser) {
      req.flash("error", "Sorry, you already have an account. Please login.");
      return res.redirect("/register");
    }

    // Hash password using bcrypt
    const salt = await bcrypt.genSalt(15);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create new user
    const newUser = await usersModel.create({
      username,
      password: hashedPassword,
      email
    });

    // Generate JWT token
    const token = jwt.sign({ email, userid: newUser._id }, process.env.JWT_SECRET);
    
    // Set token in cookie and redirect to profile
    res.cookie("token", token);
    return res.redirect("/profile");

  } catch (err) {
    console.error("Error creating account:", err.message);
    req.flash("error", "Something went wrong, please try again.");
    return res.redirect("/register");
  }
});

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user and include password field
    const user = await usersModel.findOne({ email }).select("+password");
    if (!user) {
      req.flash("error", "Email or password is incorrect");
      return res.redirect("/");
    }

    // Compare password asynchronously
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      req.flash("error", "Email or password is incorrect");
      return res.redirect("/");
    }

    // Generate JWT token and set cookie
    const token = jwt.sign({ email, userid: user._id }, process.env.JWT_SECRET);
    res.cookie("token", token);

    return res.redirect("/profile");
  } catch (error) {
    console.error("Login error:", error.message);
    req.flash("error", "Something went wrong. Please try again.");
    return res.redirect("/");
  }
});

router.get("/logout", isLoggedIn, (req, res) => {
  res.clearCookie("token");
  req.flash("error", "You have been logged out.");
  return res.redirect("/");
});

module.exports = router;