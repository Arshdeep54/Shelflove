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
    return await db.query(query, values, (error, bookRows) => {
      console.log(bookRows);
      if (!bookRows) {
        console.log("bokkvd vdkv ");
        return false;
      }
      const book = bookRows[0];
      return book.quantity > 0;
    });
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
    return !!decoded.id;
  } catch (error) {
    return false;
  }
}

async function issuedByuser(bookId, userId) {
  try {
    const query = `
        SELECT id,isReturned
        FROM issue
        WHERE  bookid= ? and user_id = ? 
      `;
    const values = [bookId, userId];
    return await db.query(query, values, (error, issues) => {
      console.log(issues);
      if (!issues.length > 0) {
        console.log("no issue");
        return false;
      }
      const issue = issues[0];
      return !issue.isReturned;
    });
  } catch (error) {
    console.error(error);
    throw error;
  }
}

async function returnRequested(bookId, userId) {
  try {
    const query = `
          SELECT id,returnRequested
          FROM issue
          WHERE  bookid= ? and user_id = ? 
        `;
    const values = [bookId, userId];
    return await db.query(query, values, (error, issues) => {
      console.log(issues);
      if (!issues.length > 0) {
        console.log("no return");
        return false;
      }
      const issue = issues[0];
      return !issue.returnRequested;
    });
  } catch (error) {
    console.error(error);
    throw error;
  }
}
module.exports = {
  isBookAvailable,
  isAuthenticated,
  issuedByuser,
  returnRequested,
};
