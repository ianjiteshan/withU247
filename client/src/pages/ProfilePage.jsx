import React, { useState } from "react";
import { motion } from "framer-motion";
import { useAuth } from "../context/AuthContext";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5005";

export default function ProfilePage() {
  const { user, token, fetchProfile } = useAuth();
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState(user || {});
  const [msg, setMsg] = useState("");

  if (!user) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center text-zinc-400 pt-20">
        Please log in to view your profile.
      </div>
    );
  }

  const handleSave = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/user/profile`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        setMsg("Profile updated!");
        setEditing(false);
        fetchProfile();
      }
    } catch {
      setMsg("Failed to update profile");
    }
  };

  const Field = ({ label, field, type = "text" }) => (
    <div>
      <label className="text-zinc-500 text-xs uppercase font-bold block mb-1">{label}</label>
      {editing ? (
        <input
          type={type}
          value={form[field] || ""}
          onChange={(e) => setForm({ ...form, [field]: e.target.value })}
          className="w-full bg-zinc-800 border border-zinc-700 rounded px-3 py-2 text-white text-sm focus:outline-none focus:ring-1 focus:ring-red-500"
        />
      ) : (
        <p className="text-zinc-300 text-sm">{user[field] || "—"}</p>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-zinc-950 text-white pt-24 px-4 md:px-12 pb-20 font-sans">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-3xl mx-auto"
      >
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold">My Profile</h1>
          <button
            onClick={() => editing ? handleSave() : setEditing(true)}
            className="px-5 py-2 bg-red-600 hover:bg-red-700 rounded-lg font-medium transition-colors"
          >
            {editing ? "Save" : "Edit"}
          </button>
        </div>

        {msg && <p className="text-green-500 mb-4 text-sm">{msg}</p>}

        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 space-y-8">
          <div>
            <h2 className="text-xl font-bold mb-4 text-red-500">Personal Info</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Field label="First Name" field="first_name" />
              <Field label="Last Name" field="last_name" />
              <Field label="Username" field="username" />
              <Field label="Email" field="email" type="email" />
              <Field label="Phone" field="phone" />
              <Field label="Gender" field="gender" />
              <Field label="City" field="city" />
              <Field label="State" field="state" />
              <Field label="Pincode" field="pincode" />
            </div>
          </div>

          <div>
            <h2 className="text-xl font-bold mb-4 text-red-500">Emergency Contact</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Field label="Contact Name" field="emergency_contact_name" />
              <Field label="Contact Phone" field="emergency_contact_phone" />
            </div>
          </div>

          <div>
            <h2 className="text-xl font-bold mb-4 text-red-500">Therapy History</h2>
            <div>
              <label className="text-zinc-500 text-xs uppercase font-bold block mb-1">History</label>
              {editing ? (
                <textarea
                  value={form.therapy_history || ""}
                  onChange={(e) => setForm({ ...form, therapy_history: e.target.value })}
                  rows={3}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded px-3 py-2 text-white text-sm focus:outline-none focus:ring-1 focus:ring-red-500"
                />
              ) : (
                <p className="text-zinc-300 text-sm">{user.therapy_history || "—"}</p>
              )}
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
