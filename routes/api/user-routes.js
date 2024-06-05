const db = require("../../dbconfig");

const router = require("express").Router();

const { isBookAvailable } = require("../../utils/index");

router.post("/issue/", async (req, res) => {
  console.log(req.body);
  const { user_id, bookid } = req.body;

  if (!user_id || !bookid) {
    return res.status(400).json({ message: "Missing required fields" });
  }

  try {
    const isAvailable = await isBookAvailable(bookid);

    if (!isAvailable) {
      return res.status(400).json({ message: "Book is not available" });
    }

    const today = new Date();
    const returnDate = new Date(today.setDate(today.getDate() + 14)); // Add 14 days

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
        SET isReturned = true
        WHERE user_id = ? AND bookid = ?
      `;
    const values = [user_id, bookid];

    const result = await db.query(query, values);

    if (result.affectedRows === 0) {
      return res
        .status(404)
        .json({ message: "Book not found or already returned" });
    }

    res.status(200).json({ message: "Book returned successfully" });
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

router.get("/fav", (req, res) => {});

module.exports = router;
