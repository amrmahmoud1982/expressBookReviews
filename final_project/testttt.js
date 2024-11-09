const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();
const axios = require('axios');


// Get the book list available in the shop
public_users.get('/', (req, res) => {
  return res.status(200).json({ books: books }); // Return all books
});

// Get book details based on ISBN
public_users.get('/isbn/:isbn',function (req, res) {
  const isbn = req.params.isbn;  // Get the ISBN from the URL
  const book = books[isbn];  // Access the book using the ISBN (which is the key)

  if (book) {
    return res.status(200).json(book);  // If the book exists, send it in the response
  } else {
    return res.status(404).json({message: "Book not found"});  // If the book doesn't exist, return a 404
  }
});


// Get all books by Author
public_users.get('/author/:author',function (req, res) {
  const author = req.params.author.toLowerCase();  // Get the author from the URL and convert it to lowercase for case-insensitive comparison
  const booksByAuthor = Object.values(books)  // Convert the books object to an array of books
    .filter(book => book.author.toLowerCase().includes(author));  // Filter books by author

  if (booksByAuthor.length > 0) {
    return res.status(200).json(booksByAuthor);  // If books are found, return them in the response
  } else {
    return res.status(404).json({message: "No books found for this author"});  // If no books are found, return a 404
  }
});;

// Get all books by Title
public_users.get('/title/:title', function (req, res) {
  const title = req.params.title.toLowerCase();  // Get the title from the URL and convert it to lowercase for case-insensitive comparison
  const booksByTitle = Object.values(books)  // Convert the books object to an array of books
    .filter(book => book.title.toLowerCase().includes(title));  // Filter books by title

  if (booksByTitle.length > 0) {
    return res.status(200).json(booksByTitle);  // If books are found, return them in the response
  } else {
    return res.status(404).json({ message: "No books found with this title" });  // If no books are found, return a 404
  }
});


// Get book review based on ISBN
public_users.get('/review/:isbn', function (req, res) {
  const isbn = req.params.isbn;  // احصل على الـ ISBN من الـ URL
  const book = books[isbn];  // الوصول إلى الكتاب باستخدام الـ ISBN

  if (book) {
    res.status(200).json({ reviews: book.reviews });  // إذا كان الكتاب موجودًا، أعد المراجعات
  } else {
    res.status(404).json({ message: "Book not found" });  // إذا لم يكن الكتاب موجودًا، أعد رسالة خطأ
  }
});
public_users.post("/register", (req, res) => {
  const { username, password } = req.body;

  // Check if the username is valid (not already taken)
  if (users.some(user => user.username === username)) {
    return res.status(400).json({ message: "Username already exists." });
  }

  // Register the new user
  const newUser = { username, password }; // In a real app, hash the password
  users.push(newUser);

  return res.status(200).json({
    message: "User registered successfully",
    user: { username: newUser.username }
  });
});






module.exports.general = public_users;
