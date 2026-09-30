const express = require('express');
const router = express.Router();
const prescriptionController = require('../controllers/prescriptionController');
const authMiddleware = require('../middleware/authMiddleware');

router.get('/', authMiddleware, prescriptionController.getPrescriptions);
router.post('/', authMiddleware, prescriptionController.createPrescription);
router.get('/dietary', authMiddleware, prescriptionController.getDietary);
router.get('/print/:caseId', authMiddleware, prescriptionController.getPrintData);

module.exports = router;
