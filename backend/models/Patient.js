const mongoose = require('mongoose');

const patientSchema = new mongoose.Schema({
  patId: { type: String, required: true, unique: true },
  familyId: { type: String },
  name: { type: String, required: true },
  relation: { type: String },
  age: { type: String },
  gender: { type: String },
  bloodGroup: { type: String },
  allergy: { type: String },
  society: { type: String },
  area: { type: String },
  phone: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('Patient', patientSchema);
