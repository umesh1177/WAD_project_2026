const mongoose = require('mongoose');

const masterDataSchema = new mongoose.Schema({
  type: { type: String, required: true },
  name: { type: String, required: true },
  category: { type: String },
  code: { type: String },
  description: { type: String },
  sampleType: { type: String },
  normalRange: { type: String },
  unitPrice: { type: Number },
  defaultDosage: { type: String },
  defaultTiming: { type: String },
  form: { type: String },
  items: [mongoose.Schema.Types.Mixed],
  value: { type: String },
  disease: { type: String },
  clinicId: { type: String, default: 'demo' }
}, { timestamps: true, strict: false });

module.exports = mongoose.model('MasterData', masterDataSchema);
