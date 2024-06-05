const { render } = require("ejs");
const { Router } = require("express");
const db = require("../dbconfig");
const moment = require("moment");
const {
  isAuthenticated,
  issuedByuser,
  returnRequested,
} = require("../utils/index");
const route = Router();
const isLoggedIn = require("../middlewares/isLoggedIn");
const isAdminMiddleware = require("../middlewares/isAdminMiddlware");

route.get("/", isLoggedIn, (req, res) => {
  const isLoggedIn = req.isLoggedIn;
  res.render("home", { isLoggedIn, user: req.user });
});

route.get("/books", isLoggedIn, async (req, res) => {
  const isLoggedIn = req.isLoggedIn;

  try {
    const query = `SELECT * FROM book;`;
    await db.query(query, (error, result) => {
      console.log(result);
      res.render("bookspage", {
        isLoggedIn,
        user: req.user,
        books: result,
      });
    });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .render("error", { message: "Error retrieving books " + error });
  }
});

route.get("/books/:id", isLoggedIn, async (req, res) => {
  const { id } = req.params;
  const isLoggedIn = req.isLoggedIn;
  try {
    const query = `SELECT * FROM book WHERE id = ?`;
    const values = [id];
    let issued;
    if (req.userId) {
      issued = await issuedByuser(id, req.userId);
    } else {
      issued = false;
    }
    let returnRequest;
    if (req.userId) {
      returnRequest = await returnRequested(id, req.userId);
    } else {
      returnRequest = false;
    }
    console.log(issued, "tcyvu");
    await db.query(query, values, (error, result) => {
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
        issuedByuser: issued,
        returnRequest,
      });
    });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .render("error", { message: "Error retrieving book details" });
  }
});
route.get("/user/profile/", isLoggedIn, async (req, res) => {
  const id = req.userId;
  const isLoggedIn = req.isLoggedIn;
  try {
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
      });
    });
  } catch (error) {
    console.error(error);
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
      const query = `
        SELECT i.id AS issueId, u.username, b.name AS bookTitle, i.issue_date, i.return_date, i.returnRequested
        FROM issue i
        INNER JOIN user u ON u.id = i.user_id
        INNER JOIN book b ON b.id = i.bookid
        WHERE returnRequested = 1
      `;

      await db.query(query, (error, results) => {
        res.render("adminDashboard", {
          isLoggedIn,moment,
          user: req.user,
          requestedReturns: results,
        });
      });
    } catch (error) {
      console.error(error);
      res
        .status(500)
        .render("error", { message: "Error retrieving requested returns" });
    }
  }
);
route.get("/login", (req, res) => {
  return res.render("login");
});
route.get("/signup", (req, res) => {
  return res.render("signup");
});

module.exports = route;
