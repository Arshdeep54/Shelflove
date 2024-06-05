const db = require("../../dbconfig");
const router = require("express").Router();
const bcrypt = require("bcrypt");

const jwt = require("jsonwebtoken");
router.post("/signup", async (req, res) => {
  const { username, email, password } = req.body;

  if (!username || !email || !password) {
    return res.status(400).json({ message: "Missing required fields" });
  }

  try {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const query = `INSERT INTO user (username, email, password) VALUES (?, ?, ?)`;
    const values = [username, email, hashedPassword];

    db.query(query, values, (error, result) => {
      if (error) {
        console.error(error);
        return res.status(500).json({ message: "Error creating user" });
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
    console.error(error);
    res.status(500).json({ message: "Error creating user" });
  }
});
router.post("/login", async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: "Missing required fields" });
  }

  try {
    const query = `SELECT * FROM user WHERE username = ?`;
    const values = [username];

    db.query(query, values, async (error, result) => {
      if (!result) {
        return res
          .status(401)
          .json({ message: "Invalid username or password" });
      }
      const user = result[0];
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res
          .status(401)
          .json({ message: "Invalid username or password" });
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
    console.error(error);
    res.status(500).json({ message: "Error logging in" });
  }
});
module.exports = router;
