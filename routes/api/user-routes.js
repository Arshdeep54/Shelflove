const db = require("../../config/dbconfig");
const moment = require("moment");
const router = require("express").Router();

const { isBookAvailable } = require("../../utils/index");
const isLoggedIn = require("../../middlewares/isLoggedIn");

router.post("/issue/", async (req, res) => {
  const { user_id, bookid } = req.body;

  if (!user_id || !bookid) {
    return res.status(400).json({ message: "Missing required fields" });
  }

  try {
    const isAvailable = await isBookAvailable(bookid);

    if (!isAvailable) {
      return res.status(400).json({ message: "Book is not available" });
    }

    const existingIssue = await db.query(
      `SELECT * FROM issue WHERE user_id = ? AND isReturned = FALSE`,
      [user_id]
    );

    if (existingIssue.length > 0) {
      return res.status(400).json({ message: "User has an outstanding loan" });
    }

    const today = moment().format("YYYY-MM-DD");
    const returnDate = moment(today).add(14, "days").format("YYYY-MM-DD");

    const query = `
        INSERT INTO issue (user_id, bookid, issue_date, return_date)
        VALUES (?, ?, ?, ?)
      `;
    const values = [user_id, bookid, today, returnDate];

    db.query(query, values, (error, result) => {
      if (error) {
        console.error(error);
        return res.status(500).json({ message: "Error issuing book" });
      }

      res.status(201).json({ message: "Book issued successfully", returnDate });
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error issuing book" });
  }
});

router.post("/return/", async (req, res) => {
  const { user_id, bookid } = req.body;

  if (!user_id || !bookid) {
    return res.status(400).json({ message: "Missing required fields" });
  }

  try {
    const query = `
        UPDATE issue
        SET returnRequested = true
        WHERE user_id = ? AND bookid = ?
      `;
    const values = [user_id, bookid];

    const result = await db.query(query, values);

    if (result.affectedRows === 0) {
      return res
        .status(404)
        .json({ message: "Book not found or already returned" });
    }

    res.status(302).redirect("/user/profile");
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error returning book" });
  }
});

router.get("/books/", async (req, res) => {
  const userId = req.user?.id;
  if (!userId) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  try {
    const query = `
      SELECT i.bookid, b.name, b.author, i.return_date, b.description, b.quantity, b.publication_date, b.rating, b.address
      FROM issue i
      INNER JOIN books b ON i.bookid = b.id
      WHERE i.user_id = ?
    `;
    const values = [userId];
    const [rows] = await db.query(query, values);
    res.status(200).json({ books: rows });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error retrieving issued books" });
  }
});
router.post("/adminrequest/", isLoggedIn, async (req, res) => {
  const userId = req.userId;
  const query = `UPDATE user SET adminRequest = TRUE WHERE id=?`;
  const values = [userId];
  await db.query(query, values, (err, result) => {
    if (result.affectedRows === 0) {
      return res
        .status(404)
        .json({ message: "Failed to send Request or Already sent" });
    }
    res.status(302).redirect("/user/profile");
  });
});
router.get("/fav", async (req, res) => {});

module.exports = router;
