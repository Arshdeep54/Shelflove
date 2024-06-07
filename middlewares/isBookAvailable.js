const db = require("../config/dbconfig");

async function isBookAvailable(req, res, next) {
  const bookid  = req.body;
  try {
    const query = `
        SELECT id, quantity
        FROM book
        WHERE id = ?
      `;
    const values = [parseInt(bookid.bookid)];
    await db.query(query, values, async (error, bookRows) => {
      if (!bookRows) {
         res.render("error", { message: "Something Went Wrong"+error });
      }
      const book = bookRows[0];
      if (book.quantity > 0) {
        next();
      } else {
        return res.render("error", { message: "Not Enough books" });
      }
    });
  } catch (error) {
    return res.render("error", { message: error });
  }
}

module.exports = isBookAvailable;
