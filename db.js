const mongoose = require('mongoose');

// Define the connection URL and options
const dbURL = 'mongodb://localhost:27017/news_headlines_db';
const dbOptions = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
};

// Create a reusable connection instance
const dbConnection = mongoose.createConnection(dbURL, dbOptions);

// Export the connection instance
module.exports = dbConnection;
