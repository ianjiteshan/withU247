import express from "express";
import MoodEntry from "../models/MoodEntry.js";
import { authenticate } from "../middleware/auth.js";

const router = express.Router();

// Create mood entry
router.post("/", authenticate, async (req, res) => {
  try {
    const entry = new MoodEntry({ ...req.body, user_id: req.userId });
    await entry.save();
    res.status(201).json(entry);
  } catch (err) {
    res.status(500).json({ error: "Failed to create mood entry" });
  }
});

// Get mood entries with optional date filtering
router.get("/", authenticate, async (req, res) => {
  try {
    const { start_date, end_date, limit = 30 } = req.query;
    const query = { user_id: req.userId };

    if (start_date) query.date_recorded = { ...query.date_recorded, $gte: new Date(start_date) };
    if (end_date) query.date_recorded = { ...query.date_recorded, $lte: new Date(end_date) };

    const entries = await MoodEntry.find(query)
      .sort({ date_recorded: -1 })
      .limit(parseInt(limit));

    res.json(entries);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch mood entries" });
  }
});

// Get mood stats (30-day)
router.get("/stats", authenticate, async (req, res) => {
  try {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const entries = await MoodEntry.find({
      user_id: req.userId,
      date_recorded: { $gte: thirtyDaysAgo },
    }).sort({ date_recorded: 1 });

    if (entries.length === 0) {
      return res.json({
        average_mood: 0, average_energy: 0, average_stress: 0,
        average_sleep: 0, total_entries: 0, mood_trend: [],
      });
    }

    const total = entries.length;
    const avg = (field) => entries.reduce((s, e) => s + (e[field] || 0), 0) / total;

    res.json({
      average_mood: Math.round(avg("mood_level") * 100) / 100,
      average_energy: Math.round(avg("energy_level") * 100) / 100,
      average_stress: Math.round(avg("stress_level") * 100) / 100,
      average_sleep: Math.round(avg("sleep_hours") * 100) / 100,
      total_entries: total,
      mood_trend: entries.map((e) => ({
        date: e.date_recorded, mood_level: e.mood_level,
        energy_level: e.energy_level, stress_level: e.stress_level,
      })),
    });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch mood stats" });
  }
});

export default router;
