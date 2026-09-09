const mongoose = require('mongoose');

// Fail fast instead of the Mongoose default of silently queueing queries
// (up to bufferTimeoutMS, ~10s) whenever the DB is unreachable — that
// default turns a down database into every request hanging for 10 seconds
// before erroring, instead of erroring immediately.
mongoose.set('bufferCommands', false);

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`MongoDB connection error: ${error.message}`);
    // Don't hard-kill the process: routes that touch the DB will fail
    // individually (and report a clean 500 via errorHandler) rather than
    // taking down health checks / DB-independent routes / test imports
    // whenever Mongo is briefly unreachable.
  }
};

module.exports = connectDB;
