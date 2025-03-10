const express = require("express");
const path = require("path");
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
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));
app.use(
  expressSession({
    secret: process.env.EXPRESS_SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
    cookie: {
      maxAge: 1000 * 60 * 60 * 24, // 1 day
      secure: false,
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

// Start Server
const PORT = process.env.PORT || 4300;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));

module.exports = app;
