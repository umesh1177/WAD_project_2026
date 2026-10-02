const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const authMiddleware = require('../middleware/authMiddleware');

router.post('/login', authController.login);
router.post('/register-doctor', authController.registerDoctor);
router.get('/doctors', authMiddleware, authController.getAllDoctors);
router.post('/switch-clinic', authMiddleware, authController.switchClinic);
router.post('/add-clinic', authMiddleware, authController.addClinic);
router.delete('/doctor/:id', authMiddleware, authController.deleteDoctor);

module.exports = router;
