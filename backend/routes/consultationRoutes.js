const express = require('express');
const router = express.Router();
const consultationController = require('../controllers/consultationController');
const authMiddleware = require('../middleware/authMiddleware');

router.get('/', authMiddleware, consultationController.getConsultations);
router.post('/', authMiddleware, consultationController.createConsultation);
router.put('/:id', authMiddleware, consultationController.updateConsultation);
router.delete('/:id', authMiddleware, consultationController.deleteConsultation);

module.exports = router;
