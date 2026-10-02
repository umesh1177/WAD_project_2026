const mongoose = require('mongoose');

const ClinicRequestSchema = new mongoose.Schema(
  {
    requestId: { type: String, required: true, unique: true, index: true },
    clinicId: { type: String, default: '' },
    name: { type: String, required: true },
    city: { type: String, default: 'Ahmedabad' },
    registrationNumber: { type: String, default: '' },
    phone: { type: String, default: '' },
    email: { type: String, default: '' },
    address: { type: String, default: '' },
    operatingDays: { type: String, default: 'Monday - Saturday' },
    workingHours: { type: String, default: '09:00 - 20:00' },
    specialties: { type: String, default: 'General Medicine' },
    facilities: { type: String, default: '' },
    applicantName: { type: String, default: '' },
    applicantRole: { type: String, default: 'Owner' },
    doctorsCount: { type: Number, default: 1 },
    doctors: [
      {
        name: { type: String, default: '' },
        specialty: { type: String, default: 'General Medicine' },
        registration: { type: String, default: '' },
        email: { type: String, default: '' },
        phone: { type: String, default: '' },
        certificate: { type: String, default: '' },
      },
    ],
    status: { type: String, enum: ['Pending', 'Approved', 'Rejected'], default: 'Pending' },
    submittedFrom: { type: String, default: 'Landing Page' },
    approvedAt: { type: Date },
    rejectedAt: { type: Date },
  },
  { timestamps: true }
);

module.exports = mongoose.model('ClinicRequest', ClinicRequestSchema);
