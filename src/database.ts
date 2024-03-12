import mysql from "mysql2";
import dotenv from "dotenv";
import { Connection } from "mysql2";

dotenv.config({ path: "./.env" });

// Database session options
const options = {
  host: process.env.DATABASE_HOST,
  port: 3306,
  user: process.env.DATABASE_USER,
  password: process.env.DATABASE_PASSWORD,
  database: process.env.DATABASE_NAME,
};

// Connect Database
const db: Connection = mysql.createConnection(options);

db.connect((error: Error | any): void => {
  if (error) {
    console.error(error);
  } else {
    console.log("MYSQL CONNECTED...");
  }
});

export default db;
