const mongoose = require('mongoose');

const CertificateSchema = new mongoose.Schema(
  {
    certNo: { type: String, required: true, index: true, unique: true },
    patientId: { type: String, default: '' },
    patientName: { type: String, required: true },
    patientAge: { type: String, default: '' },
    patientGender: { type: String, default: '' },
    diagnosis: { type: String, required: true },
    fromDate: { type: String, required: true },
    toDate: { type: String, required: true },
    restDays: { type: Number, default: 0 },
    templateId: { type: String, default: '' },
    templateName: { type: String, default: 'Medical Fitness / Leave' },
    customBody: { type: String, default: '' },
    doctorName: { type: String, default: 'Dr. Chirag Paghdal' },
    clinicId: { type: String, default: 'demo', index: true },
    issuedDate: { type: String, required: true },
    place: { type: String, default: 'Surat' },
    status: { type: String, default: 'Issued' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Certificate', CertificateSchema);
