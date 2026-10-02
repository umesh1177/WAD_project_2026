const mongoose = require('mongoose');

const familySchema = new mongoose.Schema({
  famId: { type: String, required: true, unique: true },
  headName: { type: String, required: true },
  age: { type: String },
  bloodGroup: { type: String },
  allergy: { type: String },
  society: { type: String },
  area: { type: String },
  phone: { type: String },
  registeredBy: { type: String, default: 'Self' },
  year: { type: Number },
  sequence: { type: Number },
  clinicId: { type: String, default: 'demo' }
}, { timestamps: true, strict: false });

module.exports = mongoose.model('Family', familySchema);
