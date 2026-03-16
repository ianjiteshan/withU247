import mongoose from "mongoose";

const recommendationSchema = new mongoose.Schema({
  symptom: { type: String, required: true },
  doctors: [String],
  hospitals: [String],
});

export default mongoose.model("Recommendation", recommendationSchema);
