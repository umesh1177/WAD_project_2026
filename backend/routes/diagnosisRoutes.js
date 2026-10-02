const express = require('express');
const router = express.Router();
const diagnosisController = require('../controllers/diagnosisController');
const authMiddleware = require('../middleware/authMiddleware');
const { validateDiagnosis } = require('../middleware/validateMiddleware');

router.get('/', authMiddleware, diagnosisController.getDiagnoses);
router.post('/', authMiddleware, validateDiagnosis, diagnosisController.createDiagnosis);
router.put('/:id', authMiddleware, diagnosisController.updateDiagnosis);
router.delete('/:id', authMiddleware, diagnosisController.deleteDiagnosis);
router.get('/analytics', authMiddleware, diagnosisController.getDiagnosisAnalytics);

module.exports = router;
