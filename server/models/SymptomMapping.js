import mongoose from "mongoose";

const SymptomMappingSchema = new mongoose.Schema({
  symptom: { type: String, required: true, unique: true },
  doctorSpecialty: { type: String, required: true },
});

export default mongoose.model("SymptomMapping", SymptomMappingSchema);
