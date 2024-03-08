const mongodb = require("mongodb");
const MongoClient = mongodb.MongoClient;

let database;

async function connect() {
  try {
    const client = await MongoClient.connect("mongodb://localhost:27017");
    database = client.db("sms");

    await database.createCollection("contactUs");

    console.log("Connected to the database");
  } catch (error) {
    console.error("Error connecting to db:", error.message);
    throw new Error("Unable to connect to the database");
  }
}

function getDb() {
  if (!database) {
    throw { message: "Database connection not established!" };
  }
  return database;
}

module.exports = {
  connectToDatabase: connect,
  getDb: getDb,
};
