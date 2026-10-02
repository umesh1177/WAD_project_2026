const express = require('express');
const router = express.Router();
const billingController = require('../controllers/billingController');
const authMiddleware = require('../middleware/authMiddleware');
const { validateBill } = require('../middleware/validateMiddleware');

router.get('/', authMiddleware, billingController.getBills);
router.post('/', authMiddleware, validateBill, billingController.createBill);
router.patch('/:id', authMiddleware, billingController.updateBill);
router.delete('/:id', authMiddleware, billingController.deleteBill);
router.get('/dues', authMiddleware, billingController.getDuesReport);

module.exports = router;
