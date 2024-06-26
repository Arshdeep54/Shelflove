const db = require("../../config/dbconfig");
const router = require("express").Router();
const bcrypt = require("bcrypt");

const jwt = require("jsonwebtoken");
router.post("/signup", async (req, res) => {
  const { username, email, password, password2 } = req.body;

  if (!username || !email || !password || !password2) {
    return res.status(400).render("signup", {
      isLoggedIn: false,
      errorMessage: "Missing required fields",
    });
  }

  try {
    const salt = await bcrypt.genSalt(10);
    if (password != password2) {
      return res.status(400).render("signup", {
        isLoggedIn: false,

        errorMessage: "Passwords didn't match",
      });
    }

    const hashedPassword = await bcrypt.hash(password, salt);
    const query = `INSERT INTO user (username, email, password) VALUES (?, ?, ?)`;
    const values = [username, email, hashedPassword];

    await db.query(query, values, async (error, result) => {
      if (error) {
        return res.render("signup", {
          isLoggedIn: false,
          errorMessage: "Username or Email already exist",
        });
      }

      const userID = result.insertID;
      await db.query(
        `UPDATE user SET isAdmin=true WHERE id=1`,
        (err, values) => {
          if (err || !values) {
            return res.render("error", {
              message: "Error making the first user admin ",
            });
          }
        }
      );

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
      res.redirect("/login");
    });
  } catch (error) {
    res.status(500).render("error", { message: "Error creating user" });
  }
});
router.post("/login", async (req, res) => {
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
      if (!result.length > 0) {
        return res.status(400).render("login", {
          isLoggedIn: false,
          errorMessage: "Invalid username or password",
        });
      }
      const user = result[0];
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.status(400).render("login", {
          isLoggedIn: false,
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
    res.status(500).render("error", { message: "Error logging in" });
  }
});
router.get("/logout", (req, res) => {
  res.clearCookie("jwtToken"); // Clear cookie (optional)
  res.status(200).json({ message: "Successfully logged out" });
});

module.exports = router;
