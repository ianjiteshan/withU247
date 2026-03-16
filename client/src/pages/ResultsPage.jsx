import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import { motion } from "framer-motion";
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix for Leaflet default icon issues in React
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5005";

export default function ResultsPage() {
  const { state } = useLocation();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchResults = async () => {
      try {
        setLoading(true);
        setError("");
        const res = await axios.post(`${API_BASE_URL}/api/mapping`, {
          symptom: state?.symptom,
          lat: state?.lat,
          lng: state?.lng,
        });
        setData(res.data);
      } catch (err) {
        console.error("❌ Error fetching results:", err);
        setError("Failed to load clinical insights. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    if (state?.symptom) {
      fetchResults();
    } else {
      setLoading(false);
      setError("No specific symptoms provided for analysis.");
    }
  }, [state, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center space-y-4 pt-20">
        <div className="w-16 h-16 border-4 border-red-600 border-t-transparent rounded-full animate-spin" />
        <p className="text-zinc-500 font-bold uppercase tracking-widest text-[10px] animate-pulse">Analyzing Clinical Data...</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center p-6 text-center pt-20">
        <p className="text-red-500 font-bold mb-4">{error || "No data available."}</p>
        <button onClick={() => navigate("/symptom")} className="bg-red-600 px-8 py-3 rounded font-black uppercase text-[10px] tracking-widest">Start New Assessment</button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-white pt-32 pb-20 px-4 md:px-12 font-sans overflow-x-hidden">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-4xl mx-auto space-y-16"
      >
        {/* Header Section */}
        <div className="text-center relative">
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-red-600 font-black text-[10px] uppercase tracking-[0.6em] mb-4"
          >
            WithU247 Diagnostics
          </motion.p>
          <h1 className="text-5xl md:text-7xl font-black tracking-tighter mb-6 italic uppercase leading-none">
            {data.doctorSpecialty} <span className="text-red-600">Report</span>
          </h1>
          <div className="inline-block bg-zinc-900/50 backdrop-blur-xl px-6 py-2 rounded-full border border-zinc-800">
            <p className="text-zinc-500 text-xs font-bold tracking-tight">Primary Symptom: <span className="text-zinc-300 italic">"{data.symptom}"</span></p>
          </div>
        </div>

        {/* Clinical Insights Card */}
        <section className="bg-zinc-900 border border-zinc-800 rounded-3xl p-10 shadow-2xl relative group overflow-hidden">
          <div className="absolute top-0 right-0 p-8 opacity-5 transition-opacity group-hover:opacity-10">
            <svg width="120" height="120" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" /></svg>
          </div>
          <h2 className="text-[10px] font-black uppercase tracking-[0.4em] text-red-600 mb-8 flex items-center gap-4">
            Analysis Summary
            <div className="h-[1px] flex-1 bg-red-600/20" />
          </h2>
          <p className="text-zinc-300 leading-relaxed text-xl md:text-2xl font-light italic serif selection:bg-red-600/30">
            {data.pubmedSummary}
          </p>
        </section>

        {/* Local Support & Recommendation Grid */}
        <div className="grid md:grid-cols-5 gap-8">
          {/* Facilities Column */}
          <section className="md:col-span-3 space-y-8">
            <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-500 flex items-center gap-4">
              Local Clinical Facilities
              <div className="h-[1px] flex-1 bg-zinc-800" />
            </h2>

            {/* Leaflet Map Integration */}
            {data.hospitals?.length > 0 && state?.lat && state?.lng && (
              <div className="h-[300px] w-full rounded-2xl overflow-hidden border border-zinc-800 shadow-2xl mb-8 z-0">
                <MapContainer center={[state.lat, state.lng]} zoom={13} style={{ height: '100%', width: '100%' }}>
                  <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                  />
                  {data.hospitals.map((h, idx) => (
                    <Marker key={idx} position={[h.lat, h.lng]}>
                      <Popup>
                        <div className="text-black">
                          <strong className="block">{h.name}</strong>
                          <span className="text-xs">{h.address}</span>
                        </div>
                      </Popup>
                    </Marker>
                  ))}
                  <Marker position={[state.lat, state.lng]}>
                    <Popup>
                      <div className="text-black font-bold italic">Your Location</div>
                    </Popup>
                  </Marker>
                </MapContainer>
              </div>
            )}

            <div className="space-y-4">
              {data.hospitals?.length > 0 ? (
                data.hospitals.map((h, idx) => (
                  <motion.div
                    whileHover={{ x: 10, backgroundColor: "rgba(24, 24, 27, 0.8)" }}
                    key={idx}
                    className="p-6 bg-zinc-900 border border-zinc-800 rounded-2xl transition-all"
                  >
                    <div className="flex justify-between items-center mb-2">
                      <h4 className="font-black text-white uppercase text-xs tracking-wider">{h.name}</h4>
                      <div className="flex items-center gap-1 text-red-600 text-xs font-bold">
                        <span>📍</span>
                        <span>{h.rating || "OSM"}</span>
                      </div>
                    </div>
                    <p className="text-zinc-500 text-[10px] font-bold uppercase tracking-widest">{h.address}</p>
                  </motion.div>
                ))
              ) : (
                <div className="p-10 border-2 border-dashed border-zinc-800 rounded-3xl text-center">
                  <p className="text-zinc-700 font-black uppercase tracking-[0.2em] text-[10px]">No matches in your vicinity</p>
                </div>
              )}
            </div>
          </section>

          {/* Call to Action Column */}
          <section className="md:col-span-2 flex flex-col gap-6">
            <div className="bg-gradient-to-br from-red-600/20 via-zinc-900 to-zinc-900 border border-red-600/20 rounded-3xl p-10 text-center flex-1 flex flex-col justify-center">
              <h3 className="text-2xl font-black mb-6 uppercase tracking-tighter leading-none italic">
                Need <span className="text-red-600 italic">Priority</span> <br /> Consult?
              </h3>
              <p className="text-zinc-500 text-xs font-bold mb-10 leading-relaxed uppercase tracking-widest">
                Immediate access to AI health specialists or community therapists.
              </p>
              <div className="space-y-4">
                <button
                  onClick={() => navigate("/chat")}
                  className="w-full bg-white text-black font-black py-4 rounded-lg uppercase text-[10px] tracking-[0.2em] hover:bg-zinc-200 transition-all shadow-xl"
                >
                  Start AI Chat
                </button>
                <button
                  onClick={() => navigate("/therapists")}
                  className="w-full bg-red-600 text-white font-black py-4 rounded-lg uppercase text-[10px] tracking-[0.2em] hover:bg-red-700 transition-all shadow-xl shadow-red-600/20 border border-red-400/20"
                >
                  Browse Doctors
                </button>
              </div>
            </div>
          </section>
        </div>

        {/* Footer Navigation */}
        <div className="pt-20 text-center border-t border-zinc-900">
          <motion.button
            whileHover={{ letterSpacing: "0.6em" }}
            onClick={() => navigate("/symptom")}
            className="text-zinc-700 font-black uppercase text-[10px] tracking-[0.4em] hover:text-white transition-all"
          >
            ← New Diagnostic Session
          </motion.button>
        </div>
      </motion.div>
    </div>
  );
}
