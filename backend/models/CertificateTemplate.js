const mongoose = require('mongoose');

const CertificateTemplateSchema = new mongoose.Schema(
  {
    templateName: { type: String, required: true },
    title: { type: String, required: true, default: 'MEDICAL CERTIFICATE' },
    body: { type: String, required: true },
    category: { type: String, default: 'General' },
    clinicId: { type: String, default: 'demo', index: true },
    doctorId: { type: String, default: 'demo' },
    isDefault: { type: Boolean, default: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model('CertificateTemplate', CertificateTemplateSchema);
