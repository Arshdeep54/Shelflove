const jwt = require("jsonwebtoken");

function isLoggedIn(req, res, next) {
  const token = req.cookies.jwtToken;
  if (!token) {
    return next();
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.isLoggedIn = true;
    req.userId = decoded.id;
    req.user = {
      id: decoded.id,
      isAdmin: decoded.isAdmin,
    };
  } catch (error) {
    req.isLoggedIn = false;
  }
  next();
}
module.exports = isLoggedIn;
