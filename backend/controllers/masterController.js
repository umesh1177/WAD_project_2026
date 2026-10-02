const MasterData = require('../models/MasterData');

exports.getMasters = async (req, res) => {
    try {
        const data = await MasterData.find({});
        res.status(200).json({ success: true, count: data.length, data });
    } catch (error) {
        res.status(400).json({ success: false, error: error.message });
    }
};

exports.createMaster = async (req, res) => {
    try {
        const data = await MasterData.create(req.body);
        res.status(201).json({ success: true, data });
    } catch (error) {
        res.status(400).json({ success: false, error: error.message });
    }
};

exports.deleteMaster = async (req, res) => {
    try {
        const data = await MasterData.findByIdAndDelete(req.params.id);
        if (!data) return res.status(404).json({ success: false, error: 'Not found' });
        res.status(200).json({ success: true, data: {} });
    } catch (error) {
        res.status(400).json({ success: false, error: error.message });
    }
};
