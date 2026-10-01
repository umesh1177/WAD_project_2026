const mongoose = require('mongoose');

const MedicalHistorySchema = new mongoose.Schema(
  {
    patientId: { type: String, required: true, index: true },
    chronicConditions: [{ type: String }],
    allergies: [{ type: String }],
    pastSurgeries: [{ type: String }],
    familyHistory: [{ type: String }],
    ongoingMedications: [{ type: String }],
    notes: { type: String, default: '' },
    updatedBy: { type: String, default: '' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('MedicalHistory', MedicalHistorySchema);
