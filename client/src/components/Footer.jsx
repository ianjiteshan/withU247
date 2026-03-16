import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer className="bg-zinc-950 border-t border-zinc-900 mt-16 py-16 px-6 md:px-12 font-sans">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12">
        {/* Brand Column */}
        <div className="space-y-6">
          <Link to="/" className="text-2xl font-black tracking-tighter text-white">
            WITHU<span className="text-red-600">247</span>
          </Link>
          <p className="text-zinc-500 text-sm leading-relaxed max-w-xs">
            Premium mental health assistant providing 24/7 AI-powered support, clinical diagnostic insights, and verified specialist connections.
          </p>
        </div>

        {/* Platform Column */}
        <div className="space-y-6">
          <h4 className="text-[10px] font-black uppercase text-red-600 tracking-[0.3em]">Platform</h4>
          <ul className="space-y-4 text-zinc-400 text-xs font-bold uppercase tracking-wider">
            <li><Link to="/therapists" className="hover:text-white transition-colors">Find Support</Link></li>
            <li><Link to="/chat" className="hover:text-white transition-colors">AI Therapy</Link></li>
            <li><Link to="/mood" className="hover:text-white transition-colors">Mood Tracking</Link></li>
            <li><Link to="/quiz" className="hover:text-white transition-colors">Mental Quiz</Link></li>
          </ul>
        </div>

        {/* Resources Column */}
        <div className="space-y-6">
          <h4 className="text-[10px] font-black uppercase text-red-600 tracking-[0.3em]">Support</h4>
          <ul className="space-y-4 text-zinc-400 text-xs font-bold uppercase tracking-wider">
            <li><Link to="/symptom" className="hover:text-white transition-colors">Wellness Check</Link></li>
            <li><Link to="/profile" className="hover:text-white transition-colors">My Profile</Link></li>
            <li><a href="#" className="hover:text-white transition-colors">Crisis Lines</a></li>
            <li><a href="#" className="hover:text-white transition-colors">Privacy Policy</a></li>
          </ul>
        </div>

        {/* Newsletter/Emergency */}
        <div className="space-y-6">
          <h4 className="text-[10px] font-black uppercase text-red-600 tracking-[0.3em]">Emergency</h4>
          <div className="bg-red-600/10 border border-red-600/20 p-4 rounded-xl">
            <p className="text-white font-black text-xs mb-1 italic">VANDREVALA FOUNDATION</p>
            <p className="text-red-600 font-extrabold text-xl tracking-tighter">1860 2662 345</p>
            <p className="text-zinc-500 text-[9px] font-bold uppercase mt-2">Available 24/7 For You</p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto border-t border-zinc-900 mt-16 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
        <p className="text-zinc-700 text-[10px] font-black uppercase tracking-[0.5em]">
          © {new Date().getFullYear()} WithU247 • ENGINEERING LAYER LOCAL 5173
        </p>
        <div className="flex gap-6 text-zinc-600 text-lg">
          {/* Social Icons Placeholder */}
          <span className="hover:text-red-600 cursor-pointer transition-colors">𝕏</span>
          <span className="hover:text-red-600 cursor-pointer transition-colors">IG</span>
          <span className="hover:text-red-600 cursor-pointer transition-colors">LI</span>
        </div>
      </div>
    </footer>
  );
}
