const Family = require('../models/Family');

const getFamilies = async (req, res) => {
  try {
    const families = await Family.find();
    res.json({ success: true, count: families.length, data: families });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const createFamily = async (req, res) => {
  try {
    const Patient = require('../models/Patient');
    const { famId: explicitFamId, headName, society, area, phone, age, bloodGroup, allergy, registeredBy } = req.body;
    const count = await Family.countDocuments();
    const famId = explicitFamId || `FAM-${String(count + 1).padStart(4, '0')}`;

    const newFamily = new Family({
      famId, headName, society, area, phone, registeredBy: registeredBy || 'Self'
    });
    await newFamily.save();

    // Create the head patient
    const patId = explicitFamId ? (explicitFamId + '0001') : `PAT-${String(await Patient.countDocuments() + 1).padStart(4, '0')}`;
    const newPatient = new Patient({
      patId,
      familyId: famId,
      name: headName,
      relation: 'Head',
      age, bloodGroup, allergy, society, area, phone
    });
    await newPatient.save();

    res.status(201).json({ success: true, data: { family: newFamily, headPatient: newPatient } });
  } catch (error) {
    console.error('Error creating family:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

const getFamilyById = async (req, res) => {
  try {
    const { id } = req.params;
    const family = await Family.findOne({ famId: id });
    if (!family) return res.status(404).json({ success: false, message: 'Not found' });
    res.json({ success: true, data: family });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const updateFamily = async (req, res) => {
  try {
    const { id } = req.params;
    const updated = await Family.findOneAndUpdate({ famId: id }, req.body, { new: true });
    res.json({ success: true, data: updated });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const deleteFamily = async (req, res) => {
  try {
    const { id } = req.params;
    await Family.findOneAndDelete({ famId: id });
    res.json({ success: true, message: 'Deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { getFamilies, getFamilyById, createFamily, updateFamily, deleteFamily };
