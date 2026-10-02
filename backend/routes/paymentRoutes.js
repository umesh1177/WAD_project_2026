const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');
const authMiddleware = require('../middleware/authMiddleware');
const { validatePayment } = require('../middleware/validateMiddleware');

router.get('/', authMiddleware, paymentController.getPayments);
router.post('/', authMiddleware, validatePayment, paymentController.recordPayment);

module.exports = router;
