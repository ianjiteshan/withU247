import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import mongoose from "mongoose";
import symptomRoutes from "./routes/symptomRoutes.js";
import chatRoutes from "./routes/chatRoutes.js";
import therapistRoutes from "./routes/therapistRoutes.js";
import recommendationRoutes from "./routes/recommendationRoutes.js";
import mappingRoutes from "./routes/mappingRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import moodRoutes from "./routes/moodRoutes.js";
import journalRoutes from "./routes/journalRoutes.js";
import quizRoutes from "./routes/quizRoutes.js";
import dashboardRoutes from "./routes/dashboardRoutes.js";

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT && process.env.PORT !== '5000' ? process.env.PORT : 5005;
const MONGO_URI = process.env.MONGO_URI;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use("/api/symptom", symptomRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/therapists", therapistRoutes);
app.use("/api/recommendations", recommendationRoutes);
app.use("/api/mapping", mappingRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/user", userRoutes);
app.use("/api/mood", moodRoutes);
app.use("/api/journal", journalRoutes);
app.use("/api/quizzes", quizRoutes);
app.use("/api/dashboard", dashboardRoutes);

// Root endpoint
app.get("/", (req, res) => {
  res.json({ message: "✅ WithU247 Backend is running" });
});

// Connect to MongoDB and start server
mongoose
  .connect(MONGO_URI)
  .then(() => {
    console.log("✅ Connected to MongoDB");
    app.listen(PORT, () =>
      console.log(`🚀 Server running at http://localhost:${PORT}`)
    );
  })
  .catch((err) => {
    console.error("❌ MongoDB connection error:", err.message);
    process.exit(1);
  });



