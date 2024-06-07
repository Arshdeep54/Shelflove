CREATE TABLE user (
    id INT PRIMARY KEY AUTO_INCREMENT ,
    username VARCHAR(255) UNIQUE,
    email VARCHAR(255),
    password VARCHAR(255),
    isAdmin BOOLEAN DEFAULT FALSE,
    adminRequest BOOLEAN  DEFAULT FALSE,
)

CREATE TABLE book (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255),
    author VARCHAR(255),
    publication_date DATE,
    quantity INT,
    description VARCHAR(255),
    rating FLOAT,
    address VARCHAR(255)
);

CREATE TABLE issue( 
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL, 
    bookid INT NOT NULL,
    issue_date DATE,
    return_date DATE,
    isReturned BOOLEAN DEFAULT FALSE,
    returnRequested BOOLEAN DEFAULT FALSE,
    FOREIGN KEY (user_id) REFERENCES user(id), 
    FOREIGN KEY (bookid) REFERENCES book(id)
);

