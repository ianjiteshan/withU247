import express from "express";
import { authenticate } from "../middleware/auth.js";
import MoodEntry from "../models/MoodEntry.js";
import JournalEntry from "../models/JournalEntry.js";
import QuizResult from "../models/QuizResult.js";
import Therapist from "../models/Therapist.js";

const router = express.Router();

// GET /api/dashboard/summary
router.get("/summary", authenticate, async (req, res) => {
  try {
    const userId = req.user._id;

    // 1. Get last 7 days mood stats
    const last7Days = new Date();
    last7Days.setDate(last7Days.getDate() - 7);
    
    const moodStats = await MoodEntry.aggregate([
      { $match: { user_id: userId, date_recorded: { $gte: last7Days } } },
      {
        $group: {
          _id: null,
          avg_mood: { $avg: "$mood_level" },
          avg_stress: { $avg: "$stress_level" },
          total_entries: { $sum: 1 }
        }
      }
    ]);

    // 2. Get last journal entry
    const lastJournal = await JournalEntry.findOne({ user_id: userId })
      .sort({ date_written: -1 })
      .select("title content date_written");

    // 3. Get recent quiz result
    const lastQuiz = await QuizResult.findOne({ user_id: userId })
      .sort({ date_taken: -1 })
      .populate("quiz_id", "title");

    // 4. Get recommended therapists (just a sample for the dashboard)
    const recommendedTherapists = await Therapist.find().limit(4);

    res.json({
      mood: moodStats[0] || { avg_mood: 0, avg_stress: 0, total_entries: 0 },
      journal: lastJournal,
      quiz: lastQuiz,
      therapists: recommendedTherapists,
      username: req.user.username
    });
  } catch (error) {
    console.error("Dashboard error:", error);
    res.status(500).json({ message: "Error fetching dashboard summary" });
  }
});

export default router;
