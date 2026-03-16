const app = require("../src/app");
const request = require("supertest");

describe("Chapter 3: API Tests", () => {

  it("should return an array of books", async () => {
    const res = await request(app).get("/api/books");
    expect(res.statusCode).toEqual(200);
    expect(res.body).toBeInstanceOf(Array);
    res.body.forEach(book => {
      expect(book).toHaveProperty("id");
      expect(book).toHaveProperty("title");
      expect(book).toHaveProperty("author");
    });
  });

  it("should return a single book", async () => {
    const res = await request(app).get("/api/books/1");
    expect(res.statusCode).toEqual(200);
    expect(res.body.id).toEqual(1);
  });

  it("should return 400 if id is not a number", async () => {
    const res = await request(app).get("/api/books/abc");
    expect(res.statusCode).toEqual(400);
    expect(res.body.message).toEqual("Input must be a number");
  });

});

describe("Chapter 4: API Tests", () => {

  it("should return 201 when adding a new book", async () => {
    const res = await request(app).post("/api/books").send({
      id: 99,
      title: "New Book",
      author: "Someone"
    });
    expect(res.statusCode).toEqual(201);
  });

  it("should return 400 when adding a book with missing title", async () => {
    const res = await request(app).post("/api/books").send({
      id: 100,
      author: "Someone"
    });
    expect(res.statusCode).toEqual(400);
    expect(res.body.message).toEqual("Bad Request");
  });

  it("should return 204 when deleting a book", async () => {
    const res = await request(app).delete("/api/books/99");
    expect(res.statusCode).toEqual(204);
  });

});

describe("Chapter 5: API Tests", () => {

  it("should update a book and return a 204 status code", async () => {
    const res = await request(app).put("/api/books/1").send({
      title: "Updated Title",
      author: "Updated Author"
    });
    expect(res.statusCode).toEqual(204);
  });

  it("should return a 400 status code when using a non-numeric id", async () => {
    const res = await request(app).put("/api/books/foo").send({
      title: "Updated Title",
      author: "Updated Author"
    });
    expect(res.statusCode).toEqual(400);
    expect(res.body.message).toEqual("Input must be a number");
  });

  it("should return a 400 status code when updating a book with a missing title", async () => {
    const res = await request(app).put("/api/books/1").send({
      author: "Someone"
    });
    expect(res.statusCode).toEqual(400);
    expect(res.body.message).toEqual("Bad Request");
  });

});

describe("Chapter 6: API Tests", () => {

  it("should log a user in and return 200 with 'Authentication successful'", async () => {
    const res = await request(app).post("/api/login").send({
      email: "harry@hogwarts.edu",
      password: "potter"
    });
    expect(res.statusCode).toEqual(200);
    expect(res.body.message).toEqual("Authentication successful");
  });

  it("should return 401 when logging in with incorrect credentials", async () => {
    const res = await request(app).post("/api/login").send({
      email: "harry@hogwarts.edu",
      password: "wrong"
    });
    expect(res.statusCode).toEqual(401);
    expect(res.body.message).toEqual("Unauthorized");
  });

  it("should return 400 when missing email or password", async () => {
    const res = await request(app).post("/api/login").send({
      email: "harry@hogwarts.edu"
    });
    expect(res.statusCode).toEqual(400);
    expect(res.body.message).toEqual("Bad Request");
  });

});

describe("Chapter 7: API Tests", () => {

  it("should return 200 with 'Security questions successfully answered'", async () => {
    const res = await request(app)
      .post("/api/users/harry@hogwarts.edu/verify-security-question")
      .send([
        { answer: "Hedwig" },
        { answer: "Quidditch Through the Ages" },
        { answer: "Evans" }
      ]);

    expect(res.statusCode).toEqual(200);
    expect(res.body.message).toEqual("Security questions successfully answered");
  });

  it("should return 400 when request body fails ajv validation", async () => {
    const res = await request(app)
      .post("/api/users/harry@hogwarts.edu/verify-security-question")
      .send([{ answer: "Hedwig", extra: "bad" }]);

    expect(res.statusCode).toEqual(400);
    expect(res.body.message).toEqual("Bad Request");
  });

  it("should return 401 when answers are incorrect", async () => {
    const res = await request(app)
      .post("/api/users/harry@hogwarts.edu/verify-security-question")
      .send([
        { answer: "Fluffy" },
        { answer: "Quidditch Through the Ages" },
        { answer: "Evans" }
      ]);

    expect(res.statusCode).toEqual(401);
    expect(res.body.message).toEqual("Unauthorized");
  });

});