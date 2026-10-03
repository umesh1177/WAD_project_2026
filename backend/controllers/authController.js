const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Clinic = require('../models/Clinic');
const ActivityLog = require('../models/ActivityLog');
const { uid } = require('../utils/generateId');

// Safe User filter helper
const getUserFilter = (id) => {
  if (!id) return { username: '__none__' };
  const idStr = String(id).trim();
  if (mongoose.Types.ObjectId.isValid(idStr) && String(new mongoose.Types.ObjectId(idStr)) === idStr) {
    return { $or: [{ _id: idStr }, { username: idStr }, { name: idStr }, { email: idStr }] };
  }
  return { $or: [{ username: idStr }, { name: idStr }, { email: idStr }] };
};

// Generate JWT Token
const generateToken = (user) => {
  return jwt.sign(
    {
      id: user._id || user.id,
      username: user.username,
      role: user.role,
      activeClinicId: user.activeClinicId || user.clinicId || 'demo',
      name: user.name || user.username,
    },
    process.env.JWT_SECRET || 'wad_clinic_super_secure_jwt_token_2026_key',
    { expiresIn: process.env.JWT_EXPIRE || '30d' }
  );
};

// Login user (Admin, Doctor, Receptionist)
const login = async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ success: false, message: 'Please provide both username and password' });
    }

    const u = username.trim().toLowerCase();

    // Check in MongoDB
    let user = await User.findOne({
      $or: [
        { username: u },
        { email: u },
        { username: username.trim() }
      ]
    });

    if (user) {
      const isMatch = (user.password === password) || (await bcrypt.compare(password, user.password).catch(() => false));
      if (!isMatch) {
        return res.status(401).json({ success: false, message: 'Invalid username or password' });
      }

      if (user.status === 'Suspended') {
        return res.status(403).json({ success: false, message: 'Your account has been suspended. Please contact the administrator.' });
      }

      const token = generateToken(user);
      return res.json({
        success: true,
        token,
        user: {
          id: user._id,
          username: user.username,
          role: user.role,
          name: user.name || (user.role === 'doctor' ? `Dr. ${user.username}` : user.username),
          email: user.email,
          degree: user.degree,
          regNo: user.regNo || user.registration,
          clinics: user.clinics && user.clinics.length > 0 ? user.clinics : [{ id: user.clinicId || 'demo', name: user.clinic || 'Dhyey Main Clinic' }],
          activeClinicId: user.activeClinicId || user.clinicId || 'demo',
          services: user.services || ['receptionist', 'appointment', 'digitalPrescription', 'certificates', 'billing']
        },
      });
    }

    // Default admin fallback
    if ((u === 'admin' || u === 'admin@dhyeyclinic.com') && password === 'admin123') {
      const existingAdmin = await User.findOne({ username: 'admin' });
      if (!existingAdmin) {
        await User.create({
          username: 'admin',
          email: 'admin@dhyeyclinic.com',
          name: 'System Administrator',
          role: 'admin',
          password: 'admin123',
          employeeId: 'ADM-001'
        });
      }
      const token = jwt.sign(
        { id: 'admin-root', username: 'admin', role: 'admin', name: 'System Administrator' },
        process.env.JWT_SECRET || 'wad_clinic_super_secure_jwt_token_2026_key',
        { expiresIn: '30d' }
      );
      return res.json({
        success: true,
        token,
        user: {
          id: 'admin-root',
          username: 'admin',
          role: 'admin',
          name: 'System Administrator',
          activeClinicId: 'demo'
        }
      });
    }

    return res.status(401).json({ success: false, message: 'Invalid username or password' });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Register / Create Doctor
const registerDoctor = async (req, res) => {
  try {
    const { username, email, password, clinicName, clinicId, name, specialty, degree, regNo, registration, phone } = req.body;

    const docName = (name || `Dr. ${username || 'Doctor'}`).trim();
    const docEmail = (email || username || '').trim().toLowerCase();
    const docUsername = (username || docEmail).trim().toLowerCase();

    if (!docUsername) {
      return res.status(400).json({ success: false, message: 'Doctor username or email is required' });
    }

    const existingUser = await User.findOne({
      $or: [{ username: docUsername }, { email: docEmail }]
    });

    if (existingUser) {
      // Update existing doctor's clinic mapping
      existingUser.clinic = clinicName || existingUser.clinic;
      existingUser.clinicId = clinicId || existingUser.clinicId;
      if (specialty) existingUser.specialty = specialty;
      if (phone) existingUser.phone = phone;
      if (registration || regNo) existingUser.registration = registration || regNo;
      await existingUser.save();

      return res.json({
        success: true,
        message: 'Doctor profile updated',
        doctor: existingUser
      });
    }

    const targetClinicId = clinicId || 'CLN-001';
    const targetClinic = await Clinic.findOne({ clinicId: targetClinicId });

    const newUser = new User({
      username: docUsername,
      email: docEmail,
      password: password || 'Password@123',
      role: 'doctor',
      name: docName.startsWith('Dr.') ? docName : `Dr. ${docName}`,
      specialty: specialty || 'General Medicine',
      degree: degree || 'M.B.B.S.',
      registration: registration || regNo || `REG-${Date.now().toString().slice(-4)}`,
      phone: phone || '',
      clinic: clinicName || targetClinic?.name || 'Dhyey Main Clinic',
      clinicId: targetClinicId,
      clinics: [{ id: targetClinicId, name: clinicName || targetClinic?.name || 'Dhyey Main Clinic' }],
      activeClinicId: targetClinicId,
      services: targetClinic?.services || ['receptionist', 'appointment', 'digitalPrescription', 'certificates', 'billing'],
      status: 'Active'
    });

    await newUser.save();

    // Increment clinic doctor count
    if (targetClinic) {
      targetClinic.doctorsCount = (targetClinic.doctorsCount || 0) + 1;
      await targetClinic.save();
    }

    res.status(201).json({
      success: true,
      message: 'Doctor account created successfully',
      doctor: newUser,
    });
  } catch (error) {
    console.error('Register doctor error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Update Doctor
const updateDoctor = async (req, res) => {
  try {
    const { id } = req.params;
    const data = req.body || {};

    const doctor = await User.findOne(getUserFilter(id));
    if (!doctor) {
      return res.status(404).json({ success: false, message: 'Doctor not found' });
    }

    if (data.name) doctor.name = data.name.startsWith('Dr.') ? data.name : `Dr. ${data.name}`;
    if (data.specialty) doctor.specialty = data.specialty;
    if (data.email) doctor.email = data.email.trim().toLowerCase();
    if (data.phone) doctor.phone = data.phone;
    if (data.registration) doctor.registration = data.registration;
    if (data.clinic) doctor.clinic = data.clinic;
    if (data.clinicId) {
      doctor.clinicId = data.clinicId;
      doctor.activeClinicId = data.clinicId;
    }
    if (data.status) doctor.status = data.status;
    if (data.password) doctor.password = data.password;

    await doctor.save();

    res.json({ success: true, message: 'Doctor updated successfully', doctor });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Toggle Doctor Status
const toggleDoctorStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const doctor = await User.findOne(getUserFilter(id));
    if (!doctor) {
      return res.status(404).json({ success: false, message: 'Doctor not found' });
    }

    doctor.status = doctor.status === 'Suspended' ? 'Active' : 'Suspended';
    await doctor.save();

    res.json({ success: true, message: `Doctor status changed to ${doctor.status}`, doctor });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Delete / Unlink Doctor
const deleteDoctor = async (req, res) => {
  try {
    const { id } = req.params;
    const doctor = await User.findOne(getUserFilter(id));
    if (!doctor) {
      return res.status(404).json({ success: false, message: 'Doctor not found' });
    }

    await User.deleteOne({ _id: doctor._id });
    res.json({ success: true, message: 'Doctor account deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// List all Doctors
const getAllDoctors = async (req, res) => {
  try {
    const doctors = await User.find({ role: 'doctor' }).select('-password').sort({ createdAt: -1 }).lean();
    const formatted = doctors.map(d => ({
      ...d,
      id: d._id,
      patients: d.patients || 0,
      visits: d.visits || 0,
      rating: d.rating || 92
    }));
    res.json({ success: true, count: formatted.length, doctors: formatted });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Admin registration - Simplified without complex regex errors
const registerAdmin = async (req, res) => {
  try {
    const { username, password, name, email, employeeId } = req.body;
    const normalizedUsername = String(username || '').trim().toLowerCase();
    const normalizedEmail = String(email || '').trim().toLowerCase();
    const normalizedEmployeeId = String(employeeId || `ADM-${Date.now().toString().slice(-4)}`).trim().toUpperCase();

    if (!normalizedUsername || normalizedUsername.length < 3) {
      return res.status(400).json({ success: false, message: 'Username must be at least 3 characters.' });
    }
    if (!normalizedEmail || !normalizedEmail.includes('@')) {
      return res.status(400).json({ success: false, message: 'Enter a valid administrator email address.' });
    }
    if (!password || String(password).length < 6) {
      return res.status(400).json({ success: false, message: 'Password must be at least 6 characters.' });
    }
    if (String(name || '').trim().length < 2) {
      return res.status(400).json({ success: false, message: 'Administrator name must contain at least 2 characters.' });
    }

    const existing = await User.findOne({
      $or: [{ username: normalizedUsername }, { email: normalizedEmail }]
    });

    if (existing) {
      return res.status(409).json({ success: false, message: 'Username or email is already registered.' });
    }

    const newAdmin = await User.create({
      username: normalizedUsername,
      password: password, // Or hashed
      role: 'admin',
      name: String(name).trim(),
      email: normalizedEmail,
      employeeId: normalizedEmployeeId,
      status: 'Active'
    });

    res.status(201).json({
      success: true,
      message: 'Administrator account created successfully.',
      admin: {
        id: newAdmin._id,
        username: newAdmin.username,
        name: newAdmin.name,
        email: newAdmin.email,
        employeeId: newAdmin.employeeId,
        role: newAdmin.role,
        createdAt: newAdmin.createdAt
      },
    });
  } catch (error) {
    console.error('Register admin error:', error);
    res.status(500).json({ success: false, message: error.message || 'Unable to create administrator account.' });
  }
};

// Get all Admin accounts
const getAllAdmins = async (req, res) => {
  try {
    // Ensure default system admin exists
    const adminCount = await User.countDocuments({ role: 'admin' });
    if (adminCount === 0) {
      await User.create({
        username: 'admin',
        email: 'admin@dhyeyclinic.com',
        name: 'System Administrator',
        role: 'admin',
        password: 'admin123',
        employeeId: 'ADM-20260001'
      });
    }

    const admins = await User.find({ role: 'admin' }).select('-password').sort({ createdAt: -1 }).lean();
    res.json({ success: true, count: admins.length, admins });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Delete Admin account
const deleteAdmin = async (req, res) => {
  try {
    const { id } = req.params;
    const admin = await User.findOne({ _id: id, role: 'admin' });
    if (!admin) {
      return res.status(404).json({ success: false, message: 'Admin account not found' });
    }
    if (admin.username === 'admin') {
      return res.status(400).json({ success: false, message: 'Default System Administrator account cannot be deleted' });
    }
    await User.deleteOne({ _id: admin._id });
    res.json({ success: true, message: 'Admin account deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Activity Logs in MongoDB
const getActivityLogs = async (req, res) => {
  try {
    const logs = await ActivityLog.find().sort({ createdAt: -1 }).limit(500).lean();
    res.json({ success: true, count: logs.length, logs });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const createActivityLog = async (req, res) => {
  try {
    const { action, entity, entityId, result, details, admin } = req.body;
    const log = new ActivityLog({
      logId: `LOG-${Date.now()}`,
      action: action || 'Action',
      entity: entity || 'System',
      entityId: entityId || '',
      result: result || 'Success',
      details: details || '',
      admin: admin || req.user?.name || req.user?.username || 'Administrator'
    });
    await log.save();
    res.status(201).json({ success: true, log });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Switch Active Clinic
const switchClinic = async (req, res) => {
  try {
    const { clinicId } = req.body;
    const userId = req.user?.id;

    if (userId && userId !== 'demo') {
      await User.findByIdAndUpdate(userId, { activeClinicId: clinicId });
    }

    res.json({ success: true, message: 'Active clinic updated', activeClinicId: clinicId });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Add Clinic to Doctor
const addClinic = async (req, res) => {
  try {
    const { name } = req.body;
    const userId = req.user?.id;

    if (!name || !name.trim()) {
      return res.status(400).json({ success: false, message: 'Clinic name is required' });
    }

    const newClinic = { id: uid(), name: name.trim() };

    if (userId && userId !== 'demo') {
      const user = await User.findById(userId);
      if (user) {
        user.clinics.push(newClinic);
        user.activeClinicId = newClinic.id;
        await user.save();
      }
    }

    res.json({ success: true, clinic: newClinic });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  login,
  registerDoctor,
  updateDoctor,
  toggleDoctorStatus,
  deleteDoctor,
  getAllDoctors,
  registerAdmin,
  getAllAdmins,
  deleteAdmin,
  getActivityLogs,
  createActivityLog,
  switchClinic,
  addClinic,
};
