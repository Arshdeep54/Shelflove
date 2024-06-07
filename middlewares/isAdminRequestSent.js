const db = require("../config/dbconfig");

async function isAdminRequestSent(req, res, next) {
  const userID = req.userId;
  try {
    const query = `
    SELECT id,adminRequest
    FROM user
    WHERE id = ? 
  ;`;
    const values = [userID];
    return await db.query(query, values, (error, users) => {
      if (!users.length > 0) {
        req.adminRequest = false;
        next();
        return;
      }
      const user = users[0];
      req.adminRequest = user.adminRequest == 1 ? true : false;
      next();
    });
  } catch (error) {
    res.render("error", { message: error });
  }
}
module.exports=isAdminRequestSent;