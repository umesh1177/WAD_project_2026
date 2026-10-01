const mongoose = require('mongoose');

const AppointmentSchema = new mongoose.Schema(
  {
    patientId: { type: String, required: true, index: true },
    familyId: { type: String, default: '' },
    patientName: { type: String, required: true },
    doctorId: { type: String, default: 'demo' },
    clinicId: { type: String, default: 'demo', index: true },
    appointmentDate: { type: String, required: true }, // YYYY-MM-DD
    appointmentTime: { type: String, default: '10:00' },
    reason: { type: String, default: 'General Consultation' },
    status: {
      type: String,
      enum: ['scheduled', 'in-progress', 'completed', 'cancelled'],
      default: 'scheduled',
    },
    notes: { type: String, default: '' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Appointment', AppointmentSchema);
