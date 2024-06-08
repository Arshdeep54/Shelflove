const db = require("../config/dbconfig");
async function isBookIssued(req, res, next) {
  const params = req.params;
  try {
    const query = `
    SELECT Count(bookid)
    FROM issue
    WHERE bookid = ? and isReturned=false and issueRequested=false
  `;
    const values = [params.bookId];
    await db.query(query, values, (error, issues) => {
      if (error) {
        throw error;
      }
      if (issues[0]["Count(bookid)"] > 0) {
        return res.render("error", {
          message: "Book is Issued by some users, can't delete",
        });
      }
      next();
    });
  } catch (error) {
    res.render("error", { message: error });
    return;
  }
}
module.exports = isBookIssued;
