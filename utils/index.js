const db = require("../dbconfig");
const jwt = require("jsonwebtoken");
async function isBookAvailable(bookId) {
  try {
    const query = `
        SELECT id, quantity
        FROM book
        WHERE id = ?
      `;
    const values = [bookId];
    const [bookRows] = await db.query(query, values);

    if (!bookRows.length) {
      return false;
    }

    const book = bookRows[0];
    return book.quantity > 0; 
  } catch (error) {
    console.error(error);
    throw error;
  }
}
function isAuthenticated(req) {
  const token =
    req.headers.authorization && req.headers.authorization.split(" ")[1];
  if (!token) {
    return false;
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    return !!decoded.userId; 
  } catch (error) {
    return false;
  }
}
module.exports = { isBookAvailable, isAuthenticated };
