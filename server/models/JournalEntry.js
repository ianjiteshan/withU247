import mongoose from "mongoose";

const journalEntrySchema = new mongoose.Schema({
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  title: { type: String, required: true },
  content: { type: String, required: true },
  mood_at_time: { type: Number, min: 1, max: 10 },
  is_private: { type: Boolean, default: true },
  tags: { type: [String], default: [] },
  date_written: { type: Date, default: Date.now },
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now },
});

export default mongoose.model("JournalEntry", journalEntrySchema);
