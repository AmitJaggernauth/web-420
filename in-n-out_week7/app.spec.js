const request = require('supertest');
const app = require('../src/app');
const books = require('../database/books')

describe('Chapter 3: API Tests', () => {

  test('Should return an array of books', async () => {
    const res = await request(app).get('/api/books');
    expect(res.statusCode).toBe(200);
    expect(res.body).toBeInstanceOf(Array);
    expect(res.body.length).toBeGreaterThan(0);
  });

  test('Should return a single book', async () => {
    const res = await request(app).get('/api/books/1');
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('id');
    expect(res.body.id).toEqual(1);
  });

  test('Should return a 400 error if the id is not a number', async () => {
    const res = await request(app).get('/api/books/abc');
    expect(res.statusCode).toBe(400);
    expect(res.body).toHaveProperty('error');
  });

});

describe("Chapter 4: API Tests", () => {

  beforeEach(() => {
    books.items = []; // reset mock DB before each test
  });

  test("Should return a 201-status code when adding a new book", async () => {
    const response = await request(app)
      .post('/api/books')
      .send({ id: "1", title: "Test Book" });

    expect(response.status).toBe(201);
  });

  test("Should return a 400-status code when adding a new book with missing title", async () => {
    const response = await request(app)
      .post('/api/books')
      .send({ id: "2" });

    expect(response.status).toBe(400);
    expect(response.body.message).toBe("Book title is required");
  });

  test("Should return a 204-status code when deleting a book", async () => {
    books.add({ id: "3", title: "Delete Me" });

    const response = await request(app)
      .delete('/api/books/3');

    expect(response.status).toBe(204);
  });

});

describe("Chapter 5: API Tests", () => {

  test("Should update a book and return a 204-status code", async () => {
    const response = await request(app)
      .put("/api/books/1")
      .send({ title: "Updated Title" });

    expect(response.status).toBe(204);
  });

  test("Should return a 400-status code when using a non-numeric id", async () => {
    const response = await request(app)
      .put("/api/books/abc")
      .send({ title: "New Title" });

    expect(response.status).toBe(400);
    expect(response.body.error).toBe("ID must be a number");
  });

  test("Should return a 400-status code when updating a book with a missing title", async () => {
    const response = await request(app)
      .put("/api/books/1")
      .send({});

    expect(response.status).toBe(400);
    expect(response.body.error).toBe("Title is required");
  });

});

describe("Chapter 6: API Tests", () => {

  it("should log a user in and return 200 with 'Authentication successful'", async () => {
    const res = await request(app)
      .post("/api/login")
      .send({ email: "test@example.com", password: "password123" });

    expect(res.status).toBe(200);
    expect(res.text).toBe("Authentication successful");
  });

  it("should return 401 with 'Unauthorized' when logging in with incorrect credentials", async () => {
    const res = await request(app)
      .post("/api/login")
      .send({ email: "test@example.com", password: "wrongpassword" });

    expect(res.status).toBe(401);
    expect(res.text).toBe("Unauthorized");
  });

  it("should return 400 with 'Bad Request' when missing email or password", async () => {
    const res = await request(app)
      .post("/api/login")
      .send({ email: "" });

    expect(res.status).toBe(400);
    expect(res.text).toBe("Bad Request");
  });

});
