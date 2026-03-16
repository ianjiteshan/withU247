import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  passwordHash: { type: String, required: true },

  // Profile
  first_name: { type: String },
  last_name: { type: String },
  phone: { type: String },
  date_of_birth: { type: Date },
  gender: { type: String },

  // Location
  city: { type: String, default: "Dwarka" },
  state: { type: String, default: "Delhi" },
  pincode: { type: String },

  // Mental health profile
  emergency_contact_name: { type: String },
  emergency_contact_phone: { type: String },
  medical_conditions: { type: [String], default: [] },
  current_medications: { type: [String], default: [] },
  therapy_history: { type: String },

  // Settings
  is_active: { type: Boolean, default: true },
  notification_preferences: { type: Object, default: {} },

  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now },
  last_login: { type: Date },
});

userSchema.pre("save", async function (next) {
  if (this.isModified("passwordHash")) {
    // passwordHash is set raw before first save; hash it
  }
  this.updated_at = Date.now();
  next();
});

userSchema.methods.comparePassword = async function (password) {
  return bcrypt.compare(password, this.passwordHash);
};

userSchema.methods.toProfile = function () {
  return {
    id: this._id,
    username: this.username,
    email: this.email,
    first_name: this.first_name,
    last_name: this.last_name,
    phone: this.phone,
    date_of_birth: this.date_of_birth,
    gender: this.gender,
    city: this.city,
    state: this.state,
    pincode: this.pincode,
    emergency_contact_name: this.emergency_contact_name,
    emergency_contact_phone: this.emergency_contact_phone,
    medical_conditions: this.medical_conditions,
    current_medications: this.current_medications,
    therapy_history: this.therapy_history,
    is_active: this.is_active,
    created_at: this.created_at,
    last_login: this.last_login,
  };
};

export default mongoose.model("User", userSchema);
