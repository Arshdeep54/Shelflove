const db = require("../config/dbconfig");
const jwt = require("jsonwebtoken");
async function isBookAvailable(bookId) {
  try {
    const query = `
        SELECT id, quantity
        FROM book
        WHERE id = ?
      `;
    const values = [bookId];
    return await db.query(query, values, (error, bookRows) => {
      if (!bookRows) {
        return false;
      }
      const book = bookRows[0];
      return book.quantity > 0;
    });
  } catch (error) {
    throw error;
  }
}

module.exports = {
  isBookAvailable,
};
