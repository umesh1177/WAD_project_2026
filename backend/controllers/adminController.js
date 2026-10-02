const User = require('../models/User');
const AuditLog = require('../models/AuditLog');
const Clinic = require('../models/Clinic');
const bcrypt = require('bcryptjs');

// Get all doctors across all clinics
const getDoctors = async (req, res) => {
  try {
    const doctors = await User.find({ role: 'doctor' }).select('-password').lean();
    const clinics = await Clinic.find().lean();
    const clinicMap = {};
    clinics.forEach((c) => {
      clinicMap[c.clinicId] = c.name;
    });

    const formatted = doctors.map((d) => ({
      id: d._id.toString(),
      _id: d._id,
      name: d.name || `Dr. ${d.username}`,
      username: d.username,
      specialty: d.specialization || 'General Physician',
      qualification: d.degree || 'M.B.B.S.',
      regNo: d.regNo || 'G-9035',
      clinicId: d.activeClinicId || (d.clinics?.[0]?.id || 'CLN-001'),
      clinicName: clinicMap[d.activeClinicId] || d.clinics?.[0]?.name || 'Dhyey Main Clinic',
      email: d.email || `${d.username}@dhyeyclinic.com`,
      phone: d.employeeId || '9876543210',
      status: 'Active',
      patients: 120,
      rating: 4.8,
    }));

    res.json({ success: true, count: formatted.length, data: formatted });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Create doctor
const createDoctor = async (req, res) => {
  try {
    const data = req.body || {};
    const { name, username, password, specialty, qualification, regNo, clinicId, clinicName, email, phone } = data;

    const finalUsername = (username || name.toLowerCase().replace(/[^a-z0-9]/g, '') || `doc_${Date.now()}`).trim();
    const existing = await User.findOne({ username: finalUsername });
    if (existing) {
      return res.status(400).json({ success: false, message: `Username "${finalUsername}" already exists` });
    }

    const hashedPassword = await bcrypt.hash(password || 'doctor123', 10);
    const targetClinic = await Clinic.findOne({ clinicId });

    const newDoc = new User({
      username: finalUsername,
      password: hashedPassword,
      role: 'doctor',
      name: name || `Dr. ${finalUsername}`,
      email: email || '',
      employeeId: phone || '',
      specialization: specialty || 'General Physician',
      degree: qualification || 'M.B.B.S.',
      regNo: regNo || 'REG-DOC-2026',
      activeClinicId: clinicId || 'CLN-001',
      clinics: [{ id: clinicId || 'CLN-001', name: clinicName || targetClinic?.name || 'Clinic' }],
    });

    await newDoc.save();

    res.status(201).json({
      success: true,
      message: 'Doctor created successfully',
      data: {
        id: newDoc._id.toString(),
        name: newDoc.name,
        username: newDoc.username,
        specialty: newDoc.specialization,
        qualification: newDoc.degree,
        regNo: newDoc.regNo,
        clinicId: newDoc.activeClinicId,
        clinicName: clinicName || targetClinic?.name || 'Clinic',
        email: newDoc.email,
        phone: newDoc.employeeId,
        status: 'Active',
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Update doctor
const updateDoctor = async (req, res) => {
  try {
    const { id } = req.params;
    const data = req.body || {};
    const updateFields = {};

    if (data.name) updateFields.name = data.name;
    if (data.specialty) updateFields.specialization = data.specialty;
    if (data.qualification) updateFields.degree = data.qualification;
    if (data.regNo) updateFields.regNo = data.regNo;
    if (data.email) updateFields.email = data.email;
    if (data.phone) updateFields.employeeId = data.phone;
    if (data.clinicId) {
      updateFields.activeClinicId = data.clinicId;
      updateFields.clinics = [{ id: data.clinicId, name: data.clinicName || 'Clinic' }];
    }
    if (data.password) {
      updateFields.password = await bcrypt.hash(data.password, 10);
    }

    const updated = await User.findByIdAndUpdate(id, updateFields, { new: true });
    if (!updated) {
      return res.status(404).json({ success: false, message: 'Doctor not found' });
    }

    res.json({ success: true, message: 'Doctor updated successfully', data: updated });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Delete doctor
const deleteDoctor = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await User.findByIdAndDelete(id);
    if (!deleted) {
      return res.status(404).json({ success: false, message: 'Doctor not found' });
    }
    res.json({ success: true, message: 'Doctor deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Admin Accounts
const getAdminAccounts = async (req, res) => {
  try {
    const admins = await User.find({ role: 'admin' }).select('-password').lean();
    const formatted = admins.map((a) => ({
      id: a._id.toString(),
      _id: a._id,
      name: a.name || a.username,
      username: a.username,
      email: a.email || `${a.username}@dhyeyclinic.com`,
      role: 'Super Administrator',
      permissions: ['all_clinics', 'user_management', 'system_config', 'export_data', 'billing_control'],
      status: 'Active',
      lastActive: 'Just now',
    }));
    res.json({ success: true, count: formatted.length, data: formatted });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const createAdminAccount = async (req, res) => {
  try {
    const { username, password, name, email } = req.body;
    if (!username || !password) {
      return res.status(400).json({ success: false, message: 'Username and password are required' });
    }

    const existing = await User.findOne({ username: username.trim() });
    if (existing) {
      return res.status(400).json({ success: false, message: 'Username already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newAdmin = new User({
      username: username.trim(),
      password: hashedPassword,
      role: 'admin',
      name: name || username,
      email: email || '',
    });
    await newAdmin.save();

    res.status(201).json({
      success: true,
      message: 'Admin account created successfully',
      data: {
        id: newAdmin._id.toString(),
        name: newAdmin.name,
        username: newAdmin.username,
        email: newAdmin.email,
        role: 'Super Administrator',
        status: 'Active',
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const deleteAdminAccount = async (req, res) => {
  try {
    const { id } = req.params;
    const target = await User.findById(id);
    if (!target) {
      return res.status(404).json({ success: false, message: 'Admin account not found' });
    }
    if (target.username === 'admin') {
      return res.status(400).json({ success: false, message: 'Cannot delete primary root admin' });
    }
    await User.findByIdAndDelete(id);
    res.json({ success: true, message: 'Admin account deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Activity Logs
const getAuditLogs = async (req, res) => {
  try {
    const logs = await AuditLog.find().sort({ timestamp: -1 }).limit(100);
    res.json({ success: true, count: logs.length, data: logs });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const createAuditLog = async (req, res) => {
  try {
    const { action, actor, module, details } = req.body;
    const log = new AuditLog({
      action: action || 'Action',
      actor: actor || req.user?.name || req.user?.username || 'Admin',
      module: module || 'System',
      details: details || '',
      timestamp: new Date(),
    });
    await log.save();
    res.status(201).json({ success: true, data: log });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getDoctors,
  createDoctor,
  updateDoctor,
  deleteDoctor,
  getAdminAccounts,
  createAdminAccount,
  deleteAdminAccount,
  getAuditLogs,
  createAuditLog,
};
