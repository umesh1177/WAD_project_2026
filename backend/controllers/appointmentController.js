const mongoose = require('mongoose');
const Appointment = require('../models/Appointment');

const getAppointments = async (req, res) => {
  try {
    const { date, status, clinicId } = req.query;
    const activeClinicId = req.headers['x-clinic-id'] || req.user?.activeClinicId || clinicId || 'demo';
    const query = {};
    if (date) query.date = date;
    if (status) query.status = status;

    const appointments = await Appointment.find(query).sort({ date: -1, arrivedAt: -1, createdAt: -1 });
    res.json({ success: true, count: appointments.length, data: appointments });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const createAppointment = async (req, res) => {
  try {
    const {
      token,
      patientId,
      name,
      familyHead,
      phone,
      area,
      age,
      gender,
      complaint,
      vitals,
      date,
      status
    } = req.body;

    const clinicId = req.headers['x-clinic-id'] || req.user?.activeClinicId || 'demo';
    const today = date || new Date().toISOString().slice(0, 10);

    let finalToken = token;
    if (!finalToken) {
      const count = await Appointment.countDocuments({ date: today });
      finalToken = `T-${String(count + 1).padStart(2, '0')}`;
    }

    const newAppointment = new Appointment({
      token: finalToken,
      patientId: patientId || '',
      name: (name || '').trim().toUpperCase(),
      familyHead: familyHead || '',
      phone: phone || '',
      area: area || '',
      age: age || '',
      gender: gender || 'Male',
      complaint: complaint || '',
      vitals: vitals || {},
      status: status || 'Waiting',
      date: today,
      clinicId,
      arrivedAt: new Date().toISOString()
    });

    await newAppointment.save();
    res.status(201).json({ success: true, message: 'Appointment added to queue', data: newAppointment });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const updateAppointment = async (req, res) => {
  try {
    const { id } = req.params;
    let query = { token: id };
    if (mongoose.Types.ObjectId.isValid(id)) {
      query = { $or: [{ _id: id }, { token: id }] };
    }

    const updated = await Appointment.findOneAndUpdate(query, { $set: req.body }, { new: true });
    if (!updated) {
      return res.status(404).json({ success: false, message: 'Appointment not found for update' });
    }

    res.json({ success: true, message: 'Appointment updated', data: updated });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const deleteAppointment = async (req, res) => {
  try {
    const { id } = req.params;
    let query = { token: id };
    if (mongoose.Types.ObjectId.isValid(id)) {
      query = { $or: [{ _id: id }, { token: id }] };
    }

    await Appointment.findOneAndDelete(query);
    res.json({ success: true, message: 'Appointment deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { getAppointments, createAppointment, updateAppointment, deleteAppointment };
