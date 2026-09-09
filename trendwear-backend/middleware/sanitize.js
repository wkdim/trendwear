// Guards against NoSQL-operator injection (e.g. { "email": { "$gt": "" } })
// and HTTP parameter pollution (?category=Men&category=Women -> array).
//
// Implemented by hand instead of pulling in express-mongo-sanitize/hpp:
// those packages reassign req.query wholesale, which Express 5 rejects
// (req.query is a getter-only property there). Mutating in place, and only
// touching values *inside* req.body/req.params/req.query, is safe on both
// Express 4 and 5.

const isPlainObject = (val) =>
  Object.prototype.toString.call(val) === "[object Object]";

const stripOperators = (input) => {
  if (Array.isArray(input)) {
    input.forEach(stripOperators);
    return input;
  }
  if (!isPlainObject(input)) return input;

  for (const key of Object.keys(input)) {
    if (key.startsWith("$") || key.includes(".")) {
      delete input[key];
      continue;
    }
    stripOperators(input[key]);
  }
  return input;
};

const sanitize = (req, res, next) => {
  stripOperators(req.body);
  stripOperators(req.params);

  // req.query is read-only as a whole in Express 5, but its own keys can
  // still be mutated. Collapse any duplicated (polluted) params to their
  // last value, and drop Mongo-operator-shaped values.
  if (req.query && typeof req.query === "object") {
    for (const key of Object.keys(req.query)) {
      let value = req.query[key];
      if (Array.isArray(value)) value = value[value.length - 1];
      if (isPlainObject(value)) {
        delete req.query[key];
        continue;
      }
      req.query[key] = value;
    }
  }

  next();
};

module.exports = sanitize;
