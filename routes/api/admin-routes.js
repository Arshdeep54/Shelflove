const db = require("../../dbconfig");

const router = require("express").Router();

router.post("/addbook", async (req, res) => {
  const { title, author, description, quantity, publication_date, rating } =
    req.body;

  if (
    !title ||
    !author ||
    !description ||
    !quantity ||
    !publication_date ||
    !rating
  ) {
    return res.status(400).json({ message: "Missing required fields" });
  }

  try {
    const query = `
        INSERT INTO book ( name, author, description, quantity ,publication_date,rating)
        VALUES (?, ?, ?, ?,?,?)
      `;
    const values = [
      title,
      author,
      description,
      quantity,
      publication_date,
      rating,
    ];

    db.query(query, values, (error, result) => {
      if (error) {
        console.error(error);
        return res.status(500).json({ message: "Error adding book" });
      }

      res.status(201).json({ message: "Book added successfully" });
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error adding book" });
  }
});
router.post("/updatebook/:id", async (req, res) => {
  const { id } = req.params;
  const { title, author, description, quantity, publication_date, rating } =
    req.body;

  if (
    !id ||
    (!title &&
      !author &&
      !description &&
      !quantity &&
      !publication_date &&
      !rating)
  ) {
    return res
      .status(400)
      .json({ message: "Missing required fields (book ID or update data)" });
  }

  try {
    const query = `
        UPDATE books
        SET title = COALESCE(?, title),
            author = COALESCE(?, author),
            description = COALESCE(?, description),
            quantity = COALESCE(?, quantity),
            publication_date = COALESCE(?, publication_date),
            rating = COALESCE(?, rating)
        WHERE id = ?
      `;

    const values = [
      title,
      author,
      description,
      quantity,
      publication_date,
      rating,
      id,
    ];

    const result = await db.query(query, values);

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Book not found" });
    }

    res.status(200).json({ message: "Book updated successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error updating book" });
  }
});

router.get("/bookissues/", async (req, res) => {
  try {
    const query = `
      SELECT i.id, b.name, b.author, u.username, i.issue_date, i.return_date
      FROM issue i
      INNER JOIN book b ON i.bookid = b.id
      INNER JOIN user u ON i.user_id = u.id
    `;
    await db.query(query, (err, result) => {
      res.status(200).json({ bookIssues: result });
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error retrieving book issues" });
  }
});
router.post("/approve/", async (req, res) => {
  const { issueIds } = req.body;
  console.log(issueIds);
  if (!issueIds || !Array.isArray(issueIds) || issueIds.length === 0) {
    console.log("No returns found for approval");

    return res.status(400).json({ message: "Invalid request body" });
  }

  const query = `
    UPDATE issue
    SET returnRequested = FALSE, isReturned = TRUE
    WHERE id IN (?)
  `;

  const placeholders = issueIds.map(() => "'?'");
  const joinedPlaceholders = placeholders.join(",");
  try {
    const result = await db.query(query, [issueIds]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "No returns found for approval" });
    }

    res.status(200).json({ message: "Selected returns approved successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error approving returns" });
  }
});
router.post("/remind/:userid", (req, res) => {});

module.exports = router;
