const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema({
  token: { type: String, required: true },
  patientId: { type: mongoose.Schema.Types.ObjectId, ref: 'Patient' },
  name: { type: String },
  familyHead: { type: String },
  phone: { type: String },
  area: { type: String },
  age: { type: String },
  gender: { type: String },
  complaint: { type: String },
  vitals: {
    bp: String,
    pulse: String,
    temp: String
  },
  status: { type: String, enum: ['Waiting', 'In Consultation', 'Completed', 'Done'], default: 'Waiting' },
  date: { type: String },
  arrivedAt: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('Appointment', appointmentSchema);
