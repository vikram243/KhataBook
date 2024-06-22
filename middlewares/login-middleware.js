const jwt = require("jsonwebtoken");

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

  function redirectIfLogin(req, res, next) {
    if (req.cookies.token) {
      res.redirect("/profile");
    } else next();
  }
  
  module.exports.isLoggedIn = isLoggedIn;
  module.exports.redirectIfLogin = redirectIfLogin;  