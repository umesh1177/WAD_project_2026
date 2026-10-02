const mongoose = require('mongoose');
const MasterData = require('../models/MasterData');

exports.getMasters = async (req, res) => {
  try {
    const clinicId = req.headers['x-clinic-id'] || req.user?.activeClinicId || req.query.clinicId || 'demo';
    const { type } = req.query;
    const query = {
      $or: [
        { clinicId },
        { clinicId: 'demo' },
        { clinicId: { $exists: false } }
      ]
    };
    if (type) query.type = type;
    const data = await MasterData.find(query).sort({ clinicId: -1, name: 1, createdAt: 1 });
    res.status(200).json({ success: true, count: data.length, data });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

exports.createMaster = async (req, res) => {
  try {
    const clinicId = req.body.clinicId || req.headers['x-clinic-id'] || req.user?.activeClinicId || req.query.clinicId || 'demo';
    const { type, name } = req.body;
    if (!type || !name) {
      return res.status(400).json({ success: false, message: 'Type and Name are required' });
    }

    let existing = await MasterData.findOne({ type, name, clinicId });

    if (existing) {
      Object.assign(existing, req.body, { clinicId });
      await existing.save();
      return res.status(200).json({ success: true, message: 'Master item updated', data: existing });
    }

    const data = await MasterData.create({ ...req.body, clinicId });
    res.status(201).json({ success: true, message: 'Master item created', data });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

exports.updateMaster = async (req, res) => {
  try {
    const clinicId = req.body.clinicId || req.headers['x-clinic-id'] || req.user?.activeClinicId || req.query.clinicId || 'demo';
    const { id } = req.params;
    let query = { name: id, clinicId };
    if (mongoose.Types.ObjectId.isValid(id)) {
      query = { _id: id };
    }

    let data = await MasterData.findOneAndUpdate(query, { $set: { ...req.body, clinicId } }, { new: true });
    if (!data) {
      data = await MasterData.create({ ...req.body, name: id, clinicId });
    }
    res.status(200).json({ success: true, message: 'Master item updated', data });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

exports.deleteMaster = async (req, res) => {
  try {
    const clinicId = req.body?.clinicId || req.headers['x-clinic-id'] || req.user?.activeClinicId || req.query.clinicId || 'demo';
    const { id } = req.params;
    let query = { name: id, clinicId };
    if (mongoose.Types.ObjectId.isValid(id)) {
      query = { _id: id };
    }

    let data = await MasterData.findOneAndDelete(query);
    if (!data) {
      data = await MasterData.findOneAndDelete({ name: id });
    }
    res.status(200).json({ success: true, message: 'Master item deleted', data: {} });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};
