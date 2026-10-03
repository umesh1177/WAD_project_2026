const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  role: { type: String, required: true, enum: ['admin', 'doctor', 'receptionist'] },
  username: { type: String, required: true, unique: true },
  email: { type: String },
  password: { type: String, required: true },
  name: { type: String, required: true },
  phone: { type: String },
  status: { type: String, enum: ['Active', 'Suspended'], default: 'Active' },
  clinicId: { type: String },
  clinic: { type: String },
  clinics: [{ id: String, name: String }],
  activeClinicId: { type: String },
  services: [{ type: String }],
  specialty: { type: String },
  registration: { type: String },
  degree: { type: String },
  regNo: { type: String },
  employeeId: { type: String },
  shift: { type: String },
}, { timestamps: true });

module.exports = mongoose.model('User', UserSchema);
