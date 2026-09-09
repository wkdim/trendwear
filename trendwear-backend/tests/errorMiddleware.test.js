const { notFound, errorHandler } = require("../middleware/errorMiddleware");

const mockRes = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

describe("notFound", () => {
  it("passes a 404 error to next with the requested URL", () => {
    const req = { originalUrl: "/api/nope" };
    const next = jest.fn();

    notFound(req, {}, next);

    expect(next).toHaveBeenCalledTimes(1);
    const err = next.mock.calls[0][0];
    expect(err.statusCode).toBe(404);
    expect(err.message).toContain("/api/nope");
  });
});

describe("errorHandler", () => {
  const originalEnv = process.env.NODE_ENV;
  afterEach(() => {
    process.env.NODE_ENV = originalEnv;
  });

  it("defaults unlabelled errors to 500", () => {
    const res = mockRes();
    errorHandler(new Error("boom"), {}, res, jest.fn());

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ message: "boom" })
    );
  });

  it("respects a custom statusCode (e.g. from ApiError)", () => {
    const res = mockRes();
    const err = new Error("nope");
    err.statusCode = 403;

    errorHandler(err, {}, res, jest.fn());

    expect(res.status).toHaveBeenCalledWith(403);
  });

  it("maps a Mongoose CastError to a 404", () => {
    const res = mockRes();
    const err = new Error("Cast to ObjectId failed");
    err.name = "CastError";

    errorHandler(err, {}, res, jest.fn());

    expect(res.status).toHaveBeenCalledWith(404);
  });

  it("maps a duplicate-key error to a 400 naming the field", () => {
    const res = mockRes();
    const err = new Error("dup");
    err.code = 11000;
    err.keyValue = { email: "a@b.com" };

    errorHandler(err, {}, res, jest.fn());

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ message: expect.stringContaining("email") })
    );
  });

  it("hides the stack trace in production", () => {
    process.env.NODE_ENV = "production";
    const res = mockRes();

    errorHandler(new Error("secret internals"), {}, res, jest.fn());

    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ stack: undefined })
    );
  });
});
