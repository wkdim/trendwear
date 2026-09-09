// See auth.integration.test.js for the RUN_DB_TESTS gating rationale.
const request = require("supertest");

process.env.NODE_ENV = "test";
process.env.JWT_SECRET = process.env.JWT_SECRET || "test-secret";

const app = require("../server");

const RUN_DB_TESTS = process.env.RUN_DB_TESTS === "true";
const describeWithDb = RUN_DB_TESTS ? describe : describe.skip;

describe("product routes (no database required)", () => {
  it("400s for a malformed product id instead of throwing", async () => {
    const res = await request(app).get("/api/products/not-a-valid-id");
    expect(res.status).toBe(400);
  });
});

describeWithDb("GET /api/products (requires RUN_DB_TESTS=true + MONGO_URI)", () => {
  const mongoose = require("mongoose");
  const Product = require("../models/Product");

  beforeAll(async () => {
    await mongoose.connect(process.env.MONGO_URI);
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });

  it("lists seeded products with pagination metadata", async () => {
    await Product.deleteMany({ name: /^Test Product/ });
    await Product.create({ name: "Test Product 1", price: 10, category: "Men", stock: 5 });

    const res = await request(app).get("/api/products?limit=5");
    expect(res.status).toBe(200);
    expect(res.body).toEqual(
      expect.objectContaining({ products: expect.any(Array), page: 1, total: expect.any(Number) })
    );
    expect(res.body.products.some((p) => p.name === "Test Product 1")).toBe(true);

    await Product.deleteMany({ name: /^Test Product/ });
  });

  it("404s cleanly for a non-existent product id", async () => {
    const res = await request(app).get("/api/products/507f1f77bcf86cd799439011");
    expect(res.status).toBe(404);
  });
});
