const mongoose = require('mongoose');

const PrescriptionSchema = new mongoose.Schema(
  {
    caseId: { type: String, required: true, index: true },
    patientId: { type: String, required: true, index: true },
    familyId: { type: String, required: true },
    clinicId: { type: String, default: 'demo', index: true },
    doctorId: { type: String, default: 'demo' },
    medicines: [
      {
        name: { type: String, required: true },
        qty: { type: String, default: '1' },
        mor: { type: String, default: '0' },
        noon: { type: String, default: '0' },
        eve: { type: String, default: '0' },
        ngt: { type: String, default: '0' },
        timing: { type: String, default: 'AF' },
        notes: { type: String, default: '' },
      },
    ],
    dietaryAdvice: { type: String, default: '' },
    dietaryCodes: [{ type: String }],
  },
  { timestamps: true }
);

module.exports = mongoose.model('Prescription', PrescriptionSchema);
