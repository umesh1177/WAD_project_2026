const mongoose = require('mongoose');

const CertificateSchema = new mongoose.Schema(
  {
    certNo: { type: String, required: true, index: true },
    patientId: { type: String, default: '' },
    patientName: { type: String, required: true },
    diagnosis: { type: String, required: true },
    fromDate: { type: String, required: true },
    toDate: { type: String, required: true },
    reason: { type: String, default: 'Medical Rest & Treatment' },
    certificateType: { type: String, default: 'Medical Fitness / Leave' },
    doctorId: { type: String, default: 'demo' },
    clinicId: { type: String, default: 'demo', index: true },
    issuedDate: { type: String, required: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Certificate', CertificateSchema);
