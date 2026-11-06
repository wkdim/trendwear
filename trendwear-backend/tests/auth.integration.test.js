// Integration tests against the real Express app + Mongoose models.
//
// The DB-dependent cases only run when explicitly opted into with
// RUN_DB_TESTS=true (and a real MONGO_URI); this repo's .env values are
// placeholders, not a guaranteed live database, and this sandbox has no
// reachable Mongo at all. The decision is made synchronously at file-load
// time (not via an async "try connecting, skip on failure" probe): mixing
// server.js's own fire-and-forget connectDB() with a second, timed connect
// attempt from the test file is exactly the kind of racy, slow-to-fail setup
// that caused every DB-touching test here to hang until timeout, so it's
// avoided rather than worked around.
//
//   RUN_DB_TESTS=true MONGO_URI=mongodb://127.0.0.1:27017/trendwear_test npm test
const request = require("supertest");

process.env.NODE_ENV = "test";
process.env.JWT_SECRET = process.env.JWT_SECRET || "test-secret";
process.env.JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "1h";

const app = require("../server");

const RUN_DB_TESTS = process.env.RUN_DB_TESTS === "true";
const describeWithDb = RUN_DB_TESTS ? describe : describe.skip;

describe("auth validation (no database required)", () => {
  it("rejects invalid registration payloads before touching the database", async () => {
    const res = await request(app)
      .post("/api/auth/register")
      .send({ name: "", email: "not-an-email", password: "123" });

    expect(res.status).toBe(400);
  });

  it("rejects a login with a missing password", async () => {
    const res = await request(app)
      .post("/api/auth/login")
      .send({ email: "someone@example.com" });

    expect(res.status).toBe(400);
  });
});

describeWithDb("auth flow (requires RUN_DB_TESTS=true + MONGO_URI)", () => {
  const mongoose = require("mongoose");
  const User = require("../models/User");

  beforeAll(async () => {
    await mongoose.connect(process.env.MONGO_URI);
    await User.deleteMany({ email: /@trendwear-test\.com$/ });
  });

  afterAll(async () => {
    await User.deleteMany({ email: /@trendwear-test\.com$/ });
    await mongoose.connection.close();
  });

  it("registers, then blocks a duplicate, then logs in", async () => {
    const email = "new.user@trendwear-test.com";

    const registerRes = await request(app)
      .post("/api/auth/register")
      .send({ name: "New User", email, password: "password123" });

    expect(registerRes.status).toBe(201);
    expect(registerRes.body.role).toBe("customer"); // role can't be self-assigned
    expect(registerRes.body.token).toBeDefined();

    const dupeRes = await request(app)
      .post("/api/auth/register")
      .send({ name: "New User", email, password: "password123" });
    expect(dupeRes.status).toBe(400);

    const loginRes = await request(app)
      .post("/api/auth/login")
      .send({ email, password: "password123" });
    expect(loginRes.status).toBe(200);
    expect(loginRes.body.token).toBeDefined();

    const meRes = await request(app)
      .get("/api/auth/me")
      .set("Authorization", `Bearer ${loginRes.body.token}`);
    expect(meRes.status).toBe(200);
    expect(meRes.body.email).toBe(email);
  });

  it("ignores a client-supplied admin role on registration", async () => {
    const email = "wannabe.admin@trendwear-test.com";
    const res = await request(app)
      .post("/api/auth/register")
      .send({ name: "Wannabe Admin", email, password: "password123", role: "admin" });

    expect(res.status).toBe(201);
    expect(res.body.role).toBe("customer");
  });
});
