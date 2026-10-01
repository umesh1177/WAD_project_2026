const mongoose = require('mongoose');

const MedicineSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, index: true },
    genericName: { type: String, default: '', trim: true },
    category: { type: String, default: 'General' },
    form: {
      type: String,
      enum: ['Tablet', 'Capsule', 'Syrup', 'Injection', 'Ointment', 'Drops', 'Other'],
      default: 'Tablet',
    },
    defaultDosage: { type: String, default: '1-0-1' },
    defaultTiming: { type: String, default: 'AF' },
    unitPrice: { type: Number, default: 0 },
    inStock: { type: Number, default: 100 },
    clinicId: { type: String, default: 'demo' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Medicine', MedicineSchema);
