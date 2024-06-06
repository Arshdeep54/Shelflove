const express = require("express");
const path = require("path");
const app = express();
const port = 3000;
const db = require("./config/dbconfig");
const routers = require("./routes");
const cookieParser = require("cookie-parser"); 
require("dotenv").config();

app.set("views", path.join(__dirname, "views"));
app.use(express.static(path.join(__dirname, "/static")));
app.set("view engine", "ejs");
app.use(express.json());
app.use(cookieParser());

app.use(
  express.urlencoded({
    extended: true,
  })
);
db.connect((err) => {
  if (err) {
    console.error("Error connecting to the database: " + err.stack);
    return;
  }
  console.log("Connected to the database as ID " + db.threadId);
});

app.use(routers);

// Start the server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
