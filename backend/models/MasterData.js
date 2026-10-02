const mongoose = require('mongoose');

/**
 * Unified Master Data Model
 * Manages all Master Catalogue items (Medicines, Complaints, Investigations, Areas, Societies, Allergies, Relations, Dietary, Shortcuts) in MongoDB Atlas
 */
const MasterDataSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      required: true,
      index: true,
      enum: [
        'dietary',
        'complaints',
        'investigations',
        'areas',
        'medicines',
        'allergies',
        'relations',
        'societies',
        'shortcuts',
      ],
    },
    clinicId: { type: String, default: 'global', index: true },
    customId: { type: String, default: '' },
    name: { type: String, default: '', trim: true },
    code: { type: String, default: '', trim: true },
    category: { type: String, default: '', trim: true },
    description: { type: String, default: '' },
    // Dietary fields
    disease: { type: String, default: '' },
    eat: { type: String, default: '' },
    avoid: { type: String, default: '' },
    text: { type: String, default: '' },
    // Investigation fields
    sampleType: { type: String, default: '' },
    // Location fields
    city: { type: String, default: '' },
    pincode: { type: String, default: '' },
    area: { type: String, default: '' },
    // Medicine fields
    form: { type: String, default: '' },
    defaultDosage: { type: String, default: '' },
    unitPrice: { type: Number, default: 0 },
    // Allergy fields
    severity: { type: String, default: '' },
    // Navigation Shortcut fields
    key: { type: String, default: '' },
    target: { type: String, default: '' },
    title: { type: String, default: '' },
    extraData: { type: mongoose.Schema.Types.Mixed, default: {} },
  },
  { timestamps: true }
);

module.exports = mongoose.model('MasterData', MasterDataSchema);
