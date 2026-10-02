const mongoose = require('mongoose');

const FollowUpSchema = new mongoose.Schema(
  {
    patientId: { type: String, required: true, index: true },
    patientName: { type: String, required: true },
    familyId: { type: String, default: '' },
    doctorId: { type: String, default: 'demo' },
    clinicId: { type: String, default: 'demo', index: true },
    caseId: { type: String, default: '' },
    lastVisitDate: { type: String, default: '' },
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
