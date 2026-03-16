import mongoose from "mongoose";

const chatLogSchema = new mongoose.Schema({
  session_id: { type: String, required: true },
  user_id: { type: String, required: false },
  user_message: { type: String, required: true },
  ai_response: { type: String, required: true },
  
  // Analysis fields
  sentiment_score: { type: Number },
  urgency_level: { type: String, default: "low" },
  detected_issues: { type: [String], default: [] },
  
  created_at: { type: Date, default: Date.now },
});

export default mongoose.model("ChatLog", chatLogSchema);
