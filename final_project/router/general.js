const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();
const axios = require('axios');

// Register a new user
public_users.post("/register", (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ message: "Please provide username and password" });
    }

    if (isValid(username)) {
        return res.status(409).json({ message: "User already exists" });
    }

    users.push({ username, password });
    return res.status(201).json({ message: "User registered successfully" });
});

// Function to get dynamic base URL
const getBaseURL = (req) => `${req.protocol}://${req.get('host')}`;

// Get list of all books using async/await with axios
public_users.get('/', async (req, res) => {
    try {
        return res.status(200).json(books);

    } catch (error) {
        console.error(error.message);
        return res.status(500).json({ message: "Error fetching books" });
    }
});

// Async/Axios endpoint for getting book by ISBN
public_users.get('/isbn/:isbn', async (req, res) => {
    const { isbn } = req.params;
    const baseURL = getBaseURL(req);

    try {
        // Using Axios to call internal endpoint (simulating async fetch)
        const response = await axios.get(`${baseURL}/internal/books`);
        const allBooks = response.data;

        const book = allBooks[isbn];

        if (!book) {
            return res.status(404).json({
                message: `There is no book with ISBN = ${isbn}`
            });
        }

        return res.status(200).json(book);
    } catch (error) {
        console.error(error.message);
        return res.status(500).json({ message: "Error fetching book details" });
    }
});

// Async/Axios endpoint: Get book details by author
public_users.get('/author/:author', async (req, res) => {
    const { author } = req.params;
    const baseURL = getBaseURL(req);

    try {
        // Fetch all books using Axios (simulating async API call)
        const response = await axios.get(`${baseURL}/internal/books`);
        const allBooks = response.data;

        // Filter books by author (case-insensitive)
        const filteredBooks = Object.values(allBooks).filter(
            b => b.author.toLowerCase() === author.toLowerCase()
        );

        if (filteredBooks.length === 0) {
            return res.status(404).json({
                message: `There are no books by author = ${author}`
            });
        }

        return res.status(200).json(filteredBooks);
    } catch (error) {
        console.error(error.message);
        return res.status(500).json({ message: "Error fetching books by author" });
    }
});

// Internal endpoint for Axios to fetch all books
public_users.get('/internal/books', (req, res) => {
    return res.json(books);
});

// // Get book details by ISBN
// public_users.get('/isbn/:isbn', (req, res) => {
//     const { isbn } = req.params;
//     const book = books[isbn];
//     if (!book) {
//         return res.status(404).json({ message: `There is no book with ISBN = ${isbn}` });
//     }
//     return res.status(200).json(book);
// });

// // Get books by author
// public_users.get('/author/:author', (req, res) => {
//     const { author } = req.params;
//     const filtered_books = Object.values(books).filter(b => b.author.toLowerCase() === author.toLowerCase());
//     if (filtered_books.length === 0) {
//         return res.status(404).json({ message: `There are no books by author = ${author}` });
//     }
//     return res.status(200).json(filtered_books);
// });

// Get books by title
public_users.get('/title/:title', (req, res) => {
    const { title } = req.params;
    const filtered_books = Object.values(books).filter(b => b.title.toLowerCase() === title.toLowerCase());
    if (filtered_books.length === 0) {
        return res.status(404).json({ message: `There are no books by title = ${title}` });
    }
    return res.status(200).json(filtered_books);
});

// Get book reviews
public_users.get('/review/:isbn', (req, res) => {
    const { isbn } = req.params;
    const book = books[isbn];
    if (!book) {
        return res.status(404).json({ message: `There is no book with ISBN = ${isbn}` });
    }
    return res.status(200).json(book.reviews || {});
});

module.exports.general = public_users;