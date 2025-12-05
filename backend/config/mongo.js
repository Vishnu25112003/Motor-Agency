const mongoose = require("mongoose");

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error(
    "MONGODB_URI must be set. Use your MongoDB Atlas connection string in this env var.",
  );
}

async function connectMongo() {
  if (mongoose.connection.readyState === 1) {
    return;
  }

  await mongoose.connect(MONGODB_URI, {
    // you can add dbName here if you don't include it in the URI
    // dbName: process.env.MONGODB_DB_NAME,
  });
}

module.exports = { connectMongo, mongoose };

