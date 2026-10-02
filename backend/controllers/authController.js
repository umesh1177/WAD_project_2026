const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const { uid } = require('../utils/generateId');

// Generate JWT Token
const generateToken = (user) => {
  return jwt.sign(
    {
      id: user._id || user.id,
      username: user.username,
      role: user.role,
      activeClinicId: user.activeClinicId || 'demo',
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

    // Hardcoded Admin Check Fallback
    if (username.trim() === 'admin' && password === 'admin') {
      const adminPayload = { id: 'admin', username: 'admin', role: 'admin', name: 'System Administrator' };
      const token = generateToken(adminPayload);
      return res.json({
        success: true,
        token,
        user: { role: 'admin', username: 'admin', name: 'System Administrator' },
      });
    }

    // Doctor Demo Check Fallback
    if (username.trim().toLowerCase() === 'dhyey' && password === '123') {
      const demoDoctor = {
        id: 'demo',
        username: 'dhyey',
        role: 'doctor',
        name: 'Dr. Chirag Paghdal',
        degree: 'B.H.M.S.',
        regNo: 'G-9035',
        clinics: [{ id: 'demo', name: 'Dhyey Clinic & Nursing Home' }],
        activeClinicId: 'demo',
      };
      const token = generateToken(demoDoctor);
      return res.json({
        success: true,
        token,
        user: demoDoctor,
      });
    }

    // Check in MongoDB
    let user = await User.findOne({ username: username.trim() });
    if (user) {
      const isMatch = (user.password === password) || (await bcrypt.compare(password, user.password).catch(() => false));
      if (!isMatch) {
        return res.status(401).json({ success: false, message: 'Invalid username or password' });
      }

      const token = generateToken(user);
      return res.json({
        success: true,
        token,
        user: {
          id: user._id,
          username: user.username,
          role: user.role,
          name: user.name || `Dr. ${user.username}`,
          degree: user.degree,
          regNo: user.regNo,
          clinics: user.clinics || [{ id: 'demo', name: 'Default Clinic' }],
          activeClinicId: user.activeClinicId || 'demo',
        },
      });
    }

    return res.status(401).json({ success: false, message: 'Invalid username or password' });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Register Doctor (Admin only or Public setup)
const registerDoctor = async (req, res) => {
  try {
    const { username, password, clinicName, name, degree, regNo } = req.body;

    if (!username || !password) {
      return res.status(400).json({ success: false, message: 'Username and password are required' });
    }

    const existingUser = await User.findOne({ username: username.trim() });
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'Username already taken' });
    }

    const clinicId = uid();
    const newUser = new User({
      username: username.trim(),
      password, // In real app use bcrypt hash
      role: 'doctor',
      name: name || `Dr. ${username.trim()}`,
      degree: degree || 'M.B.B.S.',
      regNo: regNo || 'REG-' + Math.floor(1000 + Math.random() * 9000),
      clinics: [{ id: clinicId, name: (clinicName && clinicName.trim()) || 'My Clinic' }],
      activeClinicId: clinicId,
    });

    await newUser.save();

    res.status(201).json({
      success: true,
      message: 'Doctor account created successfully',
      doctor: {
        id: newUser._id,
        username: newUser.username,
        role: newUser.role,
        clinics: newUser.clinics,
        activeClinicId: newUser.activeClinicId,
      },
    });
  } catch (error) {
    console.error('Register doctor error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// List all Doctors (for Admin dashboard)
const getAllDoctors = async (req, res) => {
  try {
    const doctors = await User.find({ role: 'doctor' }).select('-password');
    res.json({ success: true, count: doctors.length, doctors });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Switch Active Clinic
const switchClinic = async (req, res) => {
  try {
    const { clinicId } = req.body;
    const userId = req.user.id;

    if (userId !== 'demo') {
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
    const userId = req.user.id;

    if (!name || !name.trim()) {
      return res.status(400).json({ success: false, message: 'Clinic name is required' });
    }

    const newClinic = { id: uid(), name: name.trim() };

    if (userId !== 'demo') {
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

// Delete Doctor (Admin only)
const deleteDoctor = async (req, res) => {
  try {
    const { id } = req.params;
    await User.findByIdAndDelete(id);
    res.json({ success: true, message: 'Doctor deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  login,
  registerDoctor,
  getAllDoctors,
  switchClinic,
  addClinic,
  deleteDoctor,
};
