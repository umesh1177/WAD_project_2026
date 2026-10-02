const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema({
  token: { type: String, required: true },
  patientId: { type: String },
  name: { type: String },
  familyHead: { type: String },
  phone: { type: String },
  area: { type: String },
  age: { type: String },
  gender: { type: String },
  complaint: { type: String },
  clinicId: { type: String, default: 'demo' },
  vitals: {
    bp: String,
    pulse: String,
    temp: String,
    spo2: String,
    weight: String
  },
  status: { type: String, enum: ['Waiting', 'In Consultation', 'Completed', 'Done', 'Cancelled'], default: 'Waiting' },
  date: { type: String },
  arrivedAt: { type: String }
}, { timestamps: true, strict: false });

module.exports = mongoose.model('Appointment', appointmentSchema);
