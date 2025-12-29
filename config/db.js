import { pool } from "pg";
import dotenv from "dotenv";
dotenv.config();

const pool = new pool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT
});
pool.on("connect", () => {
    console.log("Connected to the database");
});

pool.on("error", (err) => {
    console.log("Database connection error", err);
});

export default pool;
