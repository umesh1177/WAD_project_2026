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
    const { headName, society, area, phone } = req.body;
    const count = await Family.countDocuments();
    const famId = `FAM-${String(count + 1).padStart(4, '0')}`;

    const newFamily = new Family({
      famId, headName, society, area, phone
    });
    await newFamily.save();
    res.status(201).json({ success: true, data: newFamily });
  } catch (error) {
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
