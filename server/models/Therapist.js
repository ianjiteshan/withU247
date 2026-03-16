import mongoose from "mongoose";

const therapistSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: false },
  phone: { type: String, required: false },
  rating: { type: Number, default: 0 },
  experience_years: { type: Number, default: 0 },
  specializations: { type: [String], default: [] },
  bio: { type: String, required: false },
  education: { type: String, required: false },
  languages: { type: [String], default: [] },
  
  // Location
  latitude: { type: Number, required: false },
  longitude: { type: Number, required: false },
  address: { type: String, required: false },
  sector: { type: String, required: false },
  
  // Availability
  available_now: { type: Boolean, default: false },
  consultation_fee: { type: Number, default: 0 },
  session_duration: { type: Number, default: 60 }, // minutes
  
  // Profile
  profile_image: { type: String, required: false },
  verified: { type: Boolean, default: false },

  created_at: { type: Date, default: Date.now }
});

export default mongoose.model("Therapist", therapistSchema);
