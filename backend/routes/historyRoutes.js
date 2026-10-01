const express = require('express');
const router = express.Router();
const historyController = require('../controllers/historyController');
const authMiddleware = require('../middleware/authMiddleware');

router.get('/:patientId', authMiddleware, historyController.getMedicalHistory);
router.post('/:patientId', authMiddleware, historyController.updateMedicalHistory);
router.get('/:patientId/timeline', authMiddleware, historyController.getPatientTimeline);

module.exports = router;
