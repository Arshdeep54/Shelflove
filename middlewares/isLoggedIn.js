const jwt = require("jsonwebtoken");

function isLoggedIn(req, res, next) {
  const token = req.cookies.jwtToken;
  if (!token) {
    return next();
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.isLoggedIn = true;
    req.user = decoded;
  } catch (error) {
    req.isLoggedIn = false;
  }
  next();
}
module.exports = isLoggedIn;
