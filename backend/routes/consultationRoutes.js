const express = require('express');
const router = express.Router();
const consultationController = require('../controllers/consultationController');
const authMiddleware = require('../middleware/authMiddleware');
const { validateConsultation } = require('../middleware/validateMiddleware');

router.get('/', authMiddleware, consultationController.getConsultations);
router.post('/', authMiddleware, validateConsultation, consultationController.createConsultation);
router.put('/:id', authMiddleware, consultationController.updateConsultation);
router.delete('/:id', authMiddleware, consultationController.deleteConsultation);

module.exports = router;
