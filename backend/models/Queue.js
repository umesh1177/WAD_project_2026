const mongoose = require('mongoose');

/**
 * Patient OPD Consultation Queue
 * Tracks patients dispatched by receptionist to the doctor's queue
 */
const QueueSchema = new mongoose.Schema(
  {
    patientId: { type: String, required: true, index: true },
    patientName: { type: String, required: true, trim: true },
    familyId: { type: String, default: '' },
    clinicId: { type: String, default: 'demo', index: true },
    doctorId: { type: String, default: 'demo' },
    queueDate: { type: String, required: true, index: true }, // YYYY-MM-DD
    queueTime: { type: String, default: '10:00' },
    token: { type: Number, default: 1 },
    reason: { type: String, default: 'General Consultation' },
    phone: { type: String, default: '' },
    age: { type: String, default: '' },
    gender: { type: String, default: '' },
    allergy: { type: String, default: '' },
    status: {
      type: String,
      enum: ['Waiting', 'In Consultation', 'Completed', 'Done', 'Cancelled'],
      default: 'Waiting',
    },
    notes: { type: String, default: '' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Queue', QueueSchema);
