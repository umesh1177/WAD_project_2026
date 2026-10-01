const mongoose = require('mongoose');

const FamilySchema = new mongoose.Schema(
  {
    famId: { type: String, required: true, index: true }, // e.g. "CLN01-2026-0001"
    headName: { type: String, required: true, trim: true },
    society: { type: String, default: '', trim: true },
    registeredBy: { type: String, enum: ['Self', 'Family Member', ''], default: 'Self' },
    area: { type: String, default: '', trim: true },
    phone: { type: String, default: '', trim: true },
    address: { type: String, default: '', trim: true },
    year: { type: Number, default: () => new Date().getFullYear() },
    sequence: { type: Number, default: 1 },
    clinicId: { type: String, default: 'demo', index: true },
    doctorId: { type: String, default: 'demo' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Family', FamilySchema);
