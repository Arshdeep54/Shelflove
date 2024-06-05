const { isAuthenticated } = require("../utils/index");

function isAdminMiddleware(req, res, next) {
  if (!req.user.isAdmin) {
    return res
      .status(403)
      .json({ message: "Unauthorized: Access restricted to admins" });
  }
  next();
}

module.exports = isAdminMiddleware;
