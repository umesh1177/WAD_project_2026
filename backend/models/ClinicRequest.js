const mongoose = require('mongoose');

const ClinicRequestSchema = new mongoose.Schema(
  {
    requestId: { type: String, required: true, unique: true, index: true }, // e.g. "REQ-101"
    clinicId: { type: String, default: '' },
    name: { type: String, required: true, trim: true },
    city: { type: String, default: 'Ahmedabad', trim: true },
    registrationNumber: { type: String, default: '' },
    phone: { type: String, default: '', trim: true },
    email: { type: String, default: '', trim: true },
    address: { type: String, default: '', trim: true },
    operatingDays: { type: String, default: 'Monday - Saturday' },
    workingHours: { type: String, default: '09:00 - 20:00' },
    specialties: { type: String, default: '' },
    facilities: { type: String, default: '' },
    applicantName: { type: String, default: '', trim: true },
    applicantRole: { type: String, default: 'Owner' },
    clinicCertificate: { type: String, default: '' },
    doctorsCount: { type: Number, default: 1 },
    doctors: { type: Array, default: [] },
    status: { type: String, enum: ['Pending', 'Approved', 'Rejected'], default: 'Pending' },
    submittedFrom: { type: String, default: 'Landing Page' },
    formattedDate: { type: String, default: '' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('ClinicRequest', ClinicRequestSchema);
