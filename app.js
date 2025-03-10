const express = require("express");
const path = require("path");
const logger = require("morgan");
const cookieParser = require("cookie-parser");
require("dotenv").config();
const flash = require("connect-flash");
const expressSession = require("express-session");

// Database Connection
const connectDB = require("./config/mongoose-connection");
connectDB();

const indexRouter = require("./routes/index");
const hisaabRouter = require("./routes/hisaab");

const app = express();

// View Engine Setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

// Middleware
app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

// Session Configuration
app.use(
  expressSession({
    secret: process.env.EXPRESS_SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
      maxAge: 60 * 60 * 1000, // 1 hour
      secure: process.env.NODE_ENV === "production", // Secure only in production
      httpOnly: true,
    },
  })
);

app.use(flash());

// Routes
app.use("/", indexRouter);
app.use("/hisaab", hisaabRouter);

// 404 Error Handler
app.use((req, res) => {
  res.status(404).render("error", { message: "Page Not Found" });
});

// Global Error Handler
app.use((err, req, res) => {
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  res.status(err.status || 500);
  res.render("error");
});

// Start Server
const PORT = process.env.PORT || 4300;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));

module.exports = app;
