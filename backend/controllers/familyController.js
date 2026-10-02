const mongoose = require('mongoose');
const Family = require('../models/Family');
const Patient = require('../models/Patient');
const Consultation = require('../models/Consultation');

const getFamilies = async (req, res) => {
  try {
    const clinicId = req.headers['x-clinic-id'] || req.user?.activeClinicId || 'demo';
    const families = await Family.find().sort({ createdAt: -1 });
    const allPatients = await Patient.find();

    // Map patients to their families
    const familiesWithPatients = families.map((f) => {
      const famObj = f.toObject();
      const members = allPatients.filter(
        (p) => String(p.familyId) === String(f.famId) || String(p.familyId) === String(f._id)
      );
      famObj.patients = members;
      return famObj;
    });

    res.json({ success: true, count: familiesWithPatients.length, data: familiesWithPatients });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getFamilyById = async (req, res) => {
  try {
    const { id } = req.params;
    let query = { famId: id };
    if (mongoose.Types.ObjectId.isValid(id)) {
      query = { $or: [{ _id: id }, { famId: id }] };
    }

    const family = await Family.findOne(query);
    if (!family) return res.status(404).json({ success: false, message: 'Family not found' });

    const famObj = family.toObject();
    famObj.patients = await Patient.find({
      $or: [{ familyId: family.famId }, { familyId: family._id }]
    });

    res.json({ success: true, data: famObj });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const createFamily = async (req, res) => {
  try {
    const {
      famId,
      headName,
      age,
      bloodGroup,
      allergy,
      society,
      area,
      phone,
      registeredBy,
      year,
      sequence
    } = req.body;

    const clinicId = req.headers['x-clinic-id'] || req.user?.activeClinicId || 'demo';

    let finalFamId = famId;
    if (!finalFamId) {
      const count = await Family.countDocuments();
      finalFamId = `FAM-${String(count + 1).padStart(4, '0')}`;
    }

    // Check if family already exists
    let existingFam = await Family.findOne({ famId: finalFamId });
    if (existingFam) {
      existingFam.headName = headName || existingFam.headName;
      existingFam.society = society !== undefined ? society : existingFam.society;
      existingFam.area = area !== undefined ? area : existingFam.area;
      existingFam.phone = phone !== undefined ? phone : existingFam.phone;
      existingFam.registeredBy = registeredBy || existingFam.registeredBy;
      await existingFam.save();
      return res.status(200).json({ success: true, data: { family: existingFam, ...existingFam.toObject() } });
    }

    const newFamily = new Family({
      famId: finalFamId,
      headName: (headName || '').trim().toUpperCase(),
      age: age || '',
      bloodGroup: bloodGroup || '',
      allergy: allergy || '',
      society: society || '',
      area: area || '',
      phone: phone || '',
      registeredBy: registeredBy || 'Self',
      year: year || new Date().getFullYear(),
      sequence: sequence || 1,
      clinicId
    });

    await newFamily.save();

    // Create the Head member patient
    const headPatId = `${finalFamId}-01`;
    let headPatient = await Patient.findOne({ patId: headPatId });
    if (!headPatient) {
      headPatient = new Patient({
        patId: headPatId,
        familyId: finalFamId,
        name: (headName || '').trim().toUpperCase(),
        relation: 'Head',
        age: age || '',
        gender: 'Male',
        bloodGroup: bloodGroup || '',
        allergy: allergy || '',
        society: society || '',
        area: area || '',
        phone: phone || '',
        clinicId
      });
      await headPatient.save();
    }

    res.status(201).json({
      success: true,
      message: 'Family head registered successfully',
      data: {
        family: newFamily,
        headPatient,
        ...newFamily.toObject()
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const updateFamily = async (req, res) => {
  try {
    const { id } = req.params;
    let query = { famId: id };
    if (mongoose.Types.ObjectId.isValid(id)) {
      query = { $or: [{ _id: id }, { famId: id }] };
    }

    const updated = await Family.findOneAndUpdate(query, { $set: req.body }, { new: true });
    if (!updated) {
      return res.status(404).json({ success: false, message: 'Family not found for update' });
    }

    // Sync Head Patient details if provided
    const { headName, phone, society, area, age, bloodGroup, allergy } = req.body;
    const patUpdate = {};
    if (headName) patUpdate.name = headName.trim().toUpperCase();
    if (phone !== undefined) patUpdate.phone = phone;
    if (society !== undefined) patUpdate.society = society;
    if (area !== undefined) patUpdate.area = area;
    if (age !== undefined) patUpdate.age = age;
    if (bloodGroup !== undefined) patUpdate.bloodGroup = bloodGroup;
    if (allergy !== undefined) patUpdate.allergy = allergy;

    if (Object.keys(patUpdate).length > 0) {
      await Patient.findOneAndUpdate(
        { familyId: updated.famId, relation: 'Head' },
        { $set: patUpdate },
        { new: true }
      );
    }

    res.json({ success: true, message: 'Family details updated', data: updated });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const deleteFamily = async (req, res) => {
  try {
    const { id } = req.params;
    let query = { famId: id };
    if (mongoose.Types.ObjectId.isValid(id)) {
      query = { $or: [{ _id: id }, { famId: id }] };
    }

    const fam = await Family.findOneAndDelete(query);
    if (fam) {
      await Patient.deleteMany({ familyId: fam.famId });
      await Consultation.deleteMany({ familyId: fam.famId });
    }
    res.json({ success: true, message: 'Family and associated records deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { getFamilies, getFamilyById, createFamily, updateFamily, deleteFamily };
