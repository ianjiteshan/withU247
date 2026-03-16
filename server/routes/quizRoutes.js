import express from "express";
import Quiz from "../models/Quiz.js";
import QuizResult from "../models/QuizResult.js";
import Therapist from "../models/Therapist.js";
import { authenticate } from "../middleware/auth.js";

const router = express.Router();

// Get all active quizzes
router.get("/", async (req, res) => {
  try {
    const quizzes = await Quiz.find({ active: true });
    res.json(quizzes);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch quizzes" });
  }
});

// Get specific quiz
router.get("/:id", async (req, res) => {
  try {
    const quiz = await Quiz.findById(req.params.id);
    if (!quiz) return res.status(404).json({ error: "Quiz not found" });
    res.json(quiz);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch quiz" });
  }
});

// Submit quiz answers
router.post("/:id/submit", authenticate, async (req, res) => {
  try {
    const quiz = await Quiz.findById(req.params.id);
    if (!quiz) return res.status(404).json({ error: "Quiz not found" });

    const { answers } = req.body;
    const score = calculateScore(quiz.questions, answers);
    const interpretation = generateInterpretation(score);

    // Find recommended therapists
    const therapists = await getRecommendedTherapists(interpretation.level);

    const result = new QuizResult({
      user_id: req.userId,
      quiz_id: quiz._id,
      answers,
      score,
      interpretation,
      recommended_therapist_ids: therapists.map((t) => t._id),
    });
    await result.save();

    res.json({
      score,
      interpretation,
      recommended_therapists: therapists,
      result_id: result._id,
    });
  } catch (err) {
    console.error("Quiz submit error:", err);
    res.status(500).json({ error: "Failed to submit quiz" });
  }
});

// Get user's quiz results
router.get("/results/mine", authenticate, async (req, res) => {
  try {
    const results = await QuizResult.find({ user_id: req.userId })
      .populate("quiz_id", "title description")
      .sort({ taken_at: -1 });
    res.json(results);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch quiz results" });
  }
});

// Seed a sample quiz
router.post("/seed", async (req, res) => {
  try {
    const count = await Quiz.countDocuments();
    if (count > 0) return res.json({ message: "Quizzes already seeded" });

    const sampleQuiz = new Quiz({
      title: "Mental Health Check-In",
      description: "A quick assessment to understand your current mental well-being.",
      questions: [
        {
          text: "How would you rate your overall mood in the past 2 weeks?",
          type: "multiple_choice",
          options: [
            { text: "Very happy and content", score: 0 },
            { text: "Generally okay", score: 5 },
            { text: "Somewhat low or sad", score: 10 },
            { text: "Very low, hopeless", score: 20 },
          ],
        },
        {
          text: "How often have you felt anxious or worried?",
          type: "multiple_choice",
          options: [
            { text: "Rarely or never", score: 0 },
            { text: "A few times", score: 5 },
            { text: "Often", score: 10 },
            { text: "Almost every day", score: 20 },
          ],
        },
        {
          text: "How well have you been sleeping?",
          type: "multiple_choice",
          options: [
            { text: "Very well, 7-9 hours", score: 0 },
            { text: "Okay, some trouble", score: 5 },
            { text: "Poorly, frequent waking", score: 10 },
            { text: "Severe insomnia", score: 20 },
          ],
        },
        {
          text: "How connected do you feel to friends and family?",
          type: "multiple_choice",
          options: [
            { text: "Very connected", score: 0 },
            { text: "Somewhat connected", score: 5 },
            { text: "Isolated at times", score: 10 },
            { text: "Very isolated and lonely", score: 20 },
          ],
        },
        {
          text: "How would you rate your energy levels?",
          type: "multiple_choice",
          options: [
            { text: "High energy, motivated", score: 0 },
            { text: "Normal energy", score: 5 },
            { text: "Low energy, fatigued", score: 10 },
            { text: "Extremely exhausted", score: 20 },
          ],
        },
      ],
      active: true,
    });

    await sampleQuiz.save();
    res.json({ message: "Sample quiz seeded", quiz: sampleQuiz });
  } catch (err) {
    res.status(500).json({ error: "Failed to seed quiz" });
  }
});

// --- Helper functions ---

function calculateScore(questions, answers) {
  let total = 0;
  for (let i = 0; i < answers.length && i < questions.length; i++) {
    const q = questions[i];
    if (q.type === "multiple_choice") {
      const selectedIdx = answers[i];
      if (q.options[selectedIdx]) total += q.options[selectedIdx].score || 0;
    } else if (q.type === "scale") {
      total += parseInt(answers[i]) || 0;
    }
  }
  return total;
}

function generateInterpretation(score) {
  if (score <= 20) {
    return {
      level: "Low Risk",
      description: "You appear to be managing well overall. Consider maintaining healthy habits and staying connected with support systems.",
      recommendations: [
        "Continue with regular self-care practices",
        "Maintain social connections",
        "Consider preventive mental health resources",
      ],
    };
  } else if (score <= 40) {
    return {
      level: "Mild Concern",
      description: "You may be experiencing some stress or mild symptoms. It could be helpful to speak with a mental health professional.",
      recommendations: [
        "Consider counseling or therapy",
        "Practice stress management techniques",
        "Maintain regular sleep and exercise routines",
        "Connect with trusted friends or family",
      ],
    };
  } else if (score <= 60) {
    return {
      level: "Moderate Concern",
      description: "You appear to be experiencing significant stress or symptoms that may benefit from professional support.",
      recommendations: [
        "Strongly consider professional counseling",
        "Explore therapy options in your area",
        "Practice daily mindfulness or relaxation",
        "Consider support groups",
      ],
    };
  } else {
    return {
      level: "High Concern",
      description: "You may be experiencing significant mental health challenges. We strongly recommend seeking professional help.",
      recommendations: [
        "Seek immediate professional help",
        "Contact a mental health crisis line if needed",
        "Consider both therapy and psychiatric evaluation",
        "Reach out to emergency contacts for support",
      ],
    };
  }
}

async function getRecommendedTherapists(level) {
  const query = { rating: { $gte: 4.0 }, verified: true };
  const therapists = await Therapist.find(query).sort({ rating: -1 }).limit(5);
  return therapists;
}

export default router;
