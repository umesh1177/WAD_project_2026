const Diagnosis = require('../models/Diagnosis');
const Consultation = require('../models/Consultation');

// Get all diagnoses
const getDiagnoses = async (req, res) => {
  try {
    const clinicId = req.headers['x-clinic-id'] || req.user?.activeClinicId || 'demo';
    const diagnoses = await Diagnosis.find({ clinicId }).sort({ name: 1 });
    res.json({ success: true, count: diagnoses.length, data: diagnoses });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Create diagnosis
const createDiagnosis = async (req, res) => {
  try {
    const { name, code, category, description, commonTreatments } = req.body;
    const clinicId = req.headers['x-clinic-id'] || req.user?.activeClinicId || 'demo';

    if (!name || !name.trim()) {
      return res.status(400).json({ success: false, message: 'Diagnosis name is required' });
    }

    const newDiag = new Diagnosis({
      name: name.trim(),
      category: category || 'General',
      description: description || '',
      clinicId,
    });

    await newDiag.save();
    res.status(201).json({ success: true, message: 'Diagnosis added', data: newDiag });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Delete diagnosis
const deleteDiagnosis = async (req, res) => {
  try {
    const { id } = req.params;
    await Diagnosis.findByIdAndDelete(id);
    res.json({ success: true, message: 'Diagnosis deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Diagnosis analytics/frequencies
const getDiagnosisAnalytics = async (req, res) => {
  try {
    const clinicId = req.headers['x-clinic-id'] || req.user?.activeClinicId || 'demo';
    const visits = await Consultation.find({ clinicId });

    const counts = {};
    visits.forEach((v) => {
      if (v.diagnosis && v.diagnosis.trim()) {
        const d = v.diagnosis.trim();
        counts[d] = (counts[d] || 0) + 1;
      }
    });

    const sorted = Object.entries(counts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count);

    res.json({ success: true, data: sorted });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getDiagnoses,
  createDiagnosis,
  deleteDiagnosis,
  getDiagnosisAnalytics,
};
