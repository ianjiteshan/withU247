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
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="h-[400px] w-full rounded-2xl overflow-hidden border border-zinc-800 shadow-[0_0_50px_rgba(220,38,38,0.1)] mb-12 z-0"
              >
                <MapContainer center={[state.lat, state.lng]} zoom={13} style={{ height: '100%', width: '100%' }}>
                  <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                  />
                  {data.hospitals.map((h, idx) => (
                    <Marker key={idx} position={[h.lat, h.lng]}>
                      <Popup>
                        <div className="p-2">
                          <strong className="text-zinc-900 block text-sm mb-1">{h.name}</strong>
                          <span className="text-zinc-500 text-xs leading-tight">{h.address}</span>
                        </div>
                      </Popup>
                    </Marker>
                  ))}
                  <Marker position={[state.lat, state.lng]} icon={L.divIcon({
                    className: 'custom-div-icon',
                    html: `<div style="background-color: #dc2626; width: 12px; height: 12px; border-radius: 50%; border: 2px solid white; box-shadow: 0 0 10px rgba(0,0,0,0.5);"></div>`,
                    iconSize: [12, 12],
                    iconAnchor: [6, 6]
                  })}>
                    <Popup>
                      <div className="text-zinc-900 font-bold italic text-sm">Your Current Location</div>
                    </Popup>
                  </Marker>
                </MapContainer>
              </motion.div>
            )}

            <div className="grid gap-4">
              {data.hospitals?.length > 0 ? (
                data.hospitals.map((h, idx) => (
                  <motion.div 
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    whileHover={{ scale: 1.02, backgroundColor: "rgba(39, 39, 42, 0.5)" }}
                    key={idx} 
                    className="group p-8 bg-zinc-900/40 backdrop-blur-md border border-zinc-800 rounded-3xl transition-all cursor-pointer relative overflow-hidden"
                  >
                    <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity">
                      <span className="text-red-600 text-xl">→</span>
                    </div>
                    <div className="flex justify-between items-start mb-4">
                      <div className="space-y-1">
                        <h4 className="font-black text-white text-lg tracking-tight group-hover:text-red-600 transition-colors uppercase italic">{h.name}</h4>
                        <p className="text-zinc-500 text-[10px] font-black uppercase tracking-[0.2em]">{h.address}</p>
                      </div>
                      <div className="flex items-center gap-2 bg-zinc-800/50 px-3 py-1 rounded-full border border-zinc-700/50">
                        <span className="text-red-600 text-xs">📍</span>
                        <span className="text-zinc-300 text-[10px] font-black uppercase tracking-widest">{h.id ? `ID: ${h.id.toString().slice(0,6)}` : "CLINIC"}</span>
                      </div>
                    </div>
                    <div className="h-[1px] w-full bg-zinc-800/50 mb-4" />
                    <div className="flex gap-4">
                      <span className="text-[9px] font-black text-zinc-600 uppercase tracking-widest bg-zinc-950 px-2 py-1 rounded">Emergency</span>
                      <span className="text-[9px] font-black text-zinc-600 uppercase tracking-widest bg-zinc-950 px-2 py-1 rounded">Verified</span>
                    </div>
                  </motion.div>
                ))
              ) : (
                <div className="p-20 border-2 border-dashed border-zinc-800 rounded-[40px] text-center bg-zinc-900/10">
                  <div className="text-4xl mb-6 opacity-20">🏥</div>
                  <p className="text-zinc-700 font-black uppercase tracking-[0.4em] text-xs">Scanning Local Networks... No Matches</p>
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
