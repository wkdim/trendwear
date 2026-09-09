const express = require("express");
const request = require("supertest");
const { registerRules, cartAddRules, validate } = require("../middleware/validators");

// These exercise the validation chains in isolation, against a throwaway
// express app, so they don't need a database connection.
const buildApp = (rules) => {
  const app = express();
  app.use(express.json());
  app.post("/test", rules, validate, (req, res) => res.json({ ok: true }));
  return app;
};

describe("registerRules", () => {
  const app = buildApp(registerRules);

  it("rejects a missing name/invalid email/short password", async () => {
    const res = await request(app)
      .post("/test")
      .send({ name: "", email: "not-an-email", password: "123" });

    expect(res.status).toBe(400);
    const fields = res.body.errors.map((e) => e.field);
    expect(fields).toEqual(expect.arrayContaining(["name", "email", "password"]));
  });

  it("accepts a valid payload", async () => {
    const res = await request(app)
      .post("/test")
      .send({ name: "Ama", email: "ama@example.com", password: "supersecret" });

    expect(res.status).toBe(200);
  });
});

describe("cartAddRules", () => {
  const app = buildApp(cartAddRules);

  it("rejects a non-ObjectId productId", async () => {
    const res = await request(app).post("/test").send({ productId: "not-an-id" });
    expect(res.status).toBe(400);
  });

  it("accepts a valid ObjectId with no quantity (defaults elsewhere)", async () => {
    const res = await request(app)
      .post("/test")
      .send({ productId: "507f1f77bcf86cd799439011" });
    expect(res.status).toBe(200);
  });
});
