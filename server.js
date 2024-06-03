const express = require('express');
const mysql = require('mysql');
const app = express();
const port = 3000;


const connection = mysql.createConnection ({
    host: 'localhost',
    user: 'username',
    password: 'password',
    database: 'dbname' 
});


connection.connect((err) => {
    if (err) {
        console.error('Error connecting to the database: ' + err.stack);
        return;
  }
    console.log('Connected to the database as ID ' + connection.threadId);
});

// Define the API routes
app.get('/', (req, res) => {
  res.send('Hello World!');
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
