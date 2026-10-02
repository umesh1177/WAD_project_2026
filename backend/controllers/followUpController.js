const FollowUp = require('../models/FollowUp');
const Patient = require('../models/Patient');
const { todayISO } = require('../utils/generateId');

// Get all follow-ups
const getFollowUps = async (req, res) => {
  try {
    const clinicId = req.headers['x-clinic-id'] || req.user?.activeClinicId || 'demo';
    const { date, status, patientId } = req.query;

    const query = { clinicId };
    if (date) query.followUpDate = date;
    if (status) query.status = status;
    if (patientId) query.patientId = patientId;

    const list = await FollowUp.find(query).sort({ followUpDate: 1 });
    res.json({ success: true, count: list.length, data: list });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Schedule a follow-up
const createFollowUp = async (req, res) => {
  try {
    const clinicId = req.headers['x-clinic-id'] || req.user?.activeClinicId || 'demo';
    const { patientId, caseId, followUpDate, reason, notes } = req.body;

    if (!patientId || !followUpDate) {
      return res.status(400).json({ success: false, message: 'Patient ID and follow-up date are required' });
    }

    const patient = await Patient.findOne({ patId: patientId, clinicId });
    const patientName = patient ? patient.name : req.body.patientName || 'Patient';
    const familyId = patient ? patient.familyId : '';

    const newFollowUp = new FollowUp({
      patientId,
      patientName,
      familyId,
      clinicId,
      followUpDate,
      reason: reason || 'Review checkup',
      notes: notes || '',
      status: 'Pending',
    });

    await newFollowUp.save();
    res.status(201).json({ success: true, message: 'Follow-up scheduled', data: newFollowUp });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Update follow-up status
const updateFollowUp = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, followUpDate, notes } = req.body;

    const updated = await FollowUp.findByIdAndUpdate(
      id,
      {
        ...(status && { status }),
        ...(followUpDate && { followUpDate }),
        ...(notes !== undefined && { notes }),
      },
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({ success: false, message: 'Follow-up not found' });
    }

    res.json({ success: true, message: 'Follow-up updated', data: updated });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Delete follow-up
const deleteFollowUp = async (req, res) => {
  try {
    const { id } = req.params;
    await FollowUp.findByIdAndDelete(id);
    res.json({ success: true, message: 'Follow-up deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getFollowUps,
  createFollowUp,
  updateFollowUp,
  deleteFollowUp,
};
