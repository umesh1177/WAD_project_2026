const express = require('express');
const router = express.Router();
const patientController = require('../controllers/patientController');
const authMiddleware = require('../middleware/authMiddleware');
const { validatePatient } = require('../middleware/validateMiddleware');

router.get('/', authMiddleware, patientController.getPatients);
router.get('/:id', authMiddleware, patientController.getPatientById);
router.post('/member', authMiddleware, validatePatient, patientController.createPatientMember);
router.put('/:id', authMiddleware, validatePatient, patientController.updatePatient);
router.delete('/:id', authMiddleware, patientController.deletePatient);

module.exports = router;
