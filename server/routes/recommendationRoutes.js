import express from "express";
import Recommendation from "../models/Recommendation.js";

const router = express.Router();

// Seed example--> just done in initial for testing
router.post("/seed", async (req, res) => {
  const sample = new Recommendation({
    symptom: "fever",
    doctors: ["General Physician", "Infectious Disease Specialist"],
    hospitals: ["AIIMS Delhi", "Apollo Hospital"],
  });
  await sample.save();
  res.json({ message: "Seeded sample recommendation ✅" });
});

// Get recommendation
router.get("/", async (req, res) => {
  const { symptom } = req.query;
  const rec = await Recommendation.findOne({ symptom });
  if (!rec) return res.status(404).json({ error: "No recommendations found" });
  res.json(rec);
});

export default router;
