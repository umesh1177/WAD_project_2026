const MedicalHistory = require('../models/MedicalHistory');
const Consultation = require('../models/Consultation');
const Patient = require('../models/Patient');

// Get medical history for a patient
const getMedicalHistory = async (req, res) => {
  try {
    const { patientId } = req.params;
    let history = await MedicalHistory.findOne({ patientId });

    if (!history) {
      history = {
        patientId,
        chronicConditions: [],
        allergies: [],
        pastSurgeries: [],
        familyHistory: [],
        ongoingMedications: [],
        notes: '',
      };
    }

    res.json({ success: true, data: history });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Update medical history
const updateMedicalHistory = async (req, res) => {
  try {
    const { patientId } = req.params;
    const {
      chronicConditions,
      allergies,
      pastSurgeries,
      familyHistory,
      ongoingMedications,
      notes,
    } = req.body;

    const history = await MedicalHistory.findOneAndUpdate(
      { patientId },
      {
        chronicConditions: chronicConditions || [],
        allergies: allergies || [],
        pastSurgeries: pastSurgeries || [],
        familyHistory: familyHistory || [],
        ongoingMedications: ongoingMedications || [],
        notes: notes || '',
        updatedBy: req.user?.username || 'Doctor',
      },
      { new: true, upsert: true }
    );

    res.json({ success: true, message: 'Medical history updated', data: history });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get complete patient timeline
const getPatientTimeline = async (req, res) => {
  try {
    const { patientId } = req.params;
    const clinicId = req.headers['x-clinic-id'] || req.user?.activeClinicId || 'demo';

    const patient = await Patient.findOne({ patId: patientId, clinicId });
    const visits = await Consultation.find({ patientId, clinicId }).sort({ date: -1, time: -1 });
    const history = await MedicalHistory.findOne({ patientId });

    res.json({
      success: true,
      data: {
        patient,
        history,
        visits,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getMedicalHistory,
  updateMedicalHistory,
  getPatientTimeline,
};
