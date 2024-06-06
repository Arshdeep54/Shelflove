const { render } = require("ejs");
const { Router } = require("express");
const db = require("../config/dbconfig");
const moment = require("moment");
const {
  isAuthenticated,
  issuedByuser,
  returnRequested,
  adminRequestSent,
  issuesByuser,
} = require("../utils/index");
const route = Router();
const isLoggedIn = require("../middlewares/isLoggedIn");
const isAdminMiddleware = require("../middlewares/isAdminMiddlware");

route.get("/", isLoggedIn, (req, res) => {
  const isLoggedIn = req.isLoggedIn;
  res.render("home", {
    isLoggedIn,
    user: req.user,
    url: req.protocol + "://" + req.headers.host,
  });
});

route.get("/books", isLoggedIn, async (req, res) => {
  const isLoggedIn = req.isLoggedIn;

  try {
    const query = `SELECT * FROM book WHERE quantity > 0;`;
    await db.query(query, (error, result) => {
      res.render("bookspage", {
        isLoggedIn,
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

route.get("/books/:id", isLoggedIn, async (req, res) => {
  const { id } = req.params;
  const isLoggedIn = req.isLoggedIn;
  try {
    const query = `SELECT * FROM book WHERE id = ? `;
    const values = [parseInt(id)];
    
    let isIssued;

    if (req.userId) {
      isIssued = await issuedByuser(parseInt(id), req.userId);
    } else {
      isIssued = false;
    }
    await db.query(query, values, async (error, result) => {
      if (!result) {
        return res
          .status(404)
          .render("error", { message: "Book not found" + error });
      }
     
      const book = result[0];
      res.render("bookdetail", {
        isLoggedIn,
        userId: req.userId,
        user: req.user,
        book: book,
        issuedByuser: isIssued,
        returnRequest: false,
      });
    });
  } catch (error) {
    res
      .status(500)
      .render("error", { message: "Error retrieving book details" + error });
  }
});
route.get("/user/profile/", isLoggedIn, async (req, res) => {
  const id = req.userId;
  const isLoggedIn = req.isLoggedIn;
  try {
    const adminRequest = await adminRequestSent(id);

    const query = `
        SELECT u.username, u.email, i.id AS issueId, i.bookid,i.issue_date, i.return_date, b.name, b.author,i.isReturned
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
        isLoggedIn,
        moment,
        user: req.user,
        adminRequest: adminRequest,
      });
    });
  } catch (error) {
    res
      .status(500)
      .render("error", { message: "Error retrieving user profile" });
  }
});

route.get(
  "/admin/profile/",
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
        SELECT i.id AS issueId, u.username, b.name AS bookTitle,b.author, i.issue_date, i.return_date, i.returnRequested
        FROM issue i
        INNER JOIN user u ON u.id = i.user_id
        INNER JOIN book b ON b.id = i.bookid
        WHERE returnRequested = 1
      `;

      await db.query(query, (error, results) => {
        res.render("adminDashboard", {
          isLoggedIn,
          moment,
          user: req.user,
          requestedReturns: results,
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
route.get("/login", isLoggedIn, (req, res) => {
  const isLoggedIn = req.isLoggedIn;
  res.render("login", {
    isLoggedIn,
    user: req.user,
    errorMessage: null,
  });
});
route.get("/signup", isLoggedIn, (req, res) => {
  const isLoggedIn = req.isLoggedIn;
  res.render("signup", {
    isLoggedIn,
    user: req.user,
    errorMessage: null,
  });
});

module.exports = route;
