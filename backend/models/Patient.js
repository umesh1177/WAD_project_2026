const mongoose = require('mongoose');

const PatientSchema = new mongoose.Schema(
  {
    patId: { type: String, required: true, index: true }, // e.g. "000120260001"
    familyId: { type: String, required: true, index: true },
    name: { type: String, required: true, trim: true },
    relation: { type: String, default: 'Head', trim: true },
    age: { type: String, default: '' },
    gender: { type: String, enum: ['Male', 'Female', 'Other', ''], default: 'Male' },
    bloodGroup: { type: String, default: '', trim: true },
    allergy: { type: String, default: '', trim: true },
    society: { type: String, default: '', trim: true },
    area: { type: String, default: '', trim: true },
    phone: { type: String, default: '', trim: true },
    clinicId: { type: String, default: 'demo', index: true },
    doctorId: { type: String, default: 'demo' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Patient', PatientSchema);

