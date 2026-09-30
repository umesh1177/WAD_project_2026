const mongoose = require('mongoose');

const FamilySchema = new mongoose.Schema(
  {
    famId: { type: String, required: true, index: true }, // e.g. "0001", "0002"
    headName: { type: String, required: true, trim: true },
    area: { type: String, default: '', trim: true },
    phone: { type: String, default: '', trim: true },
    address: { type: String, default: '', trim: true },
    clinicId: { type: String, default: 'demo', index: true },
    doctorId: { type: String, default: 'demo' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Family', FamilySchema);
