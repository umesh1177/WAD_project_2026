const mongoose = require('mongoose');
const Patient = require('../models/Patient');
const Family = require('../models/Family');
const Consultation = require('../models/Consultation');

const getPatients = async (req, res) => {
  try {
    const { familyId, search } = req.query;
    const query = {};
    if (familyId) query.familyId = familyId;
    if (search && search.trim()) {
      query.name = { $regex: search.trim(), $options: 'i' };
    }

    const patients = await Patient.find(query).sort({ createdAt: -1 });
    res.json({ success: true, count: patients.length, data: patients });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getPatientById = async (req, res) => {
  try {
    const { id } = req.params;
    let query = { patId: id };
    if (mongoose.Types.ObjectId.isValid(id)) {
      query = { $or: [{ _id: id }, { patId: id }] };
    }

    const patient = await Patient.findOne(query);
    if (!patient) return res.status(404).json({ success: false, message: 'Patient not found' });

    let visitQuery = { $or: [{ patientId: patient.patId }, ...(mongoose.Types.ObjectId.isValid(patient._id) ? [{ patientId: patient._id }, { patientId: String(patient._id) }] : [])] };
    const visits = await Consultation.find(visitQuery).sort({ date: -1 });

    let famQuery = { famId: patient.familyId };
    if (mongoose.Types.ObjectId.isValid(patient.familyId)) {
      famQuery = { $or: [{ famId: patient.familyId }, { _id: patient.familyId }] };
    }
    const family = await Family.findOne(famQuery);

    res.json({ success: true, data: { ...patient.toObject(), visits, family } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const createPatientMember = async (req, res) => {
  try {
    const {
      patId,
      familyId,
      name,
      relation,
      age,
      gender,
      bloodGroup,
      allergy,
      society,
      area,
      phone
    } = req.body;

    const clinicId = req.headers['x-clinic-id'] || req.user?.activeClinicId || 'demo';

    let fam = await Family.findOne({
      $or: [{ famId: familyId }, ...(mongoose.Types.ObjectId.isValid(familyId) ? [{ _id: familyId }] : [])]
    });

    let finalFamId = fam ? fam.famId : familyId;

    let finalPatId = patId;
    if (!finalPatId) {
      const count = await Patient.countDocuments({ familyId: finalFamId });
      let seq = count + 1;
      finalPatId = `${finalFamId}-${String(seq).padStart(2, '0')}`;
      let exists = await Patient.findOne({ patId: finalPatId });
      while (exists) {
        seq++;
        finalPatId = `${finalFamId}-${String(seq).padStart(2, '0')}`;
        exists = await Patient.findOne({ patId: finalPatId });
      }
    }

    // Check if patient already exists
    let existingPat = await Patient.findOne({ patId: finalPatId });
    if (existingPat) {
      Object.assign(existingPat, req.body);
      await existingPat.save();
      return res.status(200).json({ success: true, data: existingPat });
    }

    const newPatient = new Patient({
      patId: finalPatId,
      familyId: finalFamId,
      name: (name || '').trim().toUpperCase(),
      relation: relation || 'Member',
      age: age || '',
      gender: gender || 'Male',
      bloodGroup: bloodGroup || '',
      allergy: allergy || '',
      society: society || fam?.society || '',
      area: area || fam?.area || '',
      phone: phone || fam?.phone || '',
      clinicId
    });

    await newPatient.save();
    res.status(201).json({ success: true, message: 'Member added successfully', data: newPatient });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const updatePatient = async (req, res) => {
  try {
    const { id } = req.params;
    let query = { patId: id };
    if (mongoose.Types.ObjectId.isValid(id)) {
      query = { $or: [{ _id: id }, { patId: id }] };
    }

    const updated = await Patient.findOneAndUpdate(query, { $set: req.body }, { new: true });
    if (!updated) {
      return res.status(404).json({ success: false, message: 'Patient not found for update' });
    }

    // If updating head of family, sync family details
    if (updated.relation === 'Head' || (updated.patId && updated.patId.endsWith('-01'))) {
      const famQuery = mongoose.Types.ObjectId.isValid(updated.familyId)
        ? { $or: [{ famId: updated.familyId }, { _id: updated.familyId }] }
        : { famId: updated.familyId };

      const updateData = {};
      if (req.body.name) updateData.headName = req.body.name;
      if (req.body.society !== undefined) updateData.society = req.body.society;
      if (req.body.area !== undefined) updateData.area = req.body.area;
      if (req.body.phone !== undefined) updateData.phone = req.body.phone;
      if (req.body.age !== undefined) updateData.age = req.body.age;
      if (req.body.bloodGroup !== undefined) updateData.bloodGroup = req.body.bloodGroup;
      if (req.body.allergy !== undefined) updateData.allergy = req.body.allergy;

      if (Object.keys(updateData).length > 0) {
        await Family.findOneAndUpdate(famQuery, { $set: updateData });
      }
    }

    res.json({ success: true, message: 'Patient details updated', data: updated });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const deletePatient = async (req, res) => {
  try {
    const { id } = req.params;
    let query = { patId: id };
    if (mongoose.Types.ObjectId.isValid(id)) {
      query = { $or: [{ _id: id }, { patId: id }] };
    }

    const pat = await Patient.findOneAndDelete(query);
    if (pat) {
      await Consultation.deleteMany({
        $or: [{ patientId: pat.patId }, ...(mongoose.Types.ObjectId.isValid(pat._id) ? [{ patientId: pat._id }] : [])]
      });
    }
    res.json({ success: true, message: 'Patient deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { getPatients, getPatientById, createPatientMember, updatePatient, deletePatient };
