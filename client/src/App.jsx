// import { Button } from "@/components/ui/button";
// import { Card, CardContent } from "@/components/ui/card";
// import { motion } from "framer-motion";

// export default function App() {
//   return (
//     <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
//       <Card className="w-[420px] shadow-2xl rounded-2xl">
//         <CardContent className="p-8 text-center">
//           <motion.h1
//             initial={{ opacity: 0, y: -20 }}
//             animate={{ opacity: 1, y: 0 }}
//             transition={{ duration: 0.6 }}
//             className="text-3xl font-bold text-indigo-700"
//           >
//             WithU247
//           </motion.h1>
//           <p className="mt-3 text-gray-600">
//             Find causes, treatments, doctors, and hospitals—instantly.
//           </p>

//           <motion.div
//             initial={{ opacity: 0, scale: 0.95 }}
//             animate={{ opacity: 1, scale: 1 }}
//             transition={{ delay: 0.4, duration: 0.5 }}
//             className="mt-6"
//           >
//             <Button className="w-full text-lg py-6">Start Assessment</Button>
//           </motion.div>
//         </CardContent>
//       </Card>
//     </div>
//   );
// }
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/context/AuthContext";
import LandingPage from "@/pages/LandingPage";
import SymptomInput from "@/pages/SymptomInput";
import ResultsPage from "@/pages/ResultsPage";
import TherapistDirectory from "@/pages/TherapistDirectory";
import AIChat from "@/pages/AIChat";
import AuthPage from "@/pages/AuthPage";
import ProfilePage from "@/pages/ProfilePage";
import MoodTracker from "@/pages/MoodTracker";
import QuizPage from "@/pages/QuizPage";
import Dashboard from "@/pages/Dashboard";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function App() {
  return (
    <Router>
      <AuthProvider>
        <div className="flex flex-col min-h-screen bg-zinc-950">
          <Navbar />
          <main className="flex-grow">
            <Routes>
              <Route path="/" element={<LandingPage />} />
              <Route path="/symptom" element={<SymptomInput />} />
              <Route path="/results" element={<ResultsPage />} />
              <Route path="/therapists" element={<TherapistDirectory />} />
              <Route path="/chat" element={<AIChat />} />
              <Route path="/auth" element={<AuthPage />} />
              <Route path="/profile" element={<ProfilePage />} />
              <Route path="/mood" element={<MoodTracker />} />
              <Route path="/quiz" element={<QuizPage />} />
              <Route path="/dashboard" element={<Dashboard />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </AuthProvider>
    </Router>
  );
}
