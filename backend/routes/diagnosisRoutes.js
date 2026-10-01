const express = require('express');
const router = express.Router();
const diagnosisController = require('../controllers/diagnosisController');
const authMiddleware = require('../middleware/authMiddleware');

router.get('/', authMiddleware, diagnosisController.getDiagnoses);
router.post('/', authMiddleware, diagnosisController.createDiagnosis);
router.delete('/:id', authMiddleware, diagnosisController.deleteDiagnosis);
router.get('/analytics', authMiddleware, diagnosisController.getDiagnosisAnalytics);

module.exports = router;
