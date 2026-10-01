const mongoose = require('mongoose');

const DiagnosisSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, index: true },
    code: { type: String, default: '', trim: true },
    category: { type: String, default: 'General' },
    description: { type: String, default: '' },
    commonTreatments: [{ type: String }],
    clinicId: { type: String, default: 'demo' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Diagnosis', DiagnosisSchema);
