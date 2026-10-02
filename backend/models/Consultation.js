const mongoose = require('mongoose');

const consultationSchema = new mongoose.Schema({
  caseId: { type: String, required: true, unique: true },
  patientId: { type: String, required: true },
  familyId: { type: String },
  clinicId: { type: String, default: 'demo' },
  doctorId: { type: String },
  doctorName: { type: String },
  date: { type: String },
  time: { type: String },
  bp: { type: String },
  sugar: { type: String },
  other: { type: String },
  reference: { type: String },
  complaint: { type: String },
  investigation: { type: String },
  dietary: { type: String },
  diagnosis: { type: String },
  vitals: {
    bp: String,
    pulse: String,
    temp: String,
    spo2: String,
    weight: String
  },
  treatment: [{
    name: String,
    qty: String
  }],
  prescription: [{
    name: String,
    qty: String,
    mor: String,
    noon: String,
    eve: String,
    ngt: String,
    timing: String,
    days: String
  }],
  labReport: { type: mongoose.Schema.Types.Mixed, default: null },
  charge: { type: Number, default: 0 },
  paid: { type: Number, default: 0 },
  received: { type: Number, default: 0 },
  due: { type: Number, default: 0 }
}, { timestamps: true, strict: false });

module.exports = mongoose.model('Consultation', consultationSchema);
