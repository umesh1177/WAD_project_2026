const mongoose = require('mongoose');

const FollowUpSchema = new mongoose.Schema(
  {
    patientId: { type: String, required: true, index: true },
    patientName: { type: String, required: true },
    familyId: { type: String, default: '' },
    clinicId: { type: String, default: 'demo', index: true },
    followUpDate: { type: String, required: true },
    reason: { type: String, default: 'Routine Review' },
    status: {
      type: String,
      enum: ['Pending', 'Completed', 'Missed', 'Rescheduled'],
      default: 'Pending',
    },
    notes: { type: String, default: '' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('FollowUp', FollowUpSchema);
