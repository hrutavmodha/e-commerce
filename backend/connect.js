const mongoose = require("mongoose");

module.exports = function connect(dbname = "ecommerce") {
  const mongoUri =
    process.env.MONGO_URI || `mongodb://localhost:27017/${dbname}`;

  return mongoose.connect(mongoUri);
};