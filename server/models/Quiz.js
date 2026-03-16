import mongoose from "mongoose";

const quizSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String },
  questions: { type: Array, required: true }, // [{text, type, options: [{text, score}]}]
  active: { type: Boolean, default: true },
  created_at: { type: Date, default: Date.now },
});

export default mongoose.model("Quiz", quizSchema);
