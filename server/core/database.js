const mongoose = require("mongoose");
const config = require("../../config");

// Build connection URL properly
let connectionUrl = config.DATABASE.URL;
if (config.DATABASE.NAME && !connectionUrl.includes(config.DATABASE.NAME)) {
  // Insert database name before query parameters
  if (connectionUrl.includes("?")) {
    connectionUrl = connectionUrl.replace("?", `${config.DATABASE.NAME}?`);
  } else {
    connectionUrl = connectionUrl + config.DATABASE.NAME;
  }
}

console.log("Connecting to database:", connectionUrl.split("@")[1]); // Log without credentials

mongoose.connect(
  connectionUrl,
  { useNewUrlParser: true, useUnifiedTopology: true },
  (err) => {
    if (!err) {
      console.log(
        "mongodb connected successfully to:",
        mongoose.connection.db.databaseName
      );
    } else {
      console.log("mongodb connect:" + JSON.stringify(err, undefined, 2));
    }
  }
);

module.exports = mongoose;
