const Appointment = require('../models/Appointment');
const Patient = require('../models/Patient');
const { todayISO } = require('../utils/generateId');

// Get appointments
const getAppointments = async (req, res) => {
  try {
    const clinicId = req.headers['x-clinic-id'] || req.user?.activeClinicId || 'demo';
    const { date, status } = req.query;

    const query = { clinicId };
    if (date) query.appointmentDate = date;
    if (status) query.status = status;

    const appointments = await Appointment.find(query).sort({ appointmentDate: 1, appointmentTime: 1 });
    res.json({ success: true, count: appointments.length, data: appointments });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Create / Schedule appointment
const createAppointment = async (req, res) => {
  try {
    const clinicId = req.headers['x-clinic-id'] || req.user?.activeClinicId || 'demo';
    const { patientId, appointmentDate, appointmentTime, reason, notes } = req.body;

    if (!patientId || !appointmentDate) {
      return res.status(400).json({ success: false, message: 'Patient ID and date are required' });
    }

    const patient = await Patient.findOne({ patId: patientId, clinicId });
    const patientName = patient ? patient.name : req.body.patientName || 'Patient';
    const familyId = patient ? patient.familyId : '';

    const newAppointment = new Appointment({
      patientId,
      familyId,
      patientName,
      clinicId,
      doctorId: req.user?.id || 'demo',
      appointmentDate,
      appointmentTime: appointmentTime || '10:00',
      reason: reason || 'Consultation',
      notes: notes || '',
    });

    await newAppointment.save();

    res.status(201).json({
      success: true,
      message: 'Appointment booked successfully',
      data: newAppointment,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Update appointment status
const updateAppointment = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, appointmentDate, appointmentTime, notes } = req.body;

    const updated = await Appointment.findByIdAndUpdate(
      id,
      {
        ...(status && { status }),
        ...(appointmentDate && { appointmentDate }),
        ...(appointmentTime && { appointmentTime }),
        ...(notes !== undefined && { notes }),
      },
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({ success: false, message: 'Appointment not found' });
    }

    res.json({ success: true, message: 'Appointment updated', data: updated });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Delete appointment
const deleteAppointment = async (req, res) => {
  try {
    const { id } = req.params;
    await Appointment.findByIdAndDelete(id);
    res.json({ success: true, message: 'Appointment deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getAppointments,
  createAppointment,
  updateAppointment,
  deleteAppointment,
};
