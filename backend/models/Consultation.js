const mongoose = require('mongoose');

const consultationSchema = new mongoose.Schema({
  caseId: { type: String, required: true, unique: true },
  patientId: { type: String, ref: 'Patient', required: true },
  familyId: { type: String, ref: 'Family' },
  date: { type: String },
  time: { type: String },
  bp: { type: String },
  sugar: { type: String },
  other: { type: String },
  reference: { type: String },
  complaint: { type: String },
  investigation: { type: String },
  dietary: { type: String },
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
    timing: String
  }],
  labReport: { type: Boolean, default: false },
  charge: { type: Number, default: 0 },
  paid: { type: Number, default: 0 },
  due: { type: Number, default: 0 }
}, { timestamps: true });

module.exports = mongoose.model('Consultation', consultationSchema);
