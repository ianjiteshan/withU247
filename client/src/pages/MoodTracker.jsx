import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useAuth } from "../context/AuthContext";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5005";

const MOOD_EMOJIS = ["😢", "😟", "😐", "🙂", "😊", "😄", "🤩", "💪", "🌟", "🔥"];

export default function MoodTracker() {
  const { token } = useAuth();
  const [tab, setTab] = useState("mood");
  const [moodEntries, setMoodEntries] = useState([]);
  const [journalEntries, setJournalEntries] = useState([]);
  const [stats, setStats] = useState(null);
  const [showMoodForm, setShowMoodForm] = useState(false);
  const [showJournalForm, setShowJournalForm] = useState(false);
  const [moodForm, setMoodForm] = useState({ mood_level: 5, energy_level: 5, stress_level: 5, sleep_hours: 7, notes: "" });
  const [journalForm, setJournalForm] = useState({ title: "", content: "", mood_at_time: 5 });

  const headers = { "Content-Type": "application/json", Authorization: `Bearer ${token}` };

  useEffect(() => { if (token) { fetchMoods(); fetchJournals(); fetchStats(); } }, [token]);

  const fetchMoods = async () => {
    try { const r = await fetch(`${API_BASE_URL}/api/mood`, { headers }); if (r.ok) setMoodEntries(await r.json()); } catch {}
  };
  const fetchJournals = async () => {
    try { const r = await fetch(`${API_BASE_URL}/api/journal`, { headers }); if (r.ok) setJournalEntries(await r.json()); } catch {}
  };
  const fetchStats = async () => {
    try { const r = await fetch(`${API_BASE_URL}/api/mood/stats`, { headers }); if (r.ok) setStats(await r.json()); } catch {}
  };

  const submitMood = async (e) => {
    e.preventDefault();
    await fetch(`${API_BASE_URL}/api/mood`, { method: "POST", headers, body: JSON.stringify(moodForm) });
    setShowMoodForm(false);
    setMoodForm({ mood_level: 5, energy_level: 5, stress_level: 5, sleep_hours: 7, notes: "" });
    fetchMoods(); fetchStats();
  };

  const submitJournal = async (e) => {
    e.preventDefault();
    await fetch(`${API_BASE_URL}/api/journal`, { method: "POST", headers, body: JSON.stringify(journalForm) });
    setShowJournalForm(false);
    setJournalForm({ title: "", content: "", mood_at_time: 5 });
    fetchJournals();
  };

  const deleteJournal = async (id) => {
    await fetch(`${API_BASE_URL}/api/journal/${id}`, { method: "DELETE", headers });
    fetchJournals();
  };

  if (!token) return <div className="min-h-screen bg-zinc-950 flex items-center justify-center text-zinc-400 pt-20">Please log in to track your mood.</div>;

  return (
    <div className="min-h-screen bg-zinc-950 text-white pt-24 px-4 md:px-12 pb-20 font-sans">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Mood & Journal</h1>

        {/* Stats & Trends Section */}
        {stats && stats.total_entries > 0 && (
          <div className="mb-8 space-y-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: "Avg Mood", value: stats.average_mood, color: "text-green-400" },
                { label: "Avg Energy", value: stats.average_energy, color: "text-blue-400" },
                { label: "Avg Stress", value: stats.average_stress, color: "text-red-400" },
                { label: "Avg Sleep", value: `${stats.average_sleep}h`, color: "text-purple-400" },
              ].map((s) => (
                <div key={s.label} className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 text-center">
                  <p className="text-zinc-500 text-[10px] uppercase font-bold tracking-widest">{s.label}</p>
                  <p className={`text-2xl font-bold mt-1 ${s.color}`}>{s.value}</p>
                </div>
              ))}
            </div>

            {/* Simple Mood Trend Visualization */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
              <h3 className="text-sm font-bold text-zinc-500 mb-6 uppercase tracking-wider">Mood Trends (Recent)</h3>
              <div className="flex items-end justify-between h-32 gap-1 px-2">
                {moodEntries.slice(0, 14).reverse().map((e, i) => (
                  <div key={e._id || i} className="flex-1 flex flex-col items-center group relative">
                    <div 
                      className="w-full bg-red-600 rounded-t-sm transition-all group-hover:bg-red-500 min-h-[4px]" 
                      style={{ height: `${(e.mood_level / 10) * 100}%`, opacity: 0.3 + (e.mood_level / 10) * 0.7 }}
                    />
                    <div className="absolute -top-10 scale-0 group-hover:scale-100 transition-transform bg-white text-black text-[10px] px-2 py-1 rounded font-bold whitespace-nowrap z-10 pointer-events-none">
                      Level: {e.mood_level} ({new Date(e.date_recorded).toLocaleDateString()})
                    </div>
                  </div>
                ))}
                {moodEntries.length === 0 && <div className="w-full flex items-center justify-center text-zinc-600 text-sm italic">Log more moods to see trends...</div>}
              </div>
              <div className="flex justify-between mt-4 text-[10px] text-zinc-600 uppercase font-bold">
                <span>Past</span>
                <span>Today</span>
              </div>
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-4 mb-8">
          {["mood", "journal"].map((t) => (
            <button key={t} onClick={() => setTab(t)}
              className={`px-8 py-2.5 rounded-full font-bold text-xs uppercase tracking-widest transition-all ${tab === t ? "bg-red-600 text-white shadow-lg shadow-red-600/20" : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700 hover:text-white"}`}>
              {t === "mood" ? "🎭 Mood" : "📓 Journal"}
            </button>
          ))}
        </div>


        {tab === "mood" && (
          <div>
            <button onClick={() => setShowMoodForm(!showMoodForm)} className="mb-6 px-5 py-2 bg-red-600 hover:bg-red-700 rounded-lg font-medium transition-colors">
              + Log Mood
            </button>

            {showMoodForm && (
              <motion.form initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} onSubmit={submitMood}
                className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 mb-6 space-y-4">
                {[{ label: "Mood Level", field: "mood_level" }, { label: "Energy", field: "energy_level" }, { label: "Stress", field: "stress_level" }].map(({ label, field }) => (
                  <div key={field}>
                    <label className="text-zinc-400 text-sm block mb-1">{label}: {moodForm[field]} {MOOD_EMOJIS[moodForm[field] - 1]}</label>
                    <input type="range" min="1" max="10" value={moodForm[field]} onChange={(e) => setMoodForm({ ...moodForm, [field]: parseInt(e.target.value) })}
                      className="w-full accent-red-500" />
                  </div>
                ))}
                <div>
                  <label className="text-zinc-400 text-sm block mb-1">Sleep Hours: {moodForm.sleep_hours}</label>
                  <input type="range" min="0" max="12" step="0.5" value={moodForm.sleep_hours}
                    onChange={(e) => setMoodForm({ ...moodForm, sleep_hours: parseFloat(e.target.value) })} className="w-full accent-red-500" />
                </div>
                <textarea placeholder="Notes..." value={moodForm.notes} onChange={(e) => setMoodForm({ ...moodForm, notes: e.target.value })}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-3 text-white placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-red-500" rows={2} />
                <button type="submit" className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-6 rounded-lg transition-colors">Save Mood</button>
              </motion.form>
            )}

            <div className="space-y-3">
              {moodEntries.map((e) => (
                <div key={e._id} className="bg-zinc-900 border border-zinc-800 rounded-lg p-4 flex items-center gap-4">
                  <span className="text-3xl">{MOOD_EMOJIS[(e.mood_level || 5) - 1]}</span>
                  <div className="flex-1">
                    <div className="flex gap-4 text-sm">
                      <span className="text-green-400">Mood: {e.mood_level}</span>
                      <span className="text-blue-400">Energy: {e.energy_level}</span>
                      <span className="text-red-400">Stress: {e.stress_level}</span>
                      <span className="text-purple-400">Sleep: {e.sleep_hours}h</span>
                    </div>
                    {e.notes && <p className="text-zinc-400 text-xs mt-1">{e.notes}</p>}
                  </div>
                  <span className="text-zinc-600 text-xs">{new Date(e.date_recorded).toLocaleDateString()}</span>
                </div>
              ))}
              {moodEntries.length === 0 && <p className="text-zinc-500 text-center py-8">No mood entries yet. Start logging!</p>}
            </div>
          </div>
        )}

        {tab === "journal" && (
          <div>
            <button onClick={() => setShowJournalForm(!showJournalForm)} className="mb-6 px-5 py-2 bg-red-600 hover:bg-red-700 rounded-lg font-medium transition-colors">
              + New Entry
            </button>

            {showJournalForm && (
              <motion.form initial={{ opacity: 0 }} animate={{ opacity: 1 }} onSubmit={submitJournal}
                className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 mb-6 space-y-4">
                <input type="text" placeholder="Title" value={journalForm.title}
                  onChange={(e) => setJournalForm({ ...journalForm, title: e.target.value })} required
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-3 text-white placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-red-500" />
                <textarea placeholder="Write your thoughts..." value={journalForm.content}
                  onChange={(e) => setJournalForm({ ...journalForm, content: e.target.value })} required rows={5}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-3 text-white placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-red-500" />
                <button type="submit" className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-6 rounded-lg transition-colors">Save Entry</button>
              </motion.form>
            )}

            <div className="space-y-3">
              {journalEntries.map((e) => (
                <div key={e._id} className="bg-zinc-900 border border-zinc-800 rounded-lg p-4">
                  <div className="flex justify-between items-start">
                    <h3 className="font-bold text-lg">{e.title}</h3>
                    <div className="flex items-center gap-2">
                      <span className="text-zinc-600 text-xs">{new Date(e.date_written).toLocaleDateString()}</span>
                      <button onClick={() => deleteJournal(e._id)} className="text-red-500 text-xs hover:text-red-400">✕</button>
                    </div>
                  </div>
                  <p className="text-zinc-400 text-sm mt-2 line-clamp-3">{e.content}</p>
                </div>
              ))}
              {journalEntries.length === 0 && <p className="text-zinc-500 text-center py-8">No journal entries yet. Start writing!</p>}
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
}
