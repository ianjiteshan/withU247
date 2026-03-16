import mongoose from "mongoose";

const quizResultSchema = new mongoose.Schema({
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  quiz_id: { type: mongoose.Schema.Types.ObjectId, ref: "Quiz", required: true },
  answers: { type: Array, default: [] },
  score: { type: Number, required: true },
  interpretation: { type: Object }, // { level, description, recommendations }
  recommended_therapist_ids: { type: [mongoose.Schema.Types.ObjectId], default: [] },
  taken_at: { type: Date, default: Date.now },
});

export default mongoose.model("QuizResult", quizResultSchema);
