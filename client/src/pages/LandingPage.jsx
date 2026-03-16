import React, { useEffect } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function LandingPage() {
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      navigate("/dashboard");
    }
  }, [user, navigate]);

  return (
    <div className="min-h-screen bg-zinc-950 text-white flex flex-col items-center justify-center text-center px-6 overflow-hidden">
      {/* Dynamic Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div 
          animate={{ scale: [1, 1.2, 1], rotate: [0, 90, 0] }}
          transition={{ duration: 20, repeat: Infinity }}
          className="absolute -top-40 -left-40 w-96 h-96 bg-red-600/10 rounded-full blur-[120px]" 
        />
        <motion.div 
          animate={{ scale: [1, 1.3, 1], rotate: [0, -90, 0] }}
          transition={{ duration: 25, repeat: Infinity }}
          className="absolute -bottom-40 -right-40 w-96 h-96 bg-blue-600/10 rounded-full blur-[120px]" 
        />
      </div>

      {/* Hero Section */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1 }}
        className="max-w-4xl relative z-10"
      >
        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-red-600 font-bold tracking-[0.4em] uppercase text-sm mb-6"
        >
          Your 24/7 Mental Health Ally
        </motion.p>
        <h1 className="text-6xl md:text-8xl font-black mb-8 tracking-tighter leading-[0.9]">
          STAY <span className="text-red-600">CONNECTED</span> <br/>
          TO YOUR <span className="italic underline decoration-red-600 decoration-8 underline-offset-4">PEACE</span>.
        </h1>
        <p className="mt-8 text-xl text-zinc-400 max-w-2xl mx-auto leading-relaxed">
          The ultimate companion for your mental wellness. Connect with specialists, track your journey, and get AI-powered support anytime, anywhere.
        </p>

        <div className="mt-12 flex flex-col sm:flex-row gap-6 justify-center">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="px-10 py-5 bg-red-600 text-white font-black text-lg rounded-md shadow-2xl shadow-red-600/30 hover:bg-red-700 transition-all uppercase tracking-widest"
            onClick={() => navigate("/auth")}
          >
            Get Started
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="px-10 py-5 bg-zinc-900 text-white font-black text-lg rounded-md border border-zinc-800 hover:bg-zinc-800 transition-all uppercase tracking-widest"
            onClick={() => navigate("/therapists")}
          >
            Browse Therapists
          </motion.button>
        </div>
      </motion.div>

      {/* Stats / Proof Section */}
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="mt-32 pt-16 border-t border-zinc-900 w-full max-w-5xl grid grid-cols-2 md:grid-cols-4 gap-8 relative z-10"
      >
        {[
          { label: "Providers", val: "50+" },
          { label: "Active Users", val: "2k+" },
          { label: "Success Rate", val: "94%" },
          { label: "Rating", val: "4.9/5" }
        ].map(stat => (
          <div key={stat.label}>
            <p className="text-4xl font-black text-white">{stat.val}</p>
            <p className="text-zinc-600 font-bold uppercase text-[10px] tracking-widest mt-1">{stat.label}</p>
          </div>
        ))}
      </motion.div>
    </div>
  );
}
