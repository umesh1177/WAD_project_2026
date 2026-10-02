const Queue = require('../models/Queue');

// Get today's queue for clinic
const getQueue = async (req, res) => {
  try {
    const clinicId = req.headers['x-clinic-id'] || req.user?.activeClinicId || 'demo';
    const { date, status } = req.query;

    const query = { clinicId };
    if (date) query.queueDate = date;
    if (status) query.status = status;

    const list = await Queue.find(query).sort({ token: 1, createdAt: 1 });
    res.json({ success: true, count: list.length, data: list });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Add / Dispatch patient to queue
const addToQueue = async (req, res) => {
  try {
    const clinicId = req.headers['x-clinic-id'] || req.user?.activeClinicId || 'demo';
    const {
      patientId,
      patientName,
      familyId,
      queueDate,
      queueTime,
      token,
      reason,
      phone,
      age,
      gender,
      allergy,
      notes,
    } = req.body;

    if (!patientId || !patientName) {
      return res.status(400).json({ success: false, message: 'Patient ID and Name are required' });
    }

    const curDate = queueDate || new Date().toISOString().slice(0, 10);
    
    // Auto calculate token if not passed
    let assignedToken = token;
    if (!assignedToken) {
      const highestToken = await Queue.findOne({ clinicId, queueDate: curDate }).sort({ token: -1 });
      assignedToken = (highestToken?.token || 0) + 1;
    }

    const item = new Queue({
      patientId,
      patientName: patientName.trim(),
      familyId: familyId || '',
      clinicId,
      doctorId: req.user?.id || 'demo',
      queueDate: curDate,
      queueTime: queueTime || new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
      token: assignedToken,
      reason: reason || 'General Consultation',
      phone: phone || '',
      age: age || '',
      gender: gender || '',
      allergy: allergy || '',
      status: 'Waiting',
      notes: notes || '',
    });

    await item.save();
    res.status(201).json({ success: true, message: 'Patient added to queue', data: item });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Update status of queue item (Waiting, In Consultation, Completed, Cancelled)
const updateQueueStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const clinicId = req.headers['x-clinic-id'] || req.user?.activeClinicId || 'demo';
    const { status, notes } = req.body;

    const item = await Queue.findOneAndUpdate(
      { _id: id, clinicId },
      {
        ...(status && { status }),
        ...(notes !== undefined && { notes }),
      },
      { new: true }
    );

    if (!item) {
      return res.status(404).json({ success: false, message: 'Queue item not found' });
    }

    res.json({ success: true, message: 'Queue status updated', data: item });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Remove patient from queue
const deleteFromQueue = async (req, res) => {
  try {
    const { id } = req.params;
    const clinicId = req.headers['x-clinic-id'] || req.user?.activeClinicId || 'demo';

    const item = await Queue.findOneAndDelete({ _id: id, clinicId });
    if (!item) {
      // Try finding by patientId / token if not ObjectId
      const altItem = await Queue.findOneAndDelete({ patientId: id, clinicId });
      if (!altItem) {
        return res.status(404).json({ success: false, message: 'Queue item not found' });
      }
    }

    res.json({ success: true, message: 'Queue item removed' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Clear queue for date
const clearQueue = async (req, res) => {
  try {
    const clinicId = req.headers['x-clinic-id'] || req.user?.activeClinicId || 'demo';
    const curDate = req.query.date || new Date().toISOString().slice(0, 10);

    await Queue.deleteMany({ clinicId, queueDate: curDate });
    res.json({ success: true, message: 'Queue cleared for date ' + curDate });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getQueue,
  addToQueue,
  updateQueueStatus,
  deleteFromQueue,
  clearQueue,
};
