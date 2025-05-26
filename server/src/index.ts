import "reflect-metadata";
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { AppDataSource } from "./config/database";
import classRoutes from "./routes/classRoutes";
import subjectRoutes from "./routes/subjectRoutes";
import teacherRoutes from "./routes/teacherRoutes";
import periodRoutes from "./routes/periodRoutes";
import timetableRoutes from "./routes/timetableRoutes";

// Load environment variables
dotenv.config();

// Create express app
const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors({
  origin: ['http://localhost:3000', 'http://127.0.0.1:3000'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

// Routes
app.use("/api/classes", classRoutes);
app.use("/api/subjects", subjectRoutes);
app.use("/api/teachers", teacherRoutes);
app.use("/api/periods", periodRoutes);
app.use("/api/timetables", timetableRoutes);

// Health check route
app.get("/health", (req, res) => {
  res.status(200).json({ status: "ok", message: "Server is running" });
});

// Initialize database connection
AppDataSource.initialize()
  .then(() => {
    console.log("Database connection established");
    
    // Start the server
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  })
  .catch((error) => {
    console.error("Error connecting to database:", error);
  });
