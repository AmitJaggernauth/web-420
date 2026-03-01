/**
 * Author: Amit Jaggernauth
 * Date: 1/31/2026
 * File: app.js
 * Description: Express server for the In‑N‑Out‑Books project.
 */

const express = require('express');
const bcrypt = require("bcryptjs");
const users = require("../database/users");

const app = express();
app.use(express.json());

// Import mock database
const books = require('../database/books');
const collection = require('../database/collection');

// Landing Page Route
app.get('/', (req, res) => {
  res.send(`
    <html>
      <head>
        <title>In-N-Out-Books</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            background: #f5f5f5;
            margin: 0;
            padding: 0;
            text-align: center;
          }
          header {
            background: #4a148c;
            color: white;
            padding: 20px;
          }
          h1 {
            margin: 0;
          }
          .container {
            margin-top: 40px;
          }
          .btn {
            display: inline-block;
            padding: 12px 20px;
            background: #6a1b9a;
            color: white;
            text-decoration: none;
            border-radius: 6px;
            margin-top: 20px;
          }
          .btn:hover {
            background: #4a148c;
          }
        </style>
      </head>
      <body>
        <header>
          <h1>📚 In-N-Out-Books</h1>
          <p>Your personal book collection manager</p>
        </header>

        <div class="container">
          <h2>Welcome!</h2>
          <p>Track books you've read, want to read, or plan to share.</p>
          <a class="btn" href="#">Get Started</a>
        </div>
      </body>
    </html>
  `);
});

app.use(express.json());

// GET /api/books
app.get('/api/books', async (req, res) => {
  try {
    const result = await collection.find(books);
    res.status(200).json(result);
  } catch (err) {
    res.status(500).json({ error: 'Server error retrieving books' });
  }
});

// GET /api/books/:id
app.get('/api/books/:id', async (req, res) => {
  try {
    const id = Number(req.params.id);

    if (isNaN(id)) {
      return res.status(400).json({ error: 'ID must be a number' });
    }

    const book = await collection.findOne(books, id);

    if (!book) {
      return res.status(404).json({ error: 'Book not found' });
    }

    res.status(200).json(book);

  } catch (err) {
    res.status(500).json({ error: 'Server error retrieving book' });
  }
});

// 404 Middleware

app.use((req, res) => {
  res.status(404).send('<h1>404 - Page Not Found</h1>');
});

// 500 Middleware

app.use((err, req, res, next) => {
  console.error(err);

  res.status(500).json({
    message: 'Internal Server Error',
    error: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
});

app.use(express.json());

// POST /api/books
app.post('/api/books', (req, res) => {
  try {
    const { id, title } = req.body;

    if (!title) {
      return res.status(400).json({ message: "Book title is required" });
    }

    const newBook = { id, title };
    books.add(newBook);

    return res.status(201).json(newBook);

  } catch (error) {
    return res.status(500).json({ message: "Internal Server Error" });
  }
});

// DELETE /api/books/:id
app.delete('/api/books/:id', (req, res) => {
  try {
    const { id } = req.params;

    const deleted = books.delete(id);

    if (!deleted) {
      return res.status(404).json({ message: "Book not found" });
    }

    return res.status(204).send();

  } catch (error) {
    return res.status(500).json({ message: "Internal Server Error" });
  }
});

app.put("/api/books/:id", (req, res) => {
  try {
    const id = Number(req.params.id);

    if (isNaN(id)) {
      return res.status(400).json({ error: "ID must be a number" });
    }

    const { title } = req.body;

    if (!title) {
      return res.status(400).json({ error: "Title is required" });
    }

    const updated = collection.update(id, { title });

    if (!updated) {
      return res.status(404).json({ error: "Book not found" });
    }

    return res.status(204).send();

  } catch (err) {
    return res.status(500).json({ error: "Server error" });
  }
});

app.post("/api/login", async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Missing fields → 400
    if (!email || !password) {
      const err = new Error("Bad Request");
      err.status = 400;
      throw err;
    }

    // Find user
    const user = users.find(u => u.email === email);

    // If user not found OR password invalid → 401
    if (!user || !bcrypt.compareSync(password, user.password)) {
      const err = new Error("Unauthorized");
      err.status = 401;
      throw err;
    }

    // Success
    res.status(200).send("Authentication successful");

  } catch (err) {
    console.error("Error:", err.message);
    res.status(err.status || 500).send(err.message);
  }
});


// Export the app

module.exports = app;