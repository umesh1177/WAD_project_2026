const mongoose = require('mongoose');

const BillItemSchema = new mongoose.Schema({
  description: { type: String, required: true },
  qty: { type: Number, default: 1 },
  rate: { type: Number, default: 0 },
  amount: { type: Number, default: 0 },
});

const BillSchema = new mongoose.Schema(
  {
    billNo: { type: String, required: true, index: true },
    caseId: { type: String, default: '' },
    patientId: { type: String, required: true, index: true },
    patientName: { type: String, required: true },
    familyId: { type: String, default: '' },
    doctorId: { type: String, default: 'demo' },
    clinicId: { type: String, default: 'demo', index: true },
    items: [BillItemSchema],
    totalCharge: { type: Number, required: true, default: 0 },
    discount: { type: Number, default: 0 },
    netAmount: { type: Number, required: true, default: 0 },
    paidAmount: { type: Number, default: 0 },
    dueAmount: { type: Number, default: 0 },
    status: { type: String, enum: ['Paid', 'Partial', 'Due'], default: 'Due' },
    billDate: { type: String, required: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Bill', BillSchema);
