const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// Authentication & Users
router.post('/login', authController.login);
router.post('/register-doctor', authController.registerDoctor);
router.post('/doctors', authController.registerDoctor);
router.get('/doctors', authController.getAllDoctors);
router.put('/doctors/:id', authController.updateDoctor);
router.patch('/doctors/:id', authController.updateDoctor);
router.patch('/doctors/:id/status', authController.toggleDoctorStatus);
router.delete('/doctor/:id', authController.deleteDoctor);
router.delete('/doctors/:id', authController.deleteDoctor);

// Admins
router.get('/admins', authController.getAllAdmins);
router.post('/register-admin', authController.registerAdmin);
router.delete('/admins/:id', authController.deleteAdmin);

// Logs
router.get('/logs', authController.getActivityLogs);
router.post('/logs', authController.createActivityLog);

// Clinic switching
router.post('/switch-clinic', authController.switchClinic);
router.post('/add-clinic', authController.addClinic);

module.exports = router;
