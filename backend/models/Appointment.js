const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema({
  token: { type: String },
  patientId: { type: String },
  name: { type: String },
  patientName: { type: String },
  familyId: { type: String },
  familyHead: { type: String },
  phone: { type: String },
  area: { type: String },
  age: { type: String },
  gender: { type: String },
  complaint: { type: String },
  reason: { type: String },
  clinicId: { type: String, default: 'demo' },
  vitals: {
    bp: String,
    pulse: String,
    temp: String,
    spo2: String,
    weight: String
  },
  status: { type: String, default: 'Waiting' },
  date: { type: String },
  appointmentDate: { type: String },
  arrivedAt: { type: String },
  appointmentTime: { type: String }
}, { timestamps: true, strict: false });

module.exports = mongoose.model('Appointment', appointmentSchema);

