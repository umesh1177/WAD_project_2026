const Family = require('../models/Family');
const Patient = require('../models/Patient');
const Consultation = require('../models/Consultation');
const { pad } = require('../utils/generateId');

// Get all families for the active clinic with their members
const getFamilies = async (req, res) => {
  try {
    const clinicId = req.headers['x-clinic-id'] || req.user?.activeClinicId || 'demo';
    const families = await Family.find({ clinicId }).sort({ createdAt: -1 });
    const patients = await Patient.find({ clinicId });

    // Attach patients mapped to their respective families
    const result = families.map((fam) => {
      const famObj = fam.toObject();
      famObj.patients = {};
      patients
        .filter((p) => p.familyId === fam.famId)
        .forEach((p) => {
          famObj.patients[p.patId] = p;
        });
      return famObj;
    });

    res.json({ success: true, count: result.length, data: result });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get single family by famId
const getFamilyById = async (req, res) => {
  try {
    const { id } = req.params;
    const clinicId = req.headers['x-clinic-id'] || req.user?.activeClinicId || 'demo';

    const family = await Family.findOne({ famId: id, clinicId });
    if (!family) {
      return res.status(404).json({ success: false, message: 'Family not found' });
    }

    const patients = await Patient.find({ familyId: id, clinicId });
    const famObj = family.toObject();
    famObj.patients = {};
    patients.forEach((p) => {
      famObj.patients[p.patId] = p;
    });

    res.json({ success: true, data: famObj });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Create new family + auto-create Head of Family patient
const createFamily = async (req, res) => {
  try {
    const { headName, area, phone, address } = req.body;
    const clinicId = req.headers['x-clinic-id'] || req.user?.activeClinicId || 'demo';

    if (!headName || !headName.trim()) {
      return res.status(400).json({ success: false, message: 'Family head name is required' });
    }

    // Auto-calculate next sequential famId and patId for this clinic
    const countFam = await Family.countDocuments({ clinicId });
    const nextFamId = pad(countFam + 1, 4);

    const countPat = await Patient.countDocuments({ clinicId });
    const nextPatId = pad(countPat + 1, 4);

    const newFamily = new Family({
      famId: nextFamId,
      headName: headName.trim().toUpperCase(),
      area: (area || '').trim(),
      phone: (phone || '').trim(),
      address: (address || '').trim(),
      clinicId,
    });
    await newFamily.save();

    // Auto-create head as the first patient member
    const newPatient = new Patient({
      patId: nextPatId,
      familyId: nextFamId,
      name: headName.trim().toUpperCase(),
      relation: 'Head',
      phone: (phone || '').trim(),
      clinicId,
    });
    await newPatient.save();

    res.status(201).json({
      success: true,
      message: `Family ID ${nextFamId} generated, patient ${nextPatId} added`,
      data: {
        family: newFamily,
        headPatient: newPatient,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Update family
const updateFamily = async (req, res) => {
  try {
    const { id } = req.params;
    const clinicId = req.headers['x-clinic-id'] || req.user?.activeClinicId || 'demo';
    const { headName, area, phone, address } = req.body;

    const updated = await Family.findOneAndUpdate(
      { famId: id, clinicId },
      {
        ...(headName && { headName: headName.trim().toUpperCase() }),
        ...(area !== undefined && { area: area.trim() }),
        ...(phone !== undefined && { phone: phone.trim() }),
        ...(address !== undefined && { address: address.trim() }),
      },
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({ success: false, message: 'Family not found' });
    }

    res.json({ success: true, message: 'Family updated successfully', data: updated });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Delete family & cascade delete patients and visits
const deleteFamily = async (req, res) => {
  try {
    const { id } = req.params;
    const clinicId = req.headers['x-clinic-id'] || req.user?.activeClinicId || 'demo';

    await Family.findOneAndDelete({ famId: id, clinicId });
    await Patient.deleteMany({ familyId: id, clinicId });
    await Consultation.deleteMany({ familyId: id, clinicId });

    res.json({ success: true, message: `Family ${id} and associated records deleted` });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getFamilies,
  getFamilyById,
  createFamily,
  updateFamily,
  deleteFamily,
};
