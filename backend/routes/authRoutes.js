const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const authMiddleware = require('../middleware/authMiddleware');
const { adminOnly } = require('../middleware/authMiddleware');

// Authentication & Users
router.post('/login', authController.login);
router.post('/register-doctor', authMiddleware, adminOnly, authController.registerDoctor);
router.post('/doctors', authMiddleware, adminOnly, authController.registerDoctor);
router.get('/doctors', authMiddleware, adminOnly, authController.getAllDoctors);
router.put('/doctors/:id', authMiddleware, adminOnly, authController.updateDoctor);
router.patch('/doctors/:id', authMiddleware, adminOnly, authController.updateDoctor);
router.patch('/doctors/:id/status', authMiddleware, adminOnly, authController.toggleDoctorStatus);
router.delete('/doctor/:id', authMiddleware, adminOnly, authController.deleteDoctor);
router.delete('/doctors/:id', authMiddleware, adminOnly, authController.deleteDoctor);

// Admins
router.get('/admins', authMiddleware, adminOnly, authController.getAllAdmins);
router.post('/register-admin', authMiddleware, adminOnly, authController.registerAdmin);
router.delete('/admins/:id', authMiddleware, adminOnly, authController.deleteAdmin);

// Logs
router.get('/logs', authMiddleware, adminOnly, authController.getActivityLogs);
router.post('/logs', authMiddleware, adminOnly, authController.createActivityLog);

// Clinic switching
router.post('/switch-clinic', authMiddleware, authController.switchClinic);
router.post('/add-clinic', authMiddleware, adminOnly, authController.addClinic);

module.exports = router;
