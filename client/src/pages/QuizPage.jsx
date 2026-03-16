import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../context/AuthContext";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5005";

export default function QuizPage() {
  const { token } = useAuth();
  const [quizzes, setQuizzes] = useState([]);
  const [activeQuiz, setActiveQuiz] = useState(null);
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [pastResults, setPastResults] = useState([]);

  const headers = { "Content-Type": "application/json", Authorization: `Bearer ${token}` };

  useEffect(() => { fetchQuizzes(); if (token) fetchPastResults(); }, [token]);

  const fetchQuizzes = async () => {
    try { const r = await fetch(`${API_BASE_URL}/api/quizzes`); if (r.ok) setQuizzes(await r.json()); } catch {}
  };
  const fetchPastResults = async () => {
    try { const r = await fetch(`${API_BASE_URL}/api/quizzes/results/mine`, { headers }); if (r.ok) setPastResults(await r.json()); } catch {}
  };

  const startQuiz = (quiz) => {
    setActiveQuiz(quiz);
    setCurrentQ(0);
    setAnswers([]);
    setResult(null);
  };

  const selectAnswer = (idx) => {
    const newAnswers = [...answers, idx];
    setAnswers(newAnswers);
    if (currentQ + 1 < activeQuiz.questions.length) {
      setCurrentQ(currentQ + 1);
    } else {
      submitQuiz(newAnswers);
    }
  };

  const submitQuiz = async (finalAnswers) => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/quizzes/${activeQuiz._id}/submit`, {
        method: "POST", headers, body: JSON.stringify({ answers: finalAnswers }),
      });
      if (res.ok) {
        setResult(await res.json());
        fetchPastResults();
      }
    } catch {} finally {
      setLoading(false);
    }
  };

  const levelColor = (level) => {
    if (level === "Low Risk") return "text-green-400";
    if (level === "Mild Concern") return "text-yellow-400";
    if (level === "Moderate Concern") return "text-orange-400";
    return "text-red-400";
  };

  if (!token) return <div className="min-h-screen bg-zinc-950 flex items-center justify-center text-zinc-400 pt-20">Please log in to take quizzes.</div>;

  return (
    <div className="min-h-screen bg-zinc-950 text-white pt-24 px-4 md:px-12 pb-20 font-sans">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-3xl mx-auto">

        {/* Result Screen */}
        {result && (
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-zinc-900 border border-zinc-800 rounded-2xl p-8 text-center">
            <h2 className="text-2xl font-bold mb-2">Your Results</h2>
            <p className="text-5xl font-extrabold my-4">{result.score}</p>
            <p className={`text-xl font-bold mb-4 ${levelColor(result.interpretation.level)}`}>{result.interpretation.level}</p>
            <p className="text-zinc-400 mb-6">{result.interpretation.description}</p>
            <div className="text-left mb-6">
              <h3 className="font-bold mb-2 text-red-500">Recommendations:</h3>
              <ul className="space-y-1">
                {result.interpretation.recommendations.map((r, i) => (
                  <li key={i} className="text-zinc-300 text-sm flex items-start gap-2">
                    <span className="text-red-500">•</span> {r}
                  </li>
                ))}
              </ul>
            </div>
            {result.recommended_therapists?.length > 0 && (
              <div className="text-left mb-6">
                <h3 className="font-bold mb-2 text-red-500">Recommended Therapists:</h3>
                {result.recommended_therapists.map((t) => (
                  <div key={t._id} className="bg-zinc-800 rounded-lg p-3 mb-2 flex justify-between items-center">
                    <div>
                      <p className="font-bold">{t.name}</p>
                      <p className="text-zinc-400 text-xs">{t.specializations?.join(", ")}</p>
                    </div>
                    <span className="text-green-400 font-bold">{t.rating} ★</span>
                  </div>
                ))}
              </div>
            )}
            <button onClick={() => { setActiveQuiz(null); setResult(null); }}
              className="bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-8 rounded-lg transition-colors">
              Back to Quizzes
            </button>
          </motion.div>
        )}

        {/* Active Quiz */}
        {activeQuiz && !result && (
          <div>
            <h2 className="text-2xl font-bold mb-2">{activeQuiz.title}</h2>
            <div className="w-full bg-zinc-800 rounded-full h-2 mb-6">
              <div className="bg-red-600 h-2 rounded-full transition-all" style={{ width: `${((currentQ + 1) / activeQuiz.questions.length) * 100}%` }} />
            </div>
            <p className="text-zinc-400 text-sm mb-2">Question {currentQ + 1} of {activeQuiz.questions.length}</p>

            <AnimatePresence mode="wait">
              <motion.div key={currentQ} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
                className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
                <h3 className="text-xl font-bold mb-6">{activeQuiz.questions[currentQ].text}</h3>
                <div className="space-y-3">
                  {activeQuiz.questions[currentQ].options.map((opt, i) => (
                    <button key={i} onClick={() => selectAnswer(i)} disabled={loading}
                      className="w-full text-left bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 hover:border-red-500 rounded-lg px-5 py-4 transition-all text-sm">
                      {opt.text}
                    </button>
                  ))}
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        )}

        {/* Quiz List */}
        {!activeQuiz && !result && (
          <div>
            <h1 className="text-3xl font-bold mb-6">Mental Health Assessments</h1>

            {quizzes.length === 0 ? (
              <p className="text-zinc-500 text-center py-8">No quizzes available yet.</p>
            ) : (
              <div className="space-y-4 mb-12">
                {quizzes.map((q) => (
                  <div key={q._id} className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 flex justify-between items-center">
                    <div>
                      <h3 className="text-xl font-bold">{q.title}</h3>
                      <p className="text-zinc-400 text-sm mt-1">{q.description}</p>
                      <p className="text-zinc-600 text-xs mt-2">{q.questions.length} questions</p>
                    </div>
                    <button onClick={() => startQuiz(q)}
                      className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-6 rounded-lg transition-colors shrink-0">
                      Take Quiz
                    </button>
                  </div>
                ))}
              </div>
            )}

            {pastResults.length > 0 && (
              <div>
                <h2 className="text-xl font-bold mb-4">Past Results</h2>
                <div className="space-y-3">
                  {pastResults.map((r) => (
                    <div key={r._id} className="bg-zinc-900 border border-zinc-800 rounded-lg p-4 flex justify-between items-center">
                      <div>
                        <p className="font-bold">{r.quiz_id?.title || "Quiz"}</p>
                        <p className="text-zinc-500 text-xs">{new Date(r.taken_at).toLocaleDateString()}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xl font-bold">{r.score}</p>
                        <p className={`text-xs font-bold ${levelColor(r.interpretation?.level)}`}>{r.interpretation?.level}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </motion.div>
    </div>
  );
}
