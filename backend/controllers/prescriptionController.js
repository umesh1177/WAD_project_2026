const Prescription = require('../models/Prescription');
const Consultation = require('../models/Consultation');
const Patient = require('../models/Patient');
const User = require('../models/User');
const { getDietaryLibrary, expandDietaryAdvice } = require('../services/prescriptionService');

// Get prescriptions
const getPrescriptions = async (req, res) => {
  try {
    const clinicId = req.headers['x-clinic-id'] || req.user?.activeClinicId || 'demo';
    const { patientId, caseId } = req.query;

    const query = { clinicId };
    if (patientId) query.patientId = patientId;
    if (caseId) query.caseId = caseId;

    const list = await Prescription.find(query).sort({ createdAt: -1 });
    res.json({ success: true, count: list.length, data: list });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Create or update prescription
const createPrescription = async (req, res) => {
  try {
    const clinicId = req.headers['x-clinic-id'] || req.user?.activeClinicId || 'demo';
    const { caseId, patientId, familyId, medicines, dietaryAdvice, dietaryCodes } = req.body;

    if (!caseId || !patientId) {
      return res.status(400).json({ success: false, message: 'Case ID and Patient ID are required' });
    }

    const rx = await Prescription.findOneAndUpdate(
      { caseId, clinicId },
      {
        caseId,
        patientId,
        familyId,
        clinicId,
        doctorId: req.user?.id || 'demo',
        medicines: medicines || [],
        dietaryAdvice: dietaryAdvice || '',
        dietaryCodes: dietaryCodes || [],
      },
      { new: true, upsert: true }
    );

    res.status(201).json({ success: true, message: 'Prescription saved', data: rx });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get dietary shortcuts library
const getDietary = (req, res) => {
  res.json({ success: true, data: getDietaryLibrary() });
};

// Get printable preview data for prescription
const getPrintData = async (req, res) => {
  try {
    const { caseId } = req.params;
    const clinicId = req.headers['x-clinic-id'] || req.user?.activeClinicId || 'demo';

    const visit = await Consultation.findOne({ caseId, clinicId });
    if (!visit) {
      return res.status(404).json({ success: false, message: 'Visit not found' });
    }

    const patient = await Patient.findOne({ patId: visit.patientId, clinicId });
    const mongoose = require('mongoose');
    let doctor = null;
    if (visit.doctorId && mongoose.Types.ObjectId.isValid(visit.doctorId)) {
      doctor = await User.findById(visit.doctorId);
    } else if (visit.doctorId) {
      doctor = await User.findOne({ username: visit.doctorId });
    }
    if (!doctor) {
      doctor = { name: 'Dr. Chirag Paghdal', username: 'dhyey', degree: 'B.H.M.S.', regNo: 'G-9035' };
    }

    res.json({
      success: true,
      data: {
        visit,
        patient,
        doctor,
        dietaryLibrary: getDietaryLibrary(),
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getPrescriptions,
  createPrescription,
  getDietary,
  getPrintData,
};
