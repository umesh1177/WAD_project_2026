const express = require('express');
const router = express.Router();
const prescriptionController = require('../controllers/prescriptionController');
const authMiddleware = require('../middleware/authMiddleware');
const { validatePrescription } = require('../middleware/validateMiddleware');

router.get('/', authMiddleware, prescriptionController.getPrescriptions);
router.post('/', authMiddleware, validatePrescription, prescriptionController.createPrescription);
router.get('/dietary', authMiddleware, prescriptionController.getDietary);
router.get('/print/:caseId', authMiddleware, prescriptionController.getPrintData);

module.exports = router;
