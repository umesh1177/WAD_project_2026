const mongoose = require('mongoose');
const Diagnosis = require('../models/Diagnosis');
const Consultation = require('../models/Consultation');

// Get all diagnoses
const getDiagnoses = async (req, res) => {
  try {
    const clinicId = req.headers['x-clinic-id'] || req.user?.activeClinicId || 'demo';
    const diagnoses = await Diagnosis.find().sort({ name: 1 });
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

    let existing = await Diagnosis.findOne({ name: name.trim() });
    if (existing) {
      Object.assign(existing, req.body);
      await existing.save();
      return res.status(200).json({ success: true, message: 'Diagnosis updated', data: existing });
    }

    const newDiag = new Diagnosis({
      name: name.trim(),
      code: (code || '').trim(),
      category: category || 'General',
      description: description || '',
      commonTreatments: commonTreatments || [],
      clinicId,
    });

    await newDiag.save();
    res.status(201).json({ success: true, message: 'Diagnosis added', data: newDiag });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Update diagnosis
const updateDiagnosis = async (req, res) => {
  try {
    const { id } = req.params;
    let query = { name: id };
    if (mongoose.Types.ObjectId.isValid(id)) {
      query = { $or: [{ _id: id }, { name: id }] };
    }

    const updated = await Diagnosis.findOneAndUpdate(query, { $set: req.body }, { new: true });
    if (!updated) {
      return res.status(404).json({ success: false, message: 'Diagnosis not found for update' });
    }
    res.json({ success: true, message: 'Diagnosis updated', data: updated });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Delete diagnosis
const deleteDiagnosis = async (req, res) => {
  try {
    const { id } = req.params;
    let query = { name: id };
    if (mongoose.Types.ObjectId.isValid(id)) {
      query = { $or: [{ _id: id }, { name: id }] };
    }

    await Diagnosis.findOneAndDelete(query);
    res.json({ success: true, message: 'Diagnosis deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Diagnosis analytics/frequencies
const getDiagnosisAnalytics = async (req, res) => {
  try {
    const clinicId = req.headers['x-clinic-id'] || req.user?.activeClinicId || 'demo';
    const visits = await Consultation.find();

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
  updateDiagnosis,
  deleteDiagnosis,
  getDiagnosisAnalytics,
};
