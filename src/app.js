/**
 * Name: Amit Jaggernauth
 * Date: 1/18/2026
 * File: app.js
 * Description: In‑N‑Out‑Books
 */

const express = require("express");
const createError = require("http-errors");
const books = require("../src/books");
const Ajv = require("ajv");
const ajv = new Ajv();

const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Landing Page
app.get("/", (req, res) => {
  const html = `
  <html>
    <head>
      <title>In‑N‑Out‑Books</title>
      <style>
        body { background:#222; color:#fff; font-family:Arial; padding:2rem; }
        h1 { color:#ffcc00; }
        .container { width:60%; margin:auto; }
      </style>
    </head>
    <body>
      <div class="container">
        <h1>In‑N‑Out‑Books</h1>
        <p>Welcome to your personal book collection manager.</p>
      </div>
    </body>
  </html>`;
  res.send(html);
});

// 404 Handler
app.use((req, res, next) => {
  next(createError(404));
});

// 500 Handler
app.use((err, req, res, next) => {
  res.status(err.status || 500);
  res.json({
    type: "error",
    status: err.status,
    message: err.message,
    stack: req.app.get("env") === "development" ? err.stack : undefined
  });
});

// GET all books
app.get("/api/books", async (req, res, next) => {
  try {
    const allBooks = await books.find();
    res.send(allBooks);
  } catch (err) {
    next(err);
  }
});

// GET book by ID
app.get("/api/books/:id", async (req, res, next) => {
  try {
    let id = parseInt(req.params.id);
    if (isNaN(id)) return next(createError(400, "Input must be a number"));

    const book = await books.findOne({ id });
    res.send(book);
  } catch (err) {
    next(err);
  }
});

// POST create book
app.post("/api/books", async (req, res, next) => {
  try {
    const book = req.body;

    const expected = ["id", "title", "author"];
    const received = Object.keys(book);

    if (!received.every(k => expected.includes(k)) ||
        received.length !== expected.length) {
      return next(createError(400, "Bad Request"));
    }

    const result = await books.insertOne(book);
    res.status(201).send({ id: result.ops[0].id });

  } catch (err) {
    next(err);
  }
});

// DELETE book
app.delete("/api/books/:id", async (req, res, next) => {
  try {
    const id = parseInt(req.params.id);
    const result = await books.deleteOne({ id });
    res.status(204).send();
  } catch (err) {
    next(err);
  }
});

app.put("/api/books/:id", async (req, res, next) => {
  try {
    let { id } = req.params;
    id = parseInt(id);

    if (isNaN(id)) {
      return next(createError(400, "Input must be a number"));
    }

    const book = req.body;

    const expectedKeys = ["title", "author"];
    const receivedKeys = Object.keys(book);

    if (!receivedKeys.every(k => expectedKeys.includes(k)) ||
        receivedKeys.length !== expectedKeys.length) {
      return next(createError(400, "Bad Request"));
    }

    await books.updateOne({ id }, book);
    res.status(204).send();

  } catch (err) {
    if (err.message === "No matching item found") {
      return next(createError(404, "Book not found"));
    }
    next(err);
  }
});

app.post("/api/login", async (req, res, next) => {
  try {
    const user = req.body;

    const expectedKeys = ["email", "password"];
    const receivedKeys = Object.keys(user);

    if (!receivedKeys.every(k => expectedKeys.includes(k)) ||
        receivedKeys.length !== expectedKeys.length) {
      return next(createError(400, "Bad Request"));
    }

    let foundUser;
    try {
      foundUser = await users.findOne({ email: user.email });
    } catch {
      return next(createError(401, "Unauthorized"));
    }

    const valid = bcrypt.compareSync(user.password, foundUser.password);
    if (!valid) {
      return next(createError(401, "Unauthorized"));
    }

    res.status(200).send({ message: "Authentication successful" });

  } catch (err) {
    next(err);
  }
});

const securitySchema = {
  type: "array",
  items: {
    type: "object",
    properties: {
      answer: { type: "string" }
    },
    required: ["answer"],
    additionalProperties: false
  }
};

app.post("/api/users/:email/verify-security-question", async (req, res, next) => {
  try {
    const validate = ajv.compile(securitySchema);
    const valid = validate(req.body);

    if (!valid) {
      return next(createError(400, "Bad Request"));
    }

    const { email } = req.params;
    const user = await users.findOne({ email });

    const correctAnswers = user.securityQuestions.map(q => q.answer);
    const provided = req.body.map(q => q.answer);

    const matches = provided.every((ans, i) => ans === correctAnswers[i]);

    if (!matches) {
      return next(createError(401, "Unauthorized"));
    }

    res.status(200).send({ message: "Security questions successfully answered" });

  } catch (err) {
    next(err);
  }
});

module.exports = app;