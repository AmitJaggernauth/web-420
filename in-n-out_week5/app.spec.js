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