const mongoose = require('mongoose');

const masterItemSchema = new mongoose.Schema({
  id: { type: String },
  name: { type: String },
  code: { type: String, default: '' },
  category: { type: String, default: '' },
  description: { type: String, default: '' },
  sampleType: { type: String, default: '' },
  normalRange: { type: String, default: '' },
  form: { type: String, default: '' },
  defaultDosage: { type: String, default: '' },
  defaultTiming: { type: String, default: '' },
  unitPrice: { type: Number, default: 0 },
  city: { type: String, default: '' },
  pincode: { type: String, default: '' },
  area: { type: String, default: '' },
  severity: { type: String, default: '' },
  target: { type: String, default: '' },
  title: { type: String, default: '' },
  keyHint: { type: String, default: '' },
  disease: { type: String, default: '' },
  eat: { type: String, default: '' },
  avoid: { type: String, default: '' }
}, { _id: false, strict: false });

const masterTabSchema = new mongoose.Schema({
  tabId: { type: String, required: true }, // 'dietary' | 'complaints' | 'investigations' | 'medicines' | 'areas' | 'allergies' | 'relations' | 'societies' | 'shortcuts'
  tabName: { type: String, required: true },
  items: [masterItemSchema]
}, { _id: false, strict: false });

const clinicMasterSchema = new mongoose.Schema({
  clinicId: { type: String, required: true, unique: true },
  tabs: [masterTabSchema]
}, { timestamps: true, strict: false });

module.exports = mongoose.model('MasterData', clinicMasterSchema);
