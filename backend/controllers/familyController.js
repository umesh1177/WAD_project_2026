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
    const { headName, age, bloodGroup, society, registeredBy, allergy, area, phone, address, famId: customFamId } = req.body;
    const clinicId = req.headers['x-clinic-id'] || req.user?.activeClinicId || 'demo';

    if (!headName || !headName.trim()) {
      return res.status(400).json({ success: false, message: 'Family head name is required' });
    }

    const currentYear = new Date().getFullYear();
    const cleanClinicCode = (clinicId === 'demo' ? '0001' : (String(clinicId).replace(/\D/g, '') || String(clinicId).toUpperCase().replace(/[^A-Z0-9]/g, '')).padStart(4, '0').slice(-4)) || '0001';

    const countFam = await Family.countDocuments({ clinicId, year: currentYear });
    const sequence = countFam + 1;
    const nextFamId = customFamId || `${cleanClinicCode}${currentYear}${pad(sequence, 4)}`;

    const famSeqCode = pad(sequence, 4);
    const nextPatId = `${famSeqCode}0001`;

    const newFamily = new Family({
      famId: nextFamId,
      headName: headName.trim().toUpperCase(),
      society: (society || '').trim(),
      registeredBy: registeredBy || 'Self',
      area: (area || '').trim(),
      phone: (phone || '').trim(),
      address: (address || '').trim(),
      year: currentYear,
      sequence,
      clinicId,
    });
    await newFamily.save();

    // Auto-create head as the first patient member
    const newPatient = new Patient({
      patId: nextPatId,
      familyId: nextFamId,
      name: headName.trim().toUpperCase(),
      relation: 'Head',
      age: age ? String(age).trim() : '',
      bloodGroup: (bloodGroup || '').trim(),
      allergy: (allergy || '').trim(),
      society: (society || '').trim(),
      area: (area || '').trim(),
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

// Update family & sync Head of Family patient
const updateFamily = async (req, res) => {
  try {
    const { id } = req.params;
    const clinicId = req.headers['x-clinic-id'] || req.user?.activeClinicId || 'demo';
    const { headName, age, bloodGroup, society, registeredBy, allergy, area, phone, address } = req.body;

    const updated = await Family.findOneAndUpdate(
      { famId: id, clinicId },
      {
        ...(headName && { headName: headName.trim().toUpperCase() }),
        ...(society !== undefined && { society: society.trim() }),
        ...(registeredBy !== undefined && { registeredBy }),
        ...(area !== undefined && { area: area.trim() }),
        ...(phone !== undefined && { phone: phone.trim() }),
        ...(address !== undefined && { address: address.trim() }),
      },
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({ success: false, message: 'Family not found' });
    }

    // Sync Head patient record
    const headPatient = await Patient.findOneAndUpdate(
      { familyId: id, relation: 'Head', clinicId },
      {
        ...(headName && { name: headName.trim().toUpperCase() }),
        ...(age !== undefined && { age: String(age).trim() }),
        ...(bloodGroup !== undefined && { bloodGroup: bloodGroup.trim() }),
        ...(allergy !== undefined && { allergy: allergy.trim() }),
        ...(society !== undefined && { society: society.trim() }),
        ...(area !== undefined && { area: area.trim() }),
        ...(phone !== undefined && { phone: phone.trim() }),
      },
      { new: true }
    );

    res.json({
      success: true,
      message: 'Family head details updated successfully',
      data: {
        family: updated,
        headPatient,
      },
    });
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
