import mysql from "mysql2/promise";
import { DB_DB, DB_HOST, DB_PASSWORD, DB_USER } from "./env.js";


export const db = await mysql.createPool({
    host: DB_HOST,
    user: DB_USER,
    password: DB_PASSWORD,
    database: DB_DB,
});
