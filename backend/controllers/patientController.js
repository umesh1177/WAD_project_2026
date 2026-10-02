const Patient = require('../models/Patient');
const Family = require('../models/Family');
const Consultation = require('../models/Consultation');
const { pad } = require('../utils/generateId');

// Get all patients with family info and visits summary
const getPatients = async (req, res) => {
  try {
    const clinicId = req.headers['x-clinic-id'] || req.user?.activeClinicId || 'demo';
    const patients = await Patient.find({ clinicId }).sort({ patId: 1 });
    const families = await Family.find({ clinicId });
    const consultations = await Consultation.find({ clinicId });

    const famMap = {};
    families.forEach((f) => {
      famMap[f.famId] = f;
    });

    const result = patients.map((pat) => {
      const patVisits = consultations.filter((c) => c.patientId === pat.patId);
      const totalDue = patVisits.reduce((acc, v) => acc + (Number(v.due) || 0), 0);
      const lastVisit = patVisits.length > 0 ? patVisits[patVisits.length - 1] : null;

      return {
        ...pat.toObject(),
        family: famMap[pat.familyId] || null,
        visits: patVisits,
        totalDue,
        lastVisit,
      };
    });

    res.json({ success: true, count: result.length, data: result });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get single patient by patId
const getPatientById = async (req, res) => {
  try {
    const { id } = req.params;
    const clinicId = req.headers['x-clinic-id'] || req.user?.activeClinicId || 'demo';

    const patient = await Patient.findOne({ patId: id, clinicId });
    if (!patient) {
      return res.status(404).json({ success: false, message: 'Patient not found' });
    }

    const family = await Family.findOne({ famId: patient.familyId, clinicId });
    const visits = await Consultation.find({ patientId: id, clinicId }).sort({ createdAt: 1 });
    const totalDue = visits.reduce((acc, v) => acc + (Number(v.due) || 0), 0);

    res.json({
      success: true,
      data: {
        ...patient.toObject(),
        family,
        visits,
        totalDue,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Add new member to an existing family
const createPatientMember = async (req, res) => {
  try {
    const { familyId, name, relation, age, gender, bloodGroup, allergy, society, area, phone } = req.body;
    const clinicId = req.headers['x-clinic-id'] || req.user?.activeClinicId || 'demo';

    if (!familyId || !name || !name.trim()) {
      return res.status(400).json({ success: false, message: 'Family ID and member name are required' });
    }

    const family = await Family.findOne({ famId: familyId, clinicId });
    if (!family) {
      return res.status(404).json({ success: false, message: 'Family not found' });
    }

    const famSeqCode = (familyId || '').slice(-4) || pad(family.sequence || 1, 4);
    const memberCount = await Patient.countDocuments({ familyId, clinicId });
    const nextPatId = `${famSeqCode}${pad(memberCount + 1, 4)}`;

    const newPatient = new Patient({
      patId: nextPatId,
      familyId,
      name: name.trim().toUpperCase(),
      relation: (relation || 'Member').trim(),
      age: (age || '').trim(),
      gender: gender || 'Male',
      bloodGroup: (bloodGroup || '').trim().toUpperCase(),
      allergy: (allergy || '').trim().toUpperCase(),
      society: (society !== undefined ? society : family.society || '').trim(),
      area: (area !== undefined ? area : family.area || '').trim(),
      phone: (phone || family.phone || '').trim(),
      clinicId,
    });

    await newPatient.save();

    res.status(201).json({
      success: true,
      message: `${newPatient.name} added to family ${familyId}`,
      data: newPatient,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Update patient
const updatePatient = async (req, res) => {
  try {
    const { id } = req.params;
    const clinicId = req.headers['x-clinic-id'] || req.user?.activeClinicId || 'demo';
    const { name, relation, age, gender, bloodGroup, allergy, phone } = req.body;

    const updated = await Patient.findOneAndUpdate(
      { patId: id, clinicId },
      {
        ...(name && { name: name.trim().toUpperCase() }),
        ...(relation !== undefined && { relation: relation.trim() }),
        ...(age !== undefined && { age: String(age).trim() }),
        ...(gender !== undefined && { gender }),
        ...(bloodGroup !== undefined && { bloodGroup: bloodGroup.trim().toUpperCase() }),
        ...(allergy !== undefined && { allergy: allergy.trim().toUpperCase() }),
        ...(phone !== undefined && { phone: phone.trim() }),
      },
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({ success: false, message: 'Patient not found' });
    }

    res.json({ success: true, message: 'Patient updated successfully', data: updated });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Delete patient
const deletePatient = async (req, res) => {
  try {
    const { id } = req.params;
    const clinicId = req.headers['x-clinic-id'] || req.user?.activeClinicId || 'demo';

    await Patient.findOneAndDelete({ patId: id, clinicId });
    await Consultation.deleteMany({ patientId: id, clinicId });

    res.json({ success: true, message: `Patient ${id} deleted successfully` });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getPatients,
  getPatientById,
  createPatientMember,
  updatePatient,
  deletePatient,
};
