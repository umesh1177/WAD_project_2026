const mongoose = require('mongoose');
const Appointment = require('../models/Appointment');
const { getClinicQuery } = require('../utils/clinicHelper');

const getAppointments = async (req, res) => {
  try {
    const { date, status, clinicId } = req.query;
    const rawClinicId = req.headers['x-clinic-id'] || req.user?.activeClinicId || req.user?.clinicId || clinicId || 'demo';
    const clinicQuery = await getClinicQuery(rawClinicId);
    const query = { ...clinicQuery };
    if (date) {
      query.$or = [{ date: date }, { appointmentDate: date }];
    }
    if (status) query.status = status;

    const appointments = await Appointment.find(query).sort({ createdAt: -1 });
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
      patientName,
      name,
      familyId,
      familyHead,
      phone,
      area,
      age,
      gender,
      complaint,
      reason,
      vitals,
      date,
      appointmentDate,
      status
    } = req.body;

    const rawClinicId = req.headers['x-clinic-id'] || req.user?.activeClinicId || req.user?.clinicId || req.body.clinicId || 'demo';
    const clinicQuery = await getClinicQuery(rawClinicId);
    const today = date || appointmentDate || new Date().toISOString().slice(0, 10);
    const patName = (patientName || name || 'Patient').trim();
    const finalComplaint = complaint || reason || 'General OPD Consultation';

    // Prevent duplicate queue entry for the same patient today
    const patIdClean = (patientId || '').trim();
    const checkQuery = {
      $and: [
        { $or: [{ date: today }, { appointmentDate: today }] },
        { status: { $in: ['Waiting', 'In-Consultation'] } },
        clinicQuery
      ]
    };
    if (patIdClean && !patIdClean.startsWith('PAT-')) {
      checkQuery.$and.push({ patientId: patIdClean });
    } else {
      checkQuery.$and.push({ patientName: patName.toUpperCase() });
    }

    const existingQueueItem = await Appointment.findOne(checkQuery);
    if (existingQueueItem) {
      return res.status(200).json({
        success: true,
        message: `${patName} is already in today's active queue (Token ${existingQueueItem.token})`,
        data: existingQueueItem
      });
    }

    let finalToken = token;
    if (!finalToken) {
      const count = await Appointment.countDocuments({
        $or: [{ date: today }, { appointmentDate: today }],
        ...clinicQuery
      });
      let seq = count + 1;
      finalToken = `T-${String(seq).padStart(2, '0')}`;
      let exists = await Appointment.findOne({
        token: finalToken,
        $or: [{ date: today }, { appointmentDate: today }],
        ...clinicQuery
      });
      while (exists) {
        seq++;
        finalToken = `T-${String(seq).padStart(2, '0')}`;
        exists = await Appointment.findOne({
          token: finalToken,
          $or: [{ date: today }, { appointmentDate: today }],
          ...clinicQuery
        });
      }
    }

    const currentTime = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });

    const newAppointment = new Appointment({
      token: finalToken,
      patientId: patientId || '',
      patientName: patName.toUpperCase(),
      name: patName.toUpperCase(),
      familyId: familyId || '',
      familyHead: familyHead || patName,
      phone: phone || '',
      area: area || '',
      age: age || '',
      gender: gender || 'Male',
      complaint: finalComplaint,
      reason: finalComplaint,
      vitals: vitals || {},
      status: status || 'Waiting',
      date: today,
      appointmentDate: today,
      clinicId: rawClinicId,
      arrivedAt: currentTime,
      appointmentTime: currentTime
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

