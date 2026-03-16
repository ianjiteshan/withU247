import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "../context/AuthContext";
import { motion } from "framer-motion";

export default function Navbar() {
  const { user, logout } = useAuth();

  return (
    <header className="bg-zinc-950/80 backdrop-blur-md border-b border-zinc-800 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        <Link to={user ? "/dashboard" : "/"} className="text-2xl font-black tracking-tighter text-white">
          WITHU<span className="text-red-600">247</span>
        </Link>

        <nav className="hidden md:flex gap-8 text-zinc-400 font-bold uppercase text-[10px] tracking-[0.2em]">
          <Link to={user ? "/dashboard" : "/"} className="hover:text-red-600 transition-colors">Home</Link>
          <Link to="/therapists" className="hover:text-red-600 transition-colors">Therapists</Link>
          <Link to="/chat" className="hover:text-red-600 transition-colors">AI Chat</Link>
          <Link to="/mood" className="hover:text-red-600 transition-colors">Mood</Link>
          <Link to="/quiz" className="hover:text-red-600 transition-colors">Quiz</Link>
        </nav>

        <div className="flex items-center gap-6">
          {user ? (
            <>
              <motion.div whileHover={{ scale: 1.05 }}>
                <Link to="/profile" className="text-[10px] font-black uppercase text-red-600 tracking-widest bg-red-600/10 px-3 py-1 rounded border border-red-600/20">
                  {user.username}
                </Link>
              </motion.div>
              <button 
                onClick={logout} 
                className="text-[10px] font-black uppercase text-zinc-500 hover:text-white transition-colors tracking-widest"
              >
                Sign Out
              </button>
            </>
          ) : (
            <Link 
              to="/auth" 
              className="bg-red-600 text-white text-[10px] font-black uppercase px-6 py-2 rounded shadow-lg shadow-red-600/20 hover:bg-red-700 transition-all tracking-widest"
            >
              Sign In
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
