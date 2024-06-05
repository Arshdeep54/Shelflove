const { render } = require("ejs");
const { Router } = require("express");
const db = require("../dbconfig");
const { isAuthenticated } = require("../utils/index");
const route = Router();
const isLoggedIn = require("../middlewares/isLoggedIn");

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

    await db.query(query, values, (error, result) => {
      if (!result) {
        return res
          .status(404)
          .render("error", { message: "Book not found" + error });
      }
      const book = result[0];
      console.log(result);
      res.render("bookdetail", { isLoggedIn, user: req.user, book: book });
    });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .render("error", { message: "Error retrieving book details" });
  }
});
route.get("/user/profile/:id", (req, res) => {
  return res.render("userprofile");
});

route.get("/login", (req, res) => {
  return res.render("login");
});
route.get("/signup", (req, res) => {
  return res.render("signup");
});

module.exports = route;
