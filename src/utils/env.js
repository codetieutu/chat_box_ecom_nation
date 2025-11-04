import dotenv from "dotenv";
dotenv.config();

export const TELEGRAM_TOKEN = process.env.TELEGRAM_TOKEN;
export const BINANCE_API_KEY = process.env.BINANCE_API_KEY;
export const BINANCE_API_SECRET = process.env.BINANCE_API_SECRET;
export const DB_HOST = process.env.DB_HOST;
export const DB_USER = process.env.DB_USER;
export const DB_PASSWORD = process.env.DB_PASSWORD;
export const DB_DB = process.env.DB_DB;
export const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;