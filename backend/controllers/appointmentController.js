const Appointment = require('../models/Appointment');

const getAppointments = async (req, res) => {
  try {
    const { date, status } = req.query;
    const query = {};
    if (date) query.date = date;
    if (status) query.status = status;
    const appointments = await Appointment.find(query).sort({ date: 1, arrivedAt: 1 });
    res.json({ success: true, count: appointments.length, data: appointments });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const createAppointment = async (req, res) => {
  try {
    const { token, patientId, name, familyHead, phone, area, age, gender, complaint, vitals, date } = req.body;

    const today = date || new Date().toISOString().slice(0, 10);
    let finalToken = token;
    if (!finalToken) {
      const count = await Appointment.countDocuments({ date: today });
      finalToken = `T-${String(count + 1).padStart(2, '0')}`;
    }

    const newAppointment = new Appointment({
      token: finalToken,
      patientId: patientId || null,
      name,
      familyHead,
      phone,
      area,
      age,
      gender,
      complaint,
      vitals: vitals || {},
      date: today,
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
    const updated = await Appointment.findByIdAndUpdate(id, req.body, { new: true });
    if (!updated) return res.status(404).json({ success: false, message: 'Not found' });
    res.json({ success: true, data: updated });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const deleteAppointment = async (req, res) => {
  try {
    const { id } = req.params;
    await Appointment.findByIdAndDelete(id);
    res.json({ success: true, message: 'Deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { getAppointments, createAppointment, updateAppointment, deleteAppointment };
