const mongoose = require('mongoose');

const PaymentSchema = new mongoose.Schema(
  {
    receiptNo: { type: String, required: true, index: true },
    billId: { type: String, default: '' },
    caseId: { type: String, default: '' },
    patientId: { type: String, required: true, index: true },
    patientName: { type: String, required: true },
    familyId: { type: String, default: '' },
    clinicId: { type: String, default: 'demo', index: true },
    amount: { type: Number, required: true },
    paymentMethod: {
      type: String,
      enum: ['Cash', 'UPI', 'Card', 'NetBanking', 'Other'],
      default: 'Cash',
    },
    transactionRef: { type: String, default: '' },
    paymentDate: { type: String, required: true },
    remarks: { type: String, default: '' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Payment', PaymentSchema);
