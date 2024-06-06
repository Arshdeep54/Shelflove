const db = require("../../config/dbconfig");
const router = require("express").Router();
const bcrypt = require("bcrypt");

const jwt = require("jsonwebtoken");
const isLoggedIn = require("../../middlewares/isLoggedIn");
router.post("/signup", isLoggedIn, async (req, res) => {
  const isLoggedIn = req.isLoggedIn;
  const { username, email, password, password2 } = req.body;

  if (!username || !email || !password || !password2) {
    return res.status(400).render("signup", {
      isLoggedIn,
      user: req.user,
      url: req.protocol + "://" + req.headers.host,
      errorMessage: "Missing required fields",
    });
  }

  try {
    const salt = await bcrypt.genSalt(10);
    if (password != password2) {
      return res.status(400).render("signup", {
        isLoggedIn,
        user: req.user,
        url: req.protocol + "://" + req.headers.host,
        errorMessage: "Passwords didn't match",
      });
    }
    const hashedPassword = await bcrypt.hash(password, salt);

    const query = `INSERT INTO user (username, email, password) VALUES (?, ?, ?)`;
    const values = [username, email, hashedPassword];

    db.query(query, values, (error, result) => {
      if (error) {
        return res.render("signup", {
          isLoggedIn,
          user: req.user,
          errorMessage: "Username already exist",
        });
      }

      const userID = result.insertID;
      const token = jwt.sign(
        { id: userID, isAdmin: false },
        process.env.JWT_SECRET,
        {
          expiresIn: 86400,
        }
      );
      res.cookie("jwtToken", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
      });
      res.redirect("/");
    });
  } catch (error) {
    res.status(500).render("error",{ message: "Error creating user" });
  }
});
router.post("/login", isLoggedIn, async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).render("login", {
      isLoggedIn: req.isLoggedIn,
      user: req.user,
      errorMessage: "Missing required fields",
    });
  }

  try {
    const query = `SELECT * FROM user WHERE username = ?`;
    const values = [username];

    db.query(query, values, async (error, result) => {
      if (!result.length>0) {
        return res.status(400).render("login", {
          isLoggedIn: req.isLoggedIn,
          errorMessage: "Invalid username or password",
        });
      }
      const user = result[0];
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.status(400).render("login", {
          isLoggedIn: req.isLoggedIn,
          user: req.user,
          errorMessage: "Invalid username or password",
        });
      }
      const token = jwt.sign(
        { id: user.id, isAdmin: user.isAdmin },
        process.env.JWT_SECRET,
        {
          expiresIn: 86400,
        }
      );
      res.cookie("jwtToken", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
      });
      res.redirect("/");
    });
  } catch (error) {
    res.status(500).render("error", {message: "Error logging in" });
  }
});
router.get("/logout", (req, res) => {
  res.clearCookie("jwtToken"); // Clear cookie (optional)
  res.status(200).json({ message: "Successfully logged out" });
});

module.exports = router;
