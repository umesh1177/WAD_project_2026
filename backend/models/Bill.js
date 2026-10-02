const mongoose = require('mongoose');

const billSchema = new mongoose.Schema({
  billNo: { type: String, required: true, unique: true },
  consultationId: { type: String, ref: 'Consultation' },
  patientId: { type: String, ref: 'Patient' },
  patientName: { type: String },
  billDate: { type: Date, default: Date.now },
  totalCharge: { type: Number, default: 0 },
  paidAmount: { type: Number, default: 0 },
  dueAmount: { type: Number, default: 0 },
  status: { type: String, enum: ['Paid', 'Due'], default: 'Paid' }
}, { timestamps: true });

module.exports = mongoose.model('Bill', billSchema);
