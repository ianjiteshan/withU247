import mongoose from "mongoose";

const moodEntrySchema = new mongoose.Schema({
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  mood_level: { type: Number, required: true, min: 1, max: 10 },
  mood_type: { type: String }, // happy, sad, anxious, calm, etc.
  energy_level: { type: Number, min: 1, max: 10 },
  sleep_hours: { type: Number },
  stress_level: { type: Number, min: 1, max: 10 },
  notes: { type: String },
  tags: { type: [String], default: [] },
  date_recorded: { type: Date, default: Date.now },
  created_at: { type: Date, default: Date.now },
});

export default mongoose.model("MoodEntry", moodEntrySchema);
