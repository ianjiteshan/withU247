import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import axios from "axios";

export default function SymptomInput() {
  const [symptom, setSymptom] = useState("");
  const [location, setLocation] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5005";

  const detectLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((pos) => {
        setLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        alert("Location pinned! We'll show results near you.");
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!symptom) return;
    setLoading(true);

    try {
      const response = await axios.post(`${API_BASE_URL}/api/mapping`, {
        symptom,
        lat: location?.lat,
        lng: location?.lng,
      });
      navigate("/results", { state: { result: response.data } });
    } catch (err) {
      console.error("Error fetching results:", err);
      alert("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-white flex items-center justify-center pt-16 px-4">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-xl w-full"
      >
        <div className="text-center mb-10">
          <h1 className="text-4xl md:text-5xl font-extrabold text-red-600 mb-4 tracking-tight uppercase">Wellness Check</h1>
          <p className="text-zinc-500 text-lg">Tell us how you're feeling, and we'll connect you with the right support.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="relative group">
            <textarea
              placeholder="e.g. I've been feeling anxious lately, having trouble sleeping, or feeling overwhelmed..."
              value={symptom}
              onChange={(e) => setSymptom(e.target.value)}
              className="w-full bg-zinc-900 border border-zinc-800 rounded-2xl px-6 py-8 text-xl text-white placeholder-zinc-700 focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-transparent transition-all min-h-[200px] resize-none shadow-2xl"
            />
            <div className="absolute inset-0 rounded-2xl bg-red-600/5 opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity" />
          </div>

          <div className="flex flex-col md:flex-row gap-4">
            <button
              type="button"
              onClick={detectLocation}
              className="flex-1 bg-zinc-800 hover:bg-zinc-700 text-white font-bold py-4 rounded-xl transition-all border border-zinc-700 flex items-center justify-center gap-2"
            >
              <span className="text-xl">📍</span> 
              {location ? "Location Pinned" : "Find Support Near Me"}
            </button>

            <button 
              type="submit" 
              disabled={loading || !symptom}
              className={`flex-1 font-extrabold py-4 rounded-xl text-xl shadow-lg transition-all active:scale-95 ${
                loading || !symptom 
                ? "bg-zinc-800 text-zinc-600 cursor-not-allowed" 
                : "bg-red-600 hover:bg-red-700 text-white"
              }`}
            >
              {loading ? "Checking..." : "Get Help Now"}
            </button>
          </div>

          <div className="mt-8 grid grid-cols-2 md:grid-cols-3 gap-3">
            {["Anxiety", "Sleep Issues", "Stress", "Depression", "Relationships", "Work Pressure"].map(tag => (
              <button
                key={tag}
                type="button"
                onClick={() => setSymptom(prev => prev ? `${prev}, ${tag}` : tag)}
                className="bg-zinc-900/50 border border-zinc-800 hover:border-zinc-600 py-2 px-3 rounded-lg text-xs font-bold text-zinc-500 uppercase tracking-widest transition-all"
              >
                + {tag}
              </button>
            ))}
          </div>
        </form>
      </motion.div>
    </div>
  );
}

