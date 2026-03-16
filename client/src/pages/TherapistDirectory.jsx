import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5005";

export default function TherapistDirectory() {
  const [therapists, setTherapists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTherapist, setSelectedTherapist] = useState(null);
  const [specs, setSpecs] = useState([]);
  const [showFilters, setShowFilters] = useState(false);
  const [searchActive, setSearchActive] = useState(false);
  const [userLocation, setUserLocation] = useState(null);
  
  const [filters, setFilters] = useState({
    specializations: [],
    min_rating: 0,
    max_fee: 2000,
    languages: [],
    available_now: false,
    max_distance: 50
  });

  useEffect(() => {
    fetchTherapists();
    fetchSpecs();
  }, []);

  const fetchSpecs = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/therapists/specializations`);
      if (res.ok) setSpecs(await res.json());
    } catch {}
  };

  const fetchTherapists = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/therapists`);
      if (response.ok) {
        setTherapists(await response.json());
        setSearchActive(false);
      }
    } catch (error) {
      console.error("Failed to fetch therapists", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    setLoading(true);
    setShowFilters(false);
    try {
      const response = await fetch(`${API_BASE_URL}/api/therapists/search`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...filters,
          user_location: userLocation
        })
      });
      if (response.ok) {
        setTherapists(await response.json());
        setSearchActive(true);
      }
    } catch (error) {
      console.error("Search failed", error);
    } finally {
      setLoading(false);
    }
  };

  const handleNearMe = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((pos) => {
        setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        alert("Location pinned! You can now search by distance.");
      });
    }
  };

  const toggleSpec = (s) => {
    setFilters(prev => ({
      ...prev,
      specializations: prev.specializations.includes(s) 
        ? prev.specializations.filter(i => i !== s) 
        : [...prev.specializations, s]
    }));
  };

  // Group therapists by specialization for "Netflix Rows" (only when not in search mode)
  const rowSpecs = [...new Set(therapists.flatMap(t => t.specializations))];

  return (
    <div className="min-h-screen bg-zinc-950 text-white pb-20 pt-16 font-sans relative overflow-x-hidden">
      {/* Hero Section */}
      {!searchActive && (
        <div className="relative h-[45vh] flex items-center justify-start px-12 mb-8 bg-gradient-to-r from-zinc-900 to-zinc-800 border-b border-zinc-800">
          <div className="absolute inset-0 bg-black/40" />
          <div className="relative z-10 max-w-2xl">
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-5xl md:text-7xl font-extrabold tracking-tight text-red-600 mb-4"
            >
              WithU247
            </motion.h1>
            <motion.h2 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-2xl md:text-4xl font-bold mb-4"
            >
              Find Your Support System.
            </motion.h2>
            <div className="flex gap-4 mt-8">
              <button 
                onClick={() => setShowFilters(true)}
                className="bg-red-600 text-white px-8 py-3 rounded font-bold hover:bg-red-700 transition-all flex items-center gap-2"
              >
                <span>🔍</span> Advanced Search
              </button>
              <button 
                onClick={handleNearMe}
                className="bg-zinc-800 text-white px-8 py-3 rounded font-bold hover:bg-zinc-700 transition-all border border-zinc-700"
              >
                📍 Near Me
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Filter Sidebar Overlay */}
      <AnimatePresence>
        {showFilters && (
          <>
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }}
              onClick={() => setShowFilters(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60]"
            />
            <motion.div 
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              className="fixed right-0 top-0 bottom-0 w-full max-w-sm bg-zinc-900 z-[70] shadow-2xl p-8 overflow-y-auto"
            >
              <div className="flex justify-between items-center mb-8">
                <h3 className="text-2xl font-bold">Filters</h3>
                <button onClick={() => setShowFilters(false)} className="text-zinc-500 hover:text-white">✕</button>
              </div>

              <div className="space-y-8">
                {/* Specializations */}
                <div>
                  <h4 className="text-sm font-bold text-zinc-500 uppercase mb-3">Specializations</h4>
                  <div className="flex flex-wrap gap-2">
                    {specs.map(s => (
                      <button 
                        key={s} 
                        onClick={() => toggleSpec(s)}
                        className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                          filters.specializations.includes(s) ? 'bg-red-600 text-white' : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'
                        }`}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Consultation Fee */}
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <h4 className="text-sm font-bold text-zinc-500 uppercase">Max Fee</h4>
                    <span className="text-red-500 font-bold">₹{filters.max_fee}</span>
                  </div>
                  <input 
                    type="range" min="200" max="3000" step="100"
                    value={filters.max_fee} 
                    onChange={(e) => setFilters(p => ({ ...p, max_fee: parseInt(e.target.value) }))}
                    className="w-full accent-red-600"
                  />
                </div>

                {/* Rating */}
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <h4 className="text-sm font-bold text-zinc-500 uppercase">Min Rating</h4>
                    <span className="text-orange-500 font-bold">{filters.min_rating}★</span>
                  </div>
                  <input 
                    type="range" min="0" max="5" step="0.5"
                    value={filters.min_rating} 
                    onChange={(e) => setFilters(p => ({ ...p, min_rating: parseFloat(e.target.value) }))}
                    className="w-full accent-orange-500"
                  />
                </div>

                {/* Distance (only if user location is set) */}
                {userLocation && (
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <h4 className="text-sm font-bold text-zinc-500 uppercase">Distance Limit</h4>
                      <span className="text-blue-500 font-bold">{filters.max_distance} km</span>
                    </div>
                    <input 
                      type="range" min="1" max="100"
                      value={filters.max_distance} 
                      onChange={(e) => setFilters(p => ({ ...p, max_distance: parseInt(e.target.value) }))}
                      className="w-full accent-blue-600"
                    />
                  </div>
                )}

                {/* Toggles */}
                <div className="flex items-center justify-between p-4 bg-zinc-800/50 rounded-lg">
                  <span className="text-sm font-medium">Available Now</span>
                  <button 
                    onClick={() => setFilters(p => ({ ...p, available_now: !p.available_now }))}
                    className={`w-12 h-6 rounded-full transition-all relative ${filters.available_now ? 'bg-green-600' : 'bg-zinc-700'}`}
                  >
                    <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${filters.available_now ? 'right-1' : 'left-1'}`} />
                  </button>
                </div>

                <button 
                  onClick={handleSearch}
                  className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-4 rounded-xl shadow-lg transition-transform active:scale-95"
                >
                  Apply Filters
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <div className="px-12">
        {searchActive && (
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-3xl font-bold">Search Results <span className="text-zinc-500 text-xl ml-2">{therapists.length} found</span></h2>
            <button 
              onClick={fetchTherapists}
              className="text-zinc-400 hover:text-white text-sm font-medium"
            >
              ← Back to Browse
            </button>
          </div>
        )}

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
          </div>
        ) : (
          <div className="shrink-0">
            {searchActive ? (
              /* Grid Layout for Search Results */
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
                {therapists.map(t => (
                  <TherapistCard 
                    key={t._id} 
                    therapist={t} 
                    onSelect={setSelectedTherapist} 
                  />
                ))}
              </div>
            ) : (
              /* Row Layout for Browse Mode */
              <div className="space-y-16">
                <TherapistRow 
                  title="Top Rated Support" 
                  therapists={therapists.filter(t => t.rating >= 4.5)} 
                  onSelect={setSelectedTherapist}
                />
                
                {rowSpecs.slice(0, 5).map(spec => (
                  <TherapistRow 
                    key={spec}
                    title={`Specialized in ${spec}`} 
                    therapists={therapists.filter(t => t.specializations.includes(spec))} 
                    onSelect={setSelectedTherapist}
                  />
                ))}
              </div>
            )}
            
            {!loading && therapists.length === 0 && (
              <div className="text-center py-20">
                <p className="text-zinc-500 text-xl">No therapists found matching your criteria.</p>
                <button onClick={fetchTherapists} className="text-red-500 mt-4 hover:underline">Reset Filters</button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Expanded Modal */}
      <AnimatePresence>
        {selectedTherapist && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
            onClick={() => setSelectedTherapist(null)}
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              onClick={e => e.stopPropagation()}
              className="bg-zinc-900 rounded-2xl shadow-2xl overflow-hidden max-w-4xl w-full flex flex-col md:flex-row relative border border-zinc-800"
            >
              <button 
                onClick={() => setSelectedTherapist(null)}
                className="absolute top-6 right-6 z-10 p-2 bg-black/50 hover:bg-black/80 rounded-full transition-colors"
              >
                ✕
              </button>
              
              <div className="w-full md:w-2/5 h-80 md:h-auto bg-zinc-800 flex flex-col items-center justify-center p-8 border-r border-zinc-800">
                <div className="w-40 h-40 rounded-full overflow-hidden mb-6 border-4 border-zinc-700 shadow-xl">
                  <img 
                    src={selectedTherapist.profile_image || `https://ui-avatars.com/api/?name=${encodeURIComponent(selectedTherapist.name)}&background=random`} 
                    alt={selectedTherapist.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <h3 className="text-2xl font-bold text-center mb-1">{selectedTherapist.name}</h3>
                <p className="text-red-500 font-bold text-lg">{selectedTherapist.rating} ★</p>
                
                {selectedTherapist.distance !== undefined && (
                  <div className="mt-2 text-blue-400 font-medium text-sm bg-blue-400/10 px-3 py-1 rounded-full">
                    📍 {selectedTherapist.distance} km away
                  </div>
                )}

                <div className="mt-8 flex gap-3 w-full">
                  <button className="flex-1 bg-white text-black font-bold py-3 rounded-xl hover:bg-zinc-200 transition-colors">
                    Book Session
                  </button>
                </div>
              </div>
              
              <div className="w-full md:w-3/5 p-8 md:p-12 flex flex-col justify-center">
                <div className="mb-6 flex items-center gap-4">
                  <span className={`px-3 py-1 rounded-full text-xs font-bold ${selectedTherapist.available_now ? 'bg-green-500/20 text-green-500' : 'bg-zinc-700 text-zinc-400'}`}>
                    {selectedTherapist.available_now ? 'Available Now' : 'Busy'}
                  </span>
                  <span className="text-zinc-400 text-sm">{selectedTherapist.experience_years} Years Experience</span>
                </div>
                
                <p className="text-zinc-300 text-base leading-relaxed mb-8">
                  {selectedTherapist.bio || "No biography provided."}
                </p>
                
                <div className="grid grid-cols-2 gap-y-6 gap-x-8 text-sm">
                  <div>
                    <strong className="text-zinc-500 block text-xs uppercase mb-1 tracking-wider">Education</strong>
                    <span className="text-zinc-200">{selectedTherapist.education || "N/A"}</span>
                  </div>
                  <div>
                    <strong className="text-zinc-500 block text-xs uppercase mb-1 tracking-wider">Consultation Fee</strong>
                    <span className="text-green-500 font-bold">₹{selectedTherapist.consultation_fee} / session</span>
                  </div>
                  <div>
                    <strong className="text-zinc-500 block text-xs uppercase mb-1 tracking-wider">Languages</strong>
                    <span className="text-zinc-200">{selectedTherapist.languages?.join(', ')}</span>
                  </div>
                  <div>
                    <strong className="text-zinc-500 block text-xs uppercase mb-1 tracking-wider">Specializations</strong>
                    <span className="text-zinc-200">{selectedTherapist.specializations?.join(', ')}</span>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function TherapistRow({ title, therapists, onSelect }) {
  if (!therapists || therapists.length === 0) return null;
  
  return (
    <div className="relative group">
      <h2 className="text-xl md:text-2xl font-bold text-zinc-100 mb-6 px-2 tracking-wide flex items-center gap-3">
        {title}
        <span className="h-0.5 flex-1 bg-zinc-800 mt-1" />
      </h2>
      
      <div className="flex space-x-6 overflow-x-scroll scrollbar-hide pb-8 px-2 snap-x">
        {therapists.map((therapist) => (
          <TherapistCard key={therapist._id} therapist={therapist} onSelect={onSelect} />
        ))}
      </div>
    </div>
  );
}

function TherapistCard({ therapist, onSelect }) {
  return (
    <motion.div 
      whileHover={{ scale: 1.05, y: -10 }}
      transition={{ duration: 0.2 }}
      onClick={() => onSelect(therapist)}
      className="flex-none w-48 md:w-64 snap-start cursor-pointer rounded-xl overflow-hidden bg-zinc-900 border border-zinc-800 shadow-lg group/card relative"
    >
      <div className="aspect-[2/3] relative bg-zinc-800">
        <img 
          src={therapist.profile_image || `https://ui-avatars.com/api/?name=${encodeURIComponent(therapist.name)}&background=random`} 
          alt={therapist.name}
          className="w-full h-full object-cover opacity-80 group-hover/card:opacity-100 transition-opacity"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent opacity-90" />
        
        <div className="absolute bottom-0 left-0 p-5 w-full">
          <h3 className="text-lg font-bold truncate mb-1">{therapist.name}</h3>
          <div className="flex items-center text-xs space-x-3">
            <span className="text-green-500 font-bold">{therapist.rating} ★</span>
            <span className="text-zinc-400 border border-zinc-700 px-1.5 py-0.5 rounded uppercase tracking-tighter">{therapist.experience_years}y EXP</span>
          </div>
          <p className="text-zinc-500 text-xs mt-3 truncate font-medium">
            {therapist.specializations?.[0]}
          </p>
        </div>
      </div>
      {therapist.distance !== undefined && (
        <div className="absolute top-3 right-3 bg-black/60 backdrop-blur-md text-white text-[10px] px-2 py-1 rounded-md border border-white/10">
          {therapist.distance} km
        </div>
      )}
    </motion.div>
  );
}

