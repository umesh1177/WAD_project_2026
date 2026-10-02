const mongoose = require('mongoose');
const MasterData = require('../models/MasterData');

// Get all master items across all types or filtered
const getAllMasters = async (req, res) => {
  try {
    const clinicId = req.headers['x-clinic-id'] || req.user?.activeClinicId || 'global';
    const items = await MasterData.find({
      $or: [{ clinicId: 'global' }, { clinicId }],
    }).sort({ createdAt: -1 });

    const grouped = {};
    items.forEach((item) => {
      if (!grouped[item.type]) grouped[item.type] = [];
      grouped[item.type].push(item);
    });

    res.json({ success: true, count: items.length, data: grouped });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get master items by type
const getMasterByType = async (req, res) => {
  try {
    const { type } = req.params;
    const clinicId = req.headers['x-clinic-id'] || req.user?.activeClinicId || 'global';

    const items = await MasterData.find({
      type,
      $or: [{ clinicId: 'global' }, { clinicId }],
    }).sort({ createdAt: -1 });

    res.json({ success: true, count: items.length, data: items });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Create new master item in MongoDB Atlas
const createMasterItem = async (req, res) => {
  try {
    const { type } = req.params;
    const clinicId = req.headers['x-clinic-id'] || req.user?.activeClinicId || 'global';
    const body = req.body || {};

    const newItem = new MasterData({
      type,
      clinicId,
      customId: body.id || body.customId || `m_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
      name: (body.name || body.disease || '').trim(),
      code: (body.code || '').trim().toUpperCase(),
      category: (body.category || 'General').trim(),
      description: body.description || '',
      disease: body.disease || '',
      eat: body.eat || '',
      avoid: body.avoid || '',
      text: body.text || '',
      sampleType: body.sampleType || '',
      city: body.city || '',
      pincode: body.pincode || '',
      area: body.area || '',
      form: body.form || '',
      defaultDosage: body.defaultDosage || '',
      unitPrice: Number(body.unitPrice || 0),
      severity: body.severity || '',
      key: body.key || '',
      target: body.target || '',
      title: body.title || '',
      extraData: body.extraData || {},
    });

    await newItem.save();
    res.status(201).json({ success: true, message: 'Master item created', data: newItem });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Update master item in MongoDB Atlas
const updateMasterItem = async (req, res) => {
  try {
    const { type, id } = req.params;
    const clinicId = req.headers['x-clinic-id'] || req.user?.activeClinicId || 'global';
    const body = req.body || {};

    const isMongoId = mongoose.Types.ObjectId.isValid(id);
    const query = isMongoId
      ? { $or: [{ _id: id }, { customId: id }, { code: id }, { name: id }], type }
      : { $or: [{ customId: id }, { code: id }, { name: id }], type };

    const updatePayload = {
      ...(body.name !== undefined && { name: body.name.trim() }),
      ...(body.code !== undefined && { code: body.code.trim().toUpperCase() }),
      ...(body.category !== undefined && { category: body.category.trim() }),
      ...(body.description !== undefined && { description: body.description }),
      ...(body.disease !== undefined && { disease: body.disease }),
      ...(body.eat !== undefined && { eat: body.eat }),
      ...(body.avoid !== undefined && { avoid: body.avoid }),
      ...(body.text !== undefined && { text: body.text }),
      ...(body.sampleType !== undefined && { sampleType: body.sampleType }),
      ...(body.city !== undefined && { city: body.city }),
      ...(body.pincode !== undefined && { pincode: body.pincode }),
      ...(body.area !== undefined && { area: body.area }),
      ...(body.form !== undefined && { form: body.form }),
      ...(body.defaultDosage !== undefined && { defaultDosage: body.defaultDosage }),
      ...(body.unitPrice !== undefined && { unitPrice: Number(body.unitPrice || 0) }),
      ...(body.severity !== undefined && { severity: body.severity }),
      ...(body.key !== undefined && { key: body.key }),
      ...(body.target !== undefined && { target: body.target }),
      ...(body.title !== undefined && { title: body.title }),
    };

    let updated = await MasterData.findOneAndUpdate(query, updatePayload, { new: true });

    if (!updated) {
      // If not found, create new
      updated = new MasterData({
        type,
        clinicId,
        customId: id,
        ...updatePayload,
      });
      await updated.save();
    }

    res.json({ success: true, message: 'Master item updated', data: updated });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Delete master item from MongoDB Atlas
const deleteMasterItem = async (req, res) => {
  try {
    const { type, id } = req.params;
    const isMongoId = mongoose.Types.ObjectId.isValid(id);
    const query = isMongoId
      ? { $or: [{ _id: id }, { customId: id }, { code: id }, { name: id }], type }
      : { $or: [{ customId: id }, { code: id }, { name: id }], type };

    await MasterData.findOneAndDelete(query);
    res.json({ success: true, message: 'Master item deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Bulk sync master items
const bulkSyncMaster = async (req, res) => {
  try {
    const { type } = req.params;
    const clinicId = req.headers['x-clinic-id'] || req.user?.activeClinicId || 'global';
    const { items } = req.body;

    if (!Array.isArray(items)) {
      return res.status(400).json({ success: false, message: 'Items array is required' });
    }

    // Upsert each item
    for (const item of items) {
      const customId = item.id || item.customId || item.code || item.name;
      const filter = {
        type,
        $or: [{ customId }, { name: item.name || '' }, { code: item.code || '' }],
      };

      const doc = {
        type,
        clinicId,
        customId,
        name: (item.name || item.disease || '').trim(),
        code: (item.code || '').trim().toUpperCase(),
        category: (item.category || 'General').trim(),
        description: item.description || '',
        disease: item.disease || '',
        eat: item.eat || '',
        avoid: item.avoid || '',
        text: item.text || '',
        sampleType: item.sampleType || '',
        city: item.city || '',
        pincode: item.pincode || '',
        area: item.area || '',
        form: item.form || '',
        defaultDosage: item.defaultDosage || '',
        unitPrice: Number(item.unitPrice || 0),
        severity: item.severity || '',
        key: item.key || '',
        target: item.target || '',
        title: item.title || '',
      };

      await MasterData.findOneAndUpdate(filter, doc, { upsert: true, new: true });
    }

    const all = await MasterData.find({ type }).sort({ createdAt: -1 });
    res.json({ success: true, message: 'Bulk synced successfully', count: all.length, data: all });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getAllMasters,
  getMasterByType,
  createMasterItem,
  updateMasterItem,
  deleteMasterItem,
  bulkSyncMaster,
};
