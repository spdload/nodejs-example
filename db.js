import dotenv from 'dotenv'
import pkg from "mongoose";

dotenv.config();
const { connect, connection: _connection } = pkg;

const url = process.env.DB_URL;

export var connection;

export function connectToDb () {
  connect(url, { useUnifiedTopology: true, useNewUrlParser: true });
  connection = _connection;
  connection.once("open", function() {
    console.log("MongoDB database connection established successfully");
  });
}
