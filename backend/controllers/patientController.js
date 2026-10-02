const Patient = require('../models/Patient');
const Family = require('../models/Family');
const Consultation = require('../models/Consultation');

const getPatients = async (req, res) => {
  try {
    const patients = await Patient.find().populate('familyId');
    res.json({ success: true, count: patients.length, data: patients });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getPatientById = async (req, res) => {
  try {
    const { id } = req.params;
    const patient = await Patient.findOne({ patId: id }).populate('familyId');
    if (!patient) return res.status(404).json({ success: false, message: 'Not found' });
    const visits = await Consultation.find({ patientId: patient._id });
    res.json({ success: true, data: { ...patient.toObject(), visits } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const createPatientMember = async (req, res) => {
  try {
    const { familyId, name, relation, age, gender, bloodGroup, allergy, society, area, phone } = req.body;
    let famIdRef = familyId;
    let fam = await Family.findById(famIdRef).catch(() => null);
    if (!fam) {
      if (req.body.famId) fam = await Family.findOne({ famId: req.body.famId });
      if (fam) famIdRef = fam._id;
    }

    const count = await Patient.countDocuments();
    const patId = `PAT-${String(count + 1).padStart(4, '0')}`;

    const newPatient = new Patient({
      patId,
      familyId: famIdRef,
      name, relation, age, gender, bloodGroup, allergy,
      society: society || fam?.society,
      area: area || fam?.area,
      phone: phone || fam?.phone
    });

    await newPatient.save();
    res.status(201).json({ success: true, data: newPatient });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const updatePatient = async (req, res) => {
  try {
    const { id } = req.params;
    const updated = await Patient.findOneAndUpdate({ patId: id }, req.body, { new: true });
    res.json({ success: true, data: updated });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const deletePatient = async (req, res) => {
  try {
    const { id } = req.params;
    const pat = await Patient.findOneAndDelete({ patId: id });
    if (pat) await Consultation.deleteMany({ patientId: pat._id });
    res.json({ success: true, message: 'Deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { getPatients, getPatientById, createPatientMember, updatePatient, deletePatient };
