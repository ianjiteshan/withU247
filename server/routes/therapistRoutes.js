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
    // Clear existing and re-seed
    await Therapist.deleteMany({});

    const sampleTherapists = [
      {
        name: 'Dr. Priya Sharma',
        email: 'priya.sharma@withu247.com',
        phone: '+91-9876543210',
        rating: 4.8,
        experience_years: 8,
        specializations: ['Anxiety', 'Depression', 'Stress Management'],
        bio: 'Experienced clinical psychologist specializing in cognitive behavioral therapy. Expert in treating anxiety disorders and chronic stress.',
        education: 'PhD in Clinical Psychology, AIIMS Delhi',
        languages: ['Hindi', 'English'],
        latitude: 28.5921,
        longitude: 77.0460,
        address: 'Sector 12, Dwarka, New Delhi',
        sector: 'Sector 12',
        available_now: true,
        consultation_fee: 800,
        verified: true,
        profile_image: 'https://randomuser.me/api/portraits/women/44.jpg'
      },
      {
        name: 'Dr. Rajesh Kumar',
        email: 'rajesh.kumar@withu247.com',
        phone: '+91-9876543211',
        rating: 4.6,
        experience_years: 12,
        specializations: ['Family Therapy', 'Relationship Counseling', 'Trauma'],
        bio: 'Family therapist with extensive experience in relationship counseling and trauma recovery.',
        education: 'MD Psychiatry, PGIMER Chandigarh',
        languages: ['Hindi', 'English', 'Punjabi'],
        latitude: 28.5985,
        longitude: 77.0516,
        address: 'Sector 18, Dwarka, New Delhi',
        sector: 'Sector 18',
        available_now: false,
        consultation_fee: 1000,
        verified: true,
        profile_image: 'https://randomuser.me/api/portraits/men/32.jpg'
      },
      {
        name: 'Dr. Anita Verma',
        email: 'anita.verma@withu247.com',
        phone: '+91-9876543212',
        rating: 4.9,
        experience_years: 6,
        specializations: ['Child Psychology', 'ADHD', 'Learning Disabilities'],
        bio: 'Child psychologist specializing in developmental disorders and learning difficulties in children.',
        education: 'M.Phil Clinical Psychology, JMI Delhi',
        languages: ['Hindi', 'English'],
        latitude: 28.5889,
        longitude: 77.0583,
        address: 'Sector 21, Dwarka, New Delhi',
        sector: 'Sector 21',
        available_now: true,
        consultation_fee: 700,
        verified: true,
        profile_image: 'https://randomuser.me/api/portraits/women/68.jpg'
      },
      {
        name: 'Dr. Suresh Menon',
        email: 'suresh.menon@withu247.com',
        phone: '+91-9876543213',
        rating: 4.7,
        experience_years: 15,
        specializations: ['Addiction Recovery', 'Substance Abuse', 'Depression'],
        bio: 'Psychiatrist focused on addiction medicine and dual-diagnosis treatment with 15 years of clinical experience.',
        education: 'MD Psychiatry, NIMHANS Bangalore',
        languages: ['Hindi', 'English', 'Malayalam'],
        latitude: 28.6105,
        longitude: 77.0405,
        address: 'Sector 7, Dwarka, New Delhi',
        sector: 'Sector 7',
        available_now: true,
        consultation_fee: 1200,
        verified: true,
        profile_image: 'https://randomuser.me/api/portraits/men/45.jpg'
      },
      {
        name: 'Dr. Neha Gupta',
        email: 'neha.gupta@withu247.com',
        phone: '+91-9876543214',
        rating: 4.5,
        experience_years: 5,
        specializations: ['Anxiety', 'OCD', 'Panic Disorders'],
        bio: 'Clinical psychologist with a focus on anxiety spectrum disorders and obsessive-compulsive behavior therapy.',
        education: 'M.Phil Clinical Psychology, Delhi University',
        languages: ['Hindi', 'English'],
        latitude: 28.5834,
        longitude: 77.0678,
        address: 'Sector 23, Dwarka, New Delhi',
        sector: 'Sector 23',
        available_now: false,
        consultation_fee: 600,
        verified: true,
        profile_image: 'https://randomuser.me/api/portraits/women/65.jpg'
      },
      {
        name: 'Dr. Arjun Singh',
        email: 'arjun.singh@withu247.com',
        phone: '+91-9876543215',
        rating: 4.8,
        experience_years: 10,
        specializations: ['PTSD', 'Trauma', 'Grief Counseling'],
        bio: 'Trauma specialist with extensive experience in EMDR therapy and grief processing for veterans and civilians.',
        education: 'PhD in Counselling Psychology, BHU',
        languages: ['Hindi', 'English', 'Punjabi'],
        latitude: 28.6032,
        longitude: 77.0349,
        address: 'Sector 4, Dwarka, New Delhi',
        sector: 'Sector 4',
        available_now: true,
        consultation_fee: 900,
        verified: true,
        profile_image: 'https://randomuser.me/api/portraits/men/52.jpg'
      },
      {
        name: 'Dr. Kavita Deshmukh',
        email: 'kavita.deshmukh@withu247.com',
        phone: '+91-9876543216',
        rating: 4.7,
        experience_years: 9,
        specializations: ['Depression', 'Bipolar Disorder', 'Mood Disorders'],
        bio: 'Expert in mood disorders with a compassionate approach to long-term recovery and medication management.',
        education: 'MD Psychiatry, KEM Hospital Mumbai',
        languages: ['Hindi', 'English', 'Marathi'],
        latitude: 28.5776,
        longitude: 77.0721,
        address: 'Sector 28, Dwarka, New Delhi',
        sector: 'Sector 28',
        available_now: false,
        consultation_fee: 1100,
        verified: true,
        profile_image: 'https://randomuser.me/api/portraits/women/33.jpg'
      },
      {
        name: 'Dr. Arun Patel',
        email: 'arun.patel@withu247.com',
        phone: '+91-9876543217',
        rating: 4.4,
        experience_years: 7,
        specializations: ['Stress Management', 'Work-Life Balance', 'Burnout'],
        bio: 'Corporate wellness psychologist specializing in workplace stress, burnout prevention, and executive coaching.',
        education: 'M.Phil Psychology, IIT Delhi',
        languages: ['Hindi', 'English', 'Gujarati'],
        latitude: 28.6145,
        longitude: 77.0298,
        address: 'Sector 3, Dwarka, New Delhi',
        sector: 'Sector 3',
        available_now: true,
        consultation_fee: 750,
        verified: true,
        profile_image: 'https://randomuser.me/api/portraits/men/64.jpg'
      },
      {
        name: 'Dr. Sneha Reddy',
        email: 'sneha.reddy@withu247.com',
        phone: '+91-9876543218',
        rating: 4.9,
        experience_years: 11,
        specializations: ['Relationship Counseling', 'Couples Therapy', 'Family Therapy'],
        bio: 'Acclaimed relationship therapist with over a decade of experience in marital therapy and family systems.',
        education: 'PhD in Psychology, Osmania University',
        languages: ['Hindi', 'English', 'Telugu'],
        latitude: 28.5950,
        longitude: 77.0532,
        address: 'Sector 14, Dwarka, New Delhi',
        sector: 'Sector 14',
        available_now: true,
        consultation_fee: 1300,
        verified: true,
        profile_image: 'https://randomuser.me/api/portraits/women/26.jpg'
      },
      {
        name: 'Dr. Vikram Joshi',
        email: 'vikram.joshi@withu247.com',
        phone: '+91-9876543219',
        rating: 4.3,
        experience_years: 4,
        specializations: ['Sleep Disorders', 'Insomnia', 'Anxiety'],
        bio: 'Sleep medicine specialist combining CBT-I techniques with mindfulness for comprehensive sleep restoration.',
        education: 'M.Sc Psychology, Christ University',
        languages: ['Hindi', 'English', 'Kannada'],
        latitude: 28.5867,
        longitude: 77.0612,
        address: 'Sector 22, Dwarka, New Delhi',
        sector: 'Sector 22',
        available_now: false,
        consultation_fee: 500,
        verified: true,
        profile_image: 'https://randomuser.me/api/portraits/men/22.jpg'
      },
      {
        name: 'Dr. Meera Iyer',
        email: 'meera.iyer@withu247.com',
        phone: '+91-9876543220',
        rating: 4.6,
        experience_years: 14,
        specializations: ['Eating Disorders', 'Body Image', 'Self-Esteem'],
        bio: 'Leading expert on eating disorders and body dysmorphia, helping patients rebuild a healthy self-image.',
        education: 'MD Psychiatry, CMC Vellore',
        languages: ['Hindi', 'English', 'Tamil'],
        latitude: 28.6078,
        longitude: 77.0445,
        address: 'Sector 9, Dwarka, New Delhi',
        sector: 'Sector 9',
        available_now: true,
        consultation_fee: 950,
        verified: true,
        profile_image: 'https://randomuser.me/api/portraits/women/55.jpg'
      },
      {
        name: 'Dr. Rohit Bhatia',
        email: 'rohit.bhatia@withu247.com',
        phone: '+91-9876543221',
        rating: 4.5,
        experience_years: 8,
        specializations: ['Anger Management', 'Impulse Control', 'Stress Management'],
        bio: 'Behavioral therapist specializing in anger management programs and impulse control training.',
        education: 'M.Phil Psychiatric Social Work, TISS Mumbai',
        languages: ['Hindi', 'English'],
        latitude: 28.5803,
        longitude: 77.0656,
        address: 'Sector 25, Dwarka, New Delhi',
        sector: 'Sector 25',
        available_now: false,
        consultation_fee: 850,
        verified: true,
        profile_image: 'https://randomuser.me/api/portraits/men/75.jpg'
      },
      {
        name: 'Dr. Pooja Malhotra',
        email: 'pooja.malhotra@withu247.com',
        phone: '+91-9876543222',
        rating: 4.8,
        experience_years: 13,
        specializations: ['Child Psychology', 'Autism Spectrum', 'ADHD'],
        bio: 'Developmental psychologist with deep expertise in autism spectrum disorders and early intervention strategies.',
        education: 'PhD in Developmental Psychology, JNU Delhi',
        languages: ['Hindi', 'English'],
        latitude: 28.6001,
        longitude: 77.0489,
        address: 'Sector 10, Dwarka, New Delhi',
        sector: 'Sector 10',
        available_now: true,
        consultation_fee: 1000,
        verified: true,
        profile_image: 'https://randomuser.me/api/portraits/women/85.jpg'
      },
      {
        name: 'Dr. Karan Saxena',
        email: 'karan.saxena@withu247.com',
        phone: '+91-9876543223',
        rating: 4.7,
        experience_years: 9,
        specializations: ['Social Anxiety', 'Phobias', 'Panic Disorders'],
        bio: 'Anxiety specialist using exposure therapy and virtual reality techniques for phobia desensitization.',
        education: 'M.Phil Clinical Psychology, AIIMS Delhi',
        languages: ['Hindi', 'English'],
        latitude: 28.5912,
        longitude: 77.0547,
        address: 'Sector 16, Dwarka, New Delhi',
        sector: 'Sector 16',
        available_now: true,
        consultation_fee: 900,
        verified: true,
        profile_image: 'https://randomuser.me/api/portraits/men/36.jpg'
      },
      {
        name: 'Dr. Ritu Kapoor',
        email: 'ritu.kapoor@withu247.com',
        phone: '+91-9876543224',
        rating: 4.6,
        experience_years: 7,
        specializations: ['Grief Counseling', 'Loss Therapy', 'Depression'],
        bio: 'Compassionate grief counselor helping individuals process loss and find new meaning after bereavement.',
        education: 'M.Sc Counseling Psychology, Lady Shri Ram College',
        languages: ['Hindi', 'English', 'Urdu'],
        latitude: 28.5756,
        longitude: 77.0745,
        address: 'Sector 29, Dwarka, New Delhi',
        sector: 'Sector 29',
        available_now: false,
        consultation_fee: 650,
        verified: true,
        profile_image: 'https://randomuser.me/api/portraits/women/42.jpg'
      }
    ];

    await Therapist.insertMany(sampleTherapists);
    res.json({ message: "Seeded 15 therapists successfully!", count: sampleTherapists.length });
  } catch (error) {
    console.error("Seed error:", error);
    res.status(500).json({ error: "Failed to seed therapists" });
  }
});

export default router;
