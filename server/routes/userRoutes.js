import express from "express";
import User from "../models/User.js";
import { authenticate } from "../middleware/auth.js";

const router = express.Router();

// Get profile
router.get("/profile", authenticate, async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ error: "User not found" });
    res.json(user.toProfile());
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

// Update profile
router.put("/profile", authenticate, async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ error: "User not found" });

    const allowedFields = [
      "first_name", "last_name", "phone", "date_of_birth", "gender",
      "city", "state", "pincode",
      "emergency_contact_name", "emergency_contact_phone",
      "medical_conditions", "current_medications", "therapy_history",
      "notification_preferences"
    ];

    for (const field of allowedFields) {
      if (req.body[field] !== undefined) {
        user[field] = req.body[field];
      }
    }

    await user.save();
    res.json({ message: "Profile updated successfully", user: user.toProfile() });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

export default router;
