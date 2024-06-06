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
    let isIssued;
    await db.query(query, values, (error, issues) => {
      if (!issues.length > 0) {
        console.log("no issue");
        isIssued = false;
        return;
      }
      const issue = issues[0];
      console.log(issue, "utdy");
      isIssued = !issue.isReturned;
      return;
    });
    return isIssued;
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
    let isRequested;
    await db.query(query, values, (error, returns) => {
      if (!returns.length > 0) {
        console.log("no return");
        isRequested = false;
        return;
      }
      const returnRow = returns[0];
      isRequested = !returnRow.returnRequested;
      return;
    });
    return isRequested;
  } catch (error) {
    console.error(error);
    throw error;
  }
}
async function adminRequestSent(userID) {
  console.log("id", userID);
  try {
    const query = `
          SELECT id,adminRequest
          FROM user
          WHERE id = ? 
        ;`;
    const values = [userID];
    let isRequested;
    return await db.query(query, values, (error, users) => {
      if (!users.length > 0) {
        console.log("no issue");
        isRequested = false;
        return false;
      }
      const user = users[0];
      console.log(user, user.adminRequest, "utdy");
      isRequested = user.adminRequest == 1 ? true : false;
      return isRequested;
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
  adminRequestSent,
};
