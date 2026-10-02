const mongoose = require('mongoose');

const DoctorSubSchema = new mongoose.Schema({
  name: { type: String, required: true },
  specialty: { type: String, default: 'General Medicine' },
  registration: { type: String, default: '' },
  email: { type: String, required: true },
  phone: { type: String, default: '' },
  password: { type: String, default: 'Password@123' },
  status: { type: String, default: 'Active' },
  patients: { type: Number, default: 0 },
  visits: { type: Number, default: 0 },
});

const ReceptionistSubSchema = new mongoose.Schema({
  name: { type: String, default: '' },
  email: { type: String, default: '' },
  phone: { type: String, default: '' },
  shift: { type: String, default: 'General Shift' },
  password: { type: String, default: '123' },
  status: { type: String, default: 'Active' },
});

const ClinicSchema = new mongoose.Schema(
  {
    clinicId: { type: String, required: true, unique: true, index: true },
    name: { type: String, required: true },
    city: { type: String, default: 'Ahmedabad' },
    phone: { type: String, default: '' },
    email: { type: String, default: '' },
    registration: { type: String, default: '' },
    address: { type: String, default: '' },
    days: { type: String, default: 'Monday - Saturday' },
    hours: { type: String, default: '08:30 AM - 08:30 PM' },
    specialties: { type: String, default: 'General Medicine' },
    facilities: { type: String, default: 'Consultation, Pharmacy, Diagnostics' },
    status: { type: String, default: 'Active' },
    services: {
      type: [String],
      default: ['receptionist', 'appointment', 'digitalPrescription', 'certificates', 'billing'],
    },
    doctorsCount: { type: Number, default: 1 },
    doctors: [DoctorSubSchema],
    receptionist: ReceptionistSubSchema,
    patientsCount: { type: Number, default: 0 },
    visitsCount: { type: Number, default: 0 },
    verifiedDocuments: { type: Number, default: 1 },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Clinic', ClinicSchema);
