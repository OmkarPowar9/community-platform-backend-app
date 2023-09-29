import { Sequelize } from "sequelize";
import {
  DB_SCHEMA,
  DB_USER,
  DB_PASSWORD,
  DB_HOST,
  DB_PORT,
} from "../config/index.js";

const db = new Sequelize(DB_SCHEMA, DB_USER, DB_PASSWORD, {
  host: DB_HOST,
  dialect: "postgres",
  port: DB_PORT,
});

export async function syncDB() {
  try {
    await db.authenticate();
    console.log("Connected to DB successfully");
    await db.sync({ force: false, alter: true });
  } catch (err) {
    console.error("Unable to connect to the database:", err);
    process.exit(1);
  }
}

export default db;
