import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5005";

export default function Dashboard() {
  const { user, token } = useAuth();
  const navigate = useNavigate();
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (token) {
      fetchSummary();
    }
  }, [token]);

  const fetchSummary = async () => {
    try {
      const r = await fetch(`${API_BASE_URL}/api/dashboard/summary`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (r.ok) {
        setSummary(await r.json());
      }
    } catch (err) {
      console.error("Failed to fetch dashboard summary", err);
    } finally {
      setLoading(false);
    }
  };

  if (!token) return <div className="min-h-screen bg-zinc-950 flex items-center justify-center text-zinc-400">Please log in.</div>;
  if (loading) return <div className="min-h-screen bg-zinc-950 flex items-center justify-center text-red-600 font-bold text-2xl animate-pulse">LOADING...</div>;

  return (
    <div className="min-h-screen bg-zinc-950 text-white font-sans overflow-x-hidden">
      {/* Netflix Hero */}
      <section className="relative h-[60vh] flex items-center px-6 md:px-12 overflow-hidden">
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-r from-zinc-950 via-zinc-950/60 to-transparent z-10" />
          <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-transparent to-zinc-950/20 z-10" />
          {/* Animated Background Placeholder */}
          <div className="w-full h-full bg-zinc-900 flex items-center justify-center text-[15rem] opacity-10 font-black">
            WITHU<span className="text-red-700">247</span>
          </div>
        </div>

        <motion.div 
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          className="relative z-20 max-w-2xl"
        >
          <p className="text-red-600 font-black text-xs uppercase tracking-[0.3em] mb-4">Personalized Support Hub</p>
          <h1 className="text-5xl md:text-7xl font-extrabold mb-6 tracking-tighter">
            Welcome back, <br/>
            <span className="text-red-600 uppercase italic underline decoration-4 underline-offset-8 decoration-red-600/30">
              {user?.username}
            </span>
          </h1>
          <p className="text-zinc-400 text-lg mb-8 max-w-lg leading-relaxed">
            Your journey matters. Check your latest trends, update your journal, or connect with a specialist right now.
          </p>
          <div className="flex gap-4">
            <button 
              onClick={() => navigate("/chat")}
              className="bg-white text-black font-black px-8 py-3 rounded-md hover:bg-zinc-200 transition-colors flex items-center gap-2"
            >
              <span>▶</span> Talk to AI
            </button>
            <button 
              onClick={() => navigate("/therapists")}
              className="bg-zinc-800/80 text-white font-black px-8 py-3 rounded-md hover:bg-zinc-700 backdrop-blur-md transition-colors flex items-center gap-2"
            >
              <span>ⓘ</span> Find Help
            </button>
          </div>
        </motion.div>
      </section>

      {/* Stats Quick Look */}
      <div className="relative z-30 -mt-10 px-6 md:px-12 grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Last Mood", value: summary?.mood?.avg_mood?.toFixed(1) || "5.0", color: "text-green-500" },
          { label: "Stress Level", value: summary?.mood?.avg_stress?.toFixed(1) || "3.0", color: "text-red-500" },
          { label: "Journal Status", value: summary?.journal ? "Active" : "None", color: "text-blue-500" },
          { label: "Quiz Status", value: summary?.quiz?.risk_level || "Not Ready", color: "text-purple-500" }
        ].map(s => (
          <div key={s.label} className="bg-zinc-900/90 backdrop-blur-xl border border-zinc-800 p-4 rounded-lg shadow-2xl">
            <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">{s.label}</p>
            <p className={`text-2xl font-black mt-1 ${s.color}`}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Sections (Netflix Rows) */}
      <main className="px-6 md:px-12 py-16 space-y-20">
        
        {/* Recommendation Row */}
        <section>
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
            Recommended <span className="text-red-600">Specialists</span>
            <div className="h-[2px] flex-1 bg-zinc-800 ml-4 opacity-50" />
          </h2>
          <div className="flex gap-4 overflow-x-auto pb-6 scrollbar-hide">
            {summary?.therapists?.map(t => (
              <motion.div 
                key={t._id}
                whileHover={{ scale: 1.05 }}
                className="min-w-[280px] bg-zinc-900 rounded-lg overflow-hidden border border-zinc-800 group"
              >
                <div className="h-40 bg-zinc-800 flex items-center justify-center relative overflow-hidden">
                  <span className="text-6xl font-black text-zinc-700 group-hover:scale-110 transition-transform duration-500">{t.name[0]}</span>
                  <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 to-transparent opacity-60" />
                </div>
                <div className="p-4">
                  <h3 className="font-bold text-lg">{t.name}</h3>
                  <p className="text-zinc-500 text-xs mb-3 italic">{t.specialization}</p>
                  <div className="flex justify-between items-center">
                    <span className="text-red-600 text-sm font-black">★ {t.rating}</span>
                    <Link to="/therapists" className="text-[10px] font-bold uppercase bg-zinc-800 px-3 py-1 rounded hover:bg-red-600 transition-colors">View Profile</Link>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Latest Activity Grid */}
        <div className="grid md:grid-cols-2 gap-8">
          {/* Journal Preview */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-8 hover:border-red-600/30 transition-all group">
            <div className="flex justify-between items-start mb-6">
              <h2 className="text-xl font-bold uppercase tracking-tight">Latest <span className="text-red-600 italic">Journal</span></h2>
              <span className="text-[10px] text-zinc-600 font-bold uppercase">{summary?.journal ? new Date(summary.journal.date_written).toLocaleDateString() : 'N/A'}</span>
            </div>
            {summary?.journal ? (
              <div className="space-y-4">
                <h3 className="text-lg font-bold text-zinc-300">{summary.journal.title}</h3>
                <p className="text-zinc-500 text-sm line-clamp-3 leading-relaxed">{summary.journal.content}</p>
                <button onClick={() => navigate("/mood")} className="text-xs font-black text-red-600 uppercase tracking-widest hover:text-red-400 transition-colors">Read More →</button>
              </div>
            ) : (
              <div className="py-10 text-center text-zinc-700 uppercase font-black tracking-widest border-2 border-dashed border-zinc-800 rounded-xl">
                No entries yet
              </div>
            )}
          </div>

          {/* Quick Quiz */}
          <div className="bg-gradient-to-br from-red-900/10 to-zinc-900 border border-zinc-800 rounded-xl p-8 flex flex-col justify-between">
            <div>
              <h2 className="text-xl font-bold uppercase tracking-tight mb-4">Quiz <span className="text-red-600">Status</span></h2>
              <p className="text-zinc-400 text-sm leading-relaxed">
                Consistent self-assessment helps in early detection. Take our latest behavioral health quiz to see where you stand.
              </p>
            </div>
            <div className="mt-8 flex items-center justify-between border-t border-zinc-800 pt-6">
              <div>
                <p className="text-[10px] text-zinc-600 font-bold uppercase tracking-widest">Recommended Frequency</p>
                <p className="text-white font-bold">Bi-weekly Check</p>
              </div>
              <button 
                onClick={() => navigate("/quiz")}
                className="bg-red-600 text-white font-black px-6 py-2 rounded shadow-lg shadow-red-600/30 hover:bg-red-700 transition-all uppercase text-xs"
              >
                Start Quiz
              </button>
            </div>
          </div>
        </div>
      </main>

      <footer className="bg-zinc-950 border-t border-zinc-900 py-12 text-center">
        <p className="text-zinc-700 text-[10px] uppercase font-bold tracking-[0.5em]">WithU247 Engineering Layer • Local Node 5173</p>
      </footer>
    </div>
  );
}
