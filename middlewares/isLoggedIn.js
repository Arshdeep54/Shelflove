const jwt = require("jsonwebtoken");
const db = require("../config/dbconfig");

async function isLoggedIn(req, res, next) {
  const token = req.cookies.jwtToken;
  if (!token) {
    return next();
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.isLoggedIn = true;
    req.userId = decoded.id;
    req.isAdmin = decoded.isAdmin;
    const query = `SELECT username,email FROM user WHERE id= ?`;
    const values = [req.userId];
    await db.query(query, values, async (err, users) => {
      if (err) {
        throw err;
      }

      const user = await users[0];
      req.user = {
        id: decoded.id,
        isAdmin: decoded.isAdmin,
        name: user.username,
        email: user.email,
      };
      next();
    });
  } catch (error) {
    req.isLoggedIn = false;
    next();
  }
}
module.exports = isLoggedIn;
