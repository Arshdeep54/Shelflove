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
        isIssued = false;
        return;
      }
      const issue = issues[0];
      isIssued = !issue.isReturned;
      return;
    });
    return isIssued;
  } catch (error) {
    throw error;
  }
}

async function issuesByuser(bookId, userId) {
  try {
    const query = `
    SELECT id, isReturned
    FROM issue
    WHERE bookId = ? AND user_id = ?
  `;
    const values = [bookId, userId];

    return await db.query(query, values, (error, issues) => {
      if (error) throw error;
      if (!issues.length) {
        return { isIssued: false, isRequested: false };
      }
      const issue = issues[0];
      const isIssued = !issue.isReturned;
      const isRequested = issue.returnRequested == 0 ? false : true;

      return { isIssued, isRequested };
    });

    // const query = `
    //     SELECT id,isReturned
    //     FROM issue
    //     WHERE  bookid= ? and user_id = ?
    //   `;
    // const values = [bookId, userId];
    // let isIssued;
    // let isRequested;

    // return await db.query(query, values, (error, issues) => {
    //   if (!issues.length > 0) {
    //     isIssued = false;
    //     isRequested = false;
    //     return [isIssued,isRequested]
    //   }
    //   const issue = issues[0];
    //   isIssued = !issue.isReturned;
    //   isRequested = issue.returnRequested == 0 ? false : true;
    //   return [isIssued,isRequested]
    // });
  } catch (error) {
    throw error;
  }
}

async function adminRequestSent(userID) {
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
        isRequested = false;
        return false;
      }
      const user = users[0];
      isRequested = user.adminRequest == 1 ? true : false;
      return isRequested;
    });
  } catch (error) {
    throw error;
  }
}
module.exports = {
  isBookAvailable,
  isAuthenticated,
  issuesByuser,
  issuedByuser,
  adminRequestSent,
};
