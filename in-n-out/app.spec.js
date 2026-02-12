const request = require('supertest');
const app = require('../src/app');

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