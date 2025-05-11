import { DataSource } from "typeorm";
import dotenv from "dotenv";
import path from "path";

// Load environment variables
dotenv.config();

export const AppDataSource = new DataSource({
  type: "mysql",
  host: process.env.DB_HOST || "localhost",
  port: parseInt(process.env.DB_PORT || "3306"),
  username: process.env.DB_USERNAME || "root",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME || "timetable_db",
  synchronize: true, // Set to false in production
  logging: process.env.NODE_ENV === "development" ? true : false,
  entities: [path.join(__dirname, "../models/**/*.{ts,js}")],
  migrations: [path.join(__dirname, "../migrations/**/*.{ts,js}")],
  subscribers: [path.join(__dirname, "../subscribers/**/*.{ts,js}")],
  ssl: false
});
