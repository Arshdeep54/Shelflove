const db = require("../config/dbconfig");

async function existingIssue(req, res, next) {
  const { id } = req.params;
  try {
    const query = `
    SELECT id, isReturned,returnRequested,issueRequested
    FROM issue
    WHERE bookId = ? AND user_id = ? and isReturned=false
  `;
    const values = [parseInt(id), req.user.id];
    await db.query(query, values, (error, issues) => {
      if (error) throw error;
      if (!issues.length) {
        req.isIssued = false;
        req.isRequested = false;
        next();
        return;
      }
      const issue = issues[0];
      req.issueRequested = issue.issueRequested == 0 ? false : true;
      req.isIssued = !issue.issueRequested;
      req.isRequested = issue.returnRequested == 0 ? false : true;
      next();
    });
  } catch (error) {
    res.render("error", { message: error });
    return;
  }
}
module.exports = existingIssue;
