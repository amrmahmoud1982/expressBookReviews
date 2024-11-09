const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = []; // Array to store registered users (replace with a database in production)

// Helper Functions
const isValid = (username) => {
  return !users.some(user => user.username === username);
};

const authenticatedUser = (username, password) => {
  return users.some(user => user.username === username && user.password === password);
};

// User Registration Route
regd_users.post("/register", (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: "Username and password are required." });
  }

  if (!isValid(username)) {
    return res.status(400).json({ message: "Username already taken." });
  }

  users.push({ username, password });
  return res.status(200).json({ message: "Registration successful!" });
});

// User Login Route
regd_users.post("/login", (req, res) => {
  const { username, password } = req.body;

  if (!authenticatedUser(username, password)) {
    return res.status(403).json({ message: "Invalid username or password." });
  }

  const token = jwt.sign({ username }, 'your_secret_key', { expiresIn: '1h' });
  return res.status(200).json({ message: "Login successful!", token });
});

// Add Book Review Route (only for authenticated users)
regd_users.put("/auth/review/:isbn", (req, res) => {
  const token = req.header('Authorization')?.split(' ')[1]; // Extract token from Authorization header

  if (!token) {
    return res.status(403).json({ message: "Access Denied, please log in." });
  }

  // Verify token
  jwt.verify(token, 'your_secret_key', (err, user) => {
    if (err) {
      return res.status(403).json({ message: "Invalid token." });
    }

    const { isbn } = req.params;
    const { review } = req.body;

    if (!review) {
      return res.status(400).json({ message: "Review cannot be empty." });
    }

    // Find the book by ISBN
    const book = books[isbn];  // Access directly by ISBN
    if (!book) {
      return res.status(404).json({ message: "Book not found." });
    }

    // Initialize reviews array if it doesn't exist
    book.reviews = book.reviews || [];

    // Check if user has already reviewed the book
    const existingReviewIndex = book.reviews.findIndex(r => r.username === user.username);

    if (existingReviewIndex >= 0) {
      // Update the existing review
      book.reviews[existingReviewIndex].review = review;
    } else {
      // Add a new review
      book.reviews.push({ username: user.username, review });
    }

    console.log("Updated reviews after adding/updating:", book.reviews); // Logging for debugging

    return res.status(200).json({ message: "Review added/updated successfully!", reviews: book.reviews });
  });
});


// Delete Book Review Route (only for authenticated users)
regd_users.delete("/auth/review/:isbn", (req, res) => {
  const token = req.header('Authorization')?.split(' ')[1]; // Extract token from Authorization header

  if (!token) {
    return res.status(403).json({ message: "Access Denied, please log in." });
  }

  // Verify token
  jwt.verify(token, 'your_secret_key', (err, user) => {
    if (err) {
      return res.status(403).json({ message: "Invalid token." });
    }

    const { isbn } = req.params;
    const book = books[isbn];

    if (!book) {
      return res.status(404).json({ message: "Book not found." });
    }

    // Check if the review exists for the authenticated user
    const reviewIndex = book.reviews.findIndex(r => r.username === user.username);

    if (reviewIndex === -1) {
      return res.status(404).json({ message: "Review not found." });
    }

    // Remove the review
    book.reviews.splice(reviewIndex, 1);

    console.log("Updated reviews after deletion:", book.reviews); // Logging for debugging

    return res.status(200).json({ message: "Review deleted successfully!", reviews: book.reviews });
  });
});





module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
