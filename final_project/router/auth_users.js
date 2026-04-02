const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

// Check if username exists
const isValid = (username) => {
    return users.some(user => user.username === username);
}

// Authenticate user credentials
const authenticatedUser = (username, password) => {
    const user = users.find(user => user.username === username);
    return user && user.password === password;
}

// Login for registered users
regd_users.post("/login", (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ message: "Missing credentials" });
    }

    if (authenticatedUser(username, password)) {
        const token = jwt.sign({ username }, "access");

        req.session.authorization = { accessToken: token };

        return res.status(200).json({ message: "Login successful" });
    }

    return res.status(401).json({ message: "Invalid credentials" });
});

// Add or update book review
regd_users.put("/auth/review/:isbn", (req, res) => {
    const { isbn } = req.params;
    const { review } = req.query;
    const username = req.user.username;

    if (!review) {
        return res.status(400).json({ message: "Review is required" });
    }

    const book = books[isbn];
    if (!book) {
        return res.status(404).json({ message: "Book not found" });
    }

    if (!book.reviews) book.reviews = {};
    book.reviews[username] = review;

    return res.status(200).json({
        message: "Review added/updated successfully",
        reviews: book.reviews
    });
});

// Delete current user's review
regd_users.delete("/auth/review/:isbn", (req, res) => {
    const { isbn } = req.params;
    const username = req.user.username;

    const book = books[isbn];
    if (!book) {
        return res.status(404).json({ message: "Book not found" });
    }

    if (!book.reviews || !book.reviews[username]) {
        return res.status(404).json({ message: "No review found for this user" });
    }

    delete book.reviews[username];

    return res.status(200).json({
        message: "Review deleted successfully",
        reviews: book.reviews
    });
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;