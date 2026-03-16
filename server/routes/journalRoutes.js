import express from "express";
import JournalEntry from "../models/JournalEntry.js";
import { authenticate } from "../middleware/auth.js";

const router = express.Router();

// Create journal entry
router.post("/", authenticate, async (req, res) => {
  try {
    const entry = new JournalEntry({ ...req.body, user_id: req.userId });
    await entry.save();
    res.status(201).json(entry);
  } catch (err) {
    res.status(500).json({ error: "Failed to create journal entry" });
  }
});

// List journal entries (with search)
router.get("/", authenticate, async (req, res) => {
  try {
    const { start_date, end_date, search, limit = 20 } = req.query;
    const query = { user_id: req.userId };

    if (start_date) query.date_written = { ...query.date_written, $gte: new Date(start_date) };
    if (end_date) query.date_written = { ...query.date_written, $lte: new Date(end_date) };
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: "i" } },
        { content: { $regex: search, $options: "i" } },
      ];
    }

    const entries = await JournalEntry.find(query)
      .sort({ date_written: -1 })
      .limit(parseInt(limit));
    res.json(entries);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch journal entries" });
  }
});

// Get single journal entry
router.get("/:id", authenticate, async (req, res) => {
  try {
    const entry = await JournalEntry.findOne({ _id: req.params.id, user_id: req.userId });
    if (!entry) return res.status(404).json({ error: "Not found" });
    res.json(entry);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch journal entry" });
  }
});

// Update journal entry
router.put("/:id", authenticate, async (req, res) => {
  try {
    const entry = await JournalEntry.findOne({ _id: req.params.id, user_id: req.userId });
    if (!entry) return res.status(404).json({ error: "Not found" });

    const { title, content, mood_at_time, is_private, tags } = req.body;
    if (title !== undefined) entry.title = title;
    if (content !== undefined) entry.content = content;
    if (mood_at_time !== undefined) entry.mood_at_time = mood_at_time;
    if (is_private !== undefined) entry.is_private = is_private;
    if (tags !== undefined) entry.tags = tags;
    entry.updated_at = Date.now();

    await entry.save();
    res.json(entry);
  } catch (err) {
    res.status(500).json({ error: "Failed to update journal entry" });
  }
});

// Delete journal entry
router.delete("/:id", authenticate, async (req, res) => {
  try {
    const entry = await JournalEntry.findOneAndDelete({ _id: req.params.id, user_id: req.userId });
    if (!entry) return res.status(404).json({ error: "Not found" });
    res.json({ message: "Journal entry deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: "Failed to delete journal entry" });
  }
});

export default router;
