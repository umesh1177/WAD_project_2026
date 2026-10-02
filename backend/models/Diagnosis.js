const mongoose = require('mongoose');

const DiagnosisSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, index: true },
    category: { type: String, default: 'General' },
    description: { type: String, default: '' },
    clinicId: { type: String, default: 'demo' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Diagnosis', DiagnosisSchema);
