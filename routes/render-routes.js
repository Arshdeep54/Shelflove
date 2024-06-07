const { render } = require("ejs");
const { Router } = require("express");
const db = require("../config/dbconfig");
const moment = require("moment");

const route = Router();
const isLoggedIn = require("../middlewares/isLoggedIn");
const isAdminMiddleware = require("../middlewares/isAdminMiddlware");
const existingIssue = require("../middlewares/existingIssue");
const isAdminRequestSent = require("../middlewares/isAdminRequestSent");

route.get("/", isLoggedIn, (req, res) => {
  const isLoggedIn = req.isLoggedIn;
  res.render("home", {
    isLoggedIn,
    userId: req.userId,
    isAdmin: req.isAdmin,
    user: req.user,
  });
});

route.get("/books", isLoggedIn, async (req, res) => {
  const isLoggedIn = req.isLoggedIn;

  try {
    const query = `SELECT * FROM book WHERE quantity > 0;`;
    await db.query(query, (error, result) => {
      res.render("bookspage", {
        isLoggedIn,
        userId: req.userId,
        isAdmin: req.isAdmin,
        user: req.user,
        books: result,
      });
    });
  } catch (error) {
    res
      .status(500)
      .render("error", { message: "Error retrieving books " + error });
  }
});

route.get("/books/:id", isLoggedIn, existingIssue, async (req, res) => {
  const { id } = req.params;
  const isLoggedIn = req.isLoggedIn;
  try {
    const query = `SELECT * FROM book WHERE id = ? `;
    const values = [parseInt(id)];

    await db.query(query, values, async (error, result) => {
      if (!result) {
        return res
          .status(404)
          .render("error", { message: "Book not found" + error });
      }

      const book = result[0];
      res.render("bookdetail", {
        moment,
        isLoggedIn,
        userId: req.userId,
        isAdmin: req.isAdmin,
        user: req.user,
        book: book,
        issueRequested: req.issueRequested,
        issuedByuser: req.isIssued,
        returnRequest: req.isRequested,
      });
    });
  } catch (error) {
    res
      .status(500)
      .render("error", { message: "Error retrieving book details" + error });
  }
});
route.get(
  "/user",
  isLoggedIn,
  isAdminRequestSent,
  async (req, res) => {
    const id = req.userId;
    const isLoggedIn = req.isLoggedIn;
    try {
      const query = `
        SELECT u.username, u.email, i.id AS issueId, i.bookid,i.issue_date, i.expected_return_date, b.title, b.author,i.isReturned,i.issueRequested,i.returnRequested
        FROM user u
        INNER JOIN issue i ON u.id = i.user_id
        INNER JOIN book b ON i.bookid = b.id
        WHERE u.id = ?
      `;
      const values = [id];

      await db.query(query, values, (err, userData) => {
        if (!userData) {
          return res.status(404).render("error", { message: "User not found" });
        }

        res.render("userDashboard", {
          userData,
          moment,
          isLoggedIn,
          userId: req.userId,
          isAdmin: req.isAdmin,
          user: req.user,
          adminRequest: req.adminRequest,
        });
      });
    } catch (error) {
      res
        .status(500)
        .render("error", { message: "Error retrieving user profile" });
    }
  }
);

route.get(
  "/admin",
  isLoggedIn,
  isAdminMiddleware,
  async (req, res) => {
    try {
      const userRequestsQuery = `
      SELECT u.id AS userId, u.username, u.email
      FROM user u
      WHERE adminRequest = TRUE
    `;
      let requestedAdmins;
      await db.query(
        userRequestsQuery,
        (userRequestsError, userRequestsResults) => {
          if (userRequestsError) {
            return res
              .status(500)
              .render("error", { message: "Error retrieving user requests" });
          }
          requestedAdmins = userRequestsResults;
        }
      );

      const query = `
        SELECT i.id AS issueId, u.username,b.id AS bookId, b.title AS bookTitle,b.author, i.issue_date, i.expected_return_date, i.returnRequested ,i.issueRequested
        FROM issue i
        INNER JOIN user u ON u.id = i.user_id
        INNER JOIN book b ON b.id = i.bookid
        WHERE returnRequested = 1 or issueRequested = 1
      `;

      await db.query(query, (error, results) => {
        
        if (error) {
          return res.render("error", { message: error });
        }
        const requestedReturns = results.filter(
          (result) => result.returnRequested === 1
        );
        const requestedIssues = results.filter(
          (result) => result.issueRequested === 1
        );
        res.render("adminDashboard", {
          moment,
          isLoggedIn: req.isLoggedIn,
          userId: req.userId,
          isAdmin: req.isAdmin,
          user: req.user,
          requestedReturns,
          requestedIssues,
          requestedAdmins,
        });
      });
    } catch (error) {
      res.status(500).render("error", {
        message: "Error retrieving requested returns" + error,
      });
    }
  }
);
route.get("/login", (req, res) => {
  res.render("login", {
    isLoggedIn: false,
    errorMessage: null,
  });
});
route.get("/signup", (req, res) => {
  const isLoggedIn = req.isLoggedIn;
  res.render("signup", {
    isLoggedIn: false,
    errorMessage: null,
  });
});

module.exports = route;
