import express from "express";
import Therapist from "../models/Therapist.js";

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const { specialization, _limit } = req.query;
    
    const query = {};
    if (specialization) {
      query.specializations = { $in: [specialization] };
    }
    
    let dbQuery = Therapist.find(query).sort({ rating: -1 });
    
    if (_limit) {
      dbQuery = dbQuery.limit(parseInt(_limit));
    }
    
    const therapists = await dbQuery;
    res.json(therapists);
  } catch (error) {
    console.error("Error fetching therapists:", error);
    res.status(500).json({ error: "Failed to fetch therapists" });
  }
});

// Haversine formula for distance
function haversineDistance(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

// Advanced search with distance, filters
router.post("/search", async (req, res) => {
  try {
    const { specializations, min_rating = 0, max_fee, languages, available_now, user_location, max_distance = 50 } = req.body;

    const query = { rating: { $gte: min_rating } };
    if (max_fee) query.consultation_fee = { $lte: max_fee };
    if (available_now) query.available_now = true;

    let therapists = await Therapist.find(query).sort({ rating: -1 });

    if (specializations && specializations.length > 0) {
      therapists = therapists.filter((t) => t.specializations.some((s) => specializations.includes(s)));
    }
    if (languages && languages.length > 0) {
      therapists = therapists.filter((t) => t.languages.some((l) => languages.includes(l)));
    }

    let results = therapists.map((t) => t.toObject());
    if (user_location && user_location.lat && user_location.lng) {
      results = results
        .map((t) => ({
          ...t,
          distance: Math.round(haversineDistance(user_location.lat, user_location.lng, t.latitude, t.longitude) * 100) / 100,
        }))
        .filter((t) => t.distance <= max_distance)
        .sort((a, b) => a.distance - b.distance);
    }

    res.json(results);
  } catch (err) {
    console.error("Search error:", err);
    res.status(500).json({ error: "Search failed" });
  }
});

// Get all unique specializations
router.get("/specializations", async (req, res) => {
  try {
    const therapists = await Therapist.find();
    const specs = [...new Set(therapists.flatMap((t) => t.specializations))].sort();
    res.json(specs);
  } catch (err) {
    res.status(500).json({ error: "Failed to get specializations" });
  }
});

router.post("/seed", async (req, res) => {
  try {
    const count = await Therapist.countDocuments();
    if (count > 0) {
      return res.json({ message: "Therapists already seeded" });
    }

    const sampleTherapists = [
      {
          name: 'Dr. Priya Sharma',
          email: 'priya.sharma@withu247.com',
          phone: '+91-9876543210',
          rating: 4.8,
          experience_years: 8,
          specializations: ['Anxiety', 'Depression', 'Stress Management'],
          bio: 'Experienced clinical psychologist specializing in cognitive behavioral therapy.',
          education: 'PhD in Clinical Psychology, AIIMS Delhi',
          languages: ['Hindi', 'English'],
          latitude: 28.5921,
          longitude: 77.0460,
          address: 'Sector 12, Dwarka, New Delhi',
          sector: 'Sector 12',
          available_now: true,
          consultation_fee: 800,
          verified: true
      },
      {
          name: 'Dr. Rajesh Kumar',
          email: 'rajesh.kumar@withu247.com',
          phone: '+91-9876543211',
          rating: 4.6,
          experience_years: 12,
          specializations: ['Family Therapy', 'Relationship Counseling', 'Trauma'],
          bio: 'Family therapist with extensive experience in relationship counseling.',
          education: 'MD Psychiatry, PGIMER Chandigarh',
          languages: ['Hindi', 'English', 'Punjabi'],
          latitude: 28.5985,
          longitude: 77.0516,
          address: 'Sector 18, Dwarka, New Delhi',
          sector: 'Sector 18',
          available_now: false,
          consultation_fee: 1000,
          verified: true
      },
      {
          name: 'Dr. Anita Verma',
          email: 'anita.verma@withu247.com',
          phone: '+91-9876543212',
          rating: 4.9,
          experience_years: 6,
          specializations: ['Child Psychology', 'ADHD', 'Learning Disabilities'],
          bio: 'Child psychologist specializing in developmental disorders.',
          education: 'M.Phil Clinical Psychology, JMI Delhi',
          languages: ['Hindi', 'English'],
          latitude: 28.5889,
          longitude: 77.0583,
          address: 'Sector 21, Dwarka, New Delhi',
          sector: 'Sector 21',
          available_now: true,
          consultation_fee: 700,
          verified: true
      }
    ];

    await Therapist.insertMany(sampleTherapists);
    res.json({ message: "Seeded therapists successfully", count: sampleTherapists.length });
  } catch (error) {
    res.status(500).json({ error: "Failed to seed therapists" });
  }
});

export default router;
