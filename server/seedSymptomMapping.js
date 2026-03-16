import mongoose from "mongoose";
import dotenv from "dotenv";
import SymptomMapping from "./models/SymptomMapping.js";

dotenv.config();

const MONGO_URI = process.env.MONGO_URI;

const seedData = [
  { symptom: "chest pain", doctorSpecialty: "Cardiologist" },
  { symptom: "fever", doctorSpecialty: "General Physician" },
  { symptom: "skin rash", doctorSpecialty: "Dermatologist" },
  { symptom: "toothache", doctorSpecialty: "Dentist" },
  { symptom: "eye pain", doctorSpecialty: "Ophthalmologist" }
];

(async () => {
  try {
    await mongoose.connect(MONGO_URI);
    await SymptomMapping.insertMany(seedData);
    console.log("✅ Symptom mappings added");
    process.exit();
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
})();
