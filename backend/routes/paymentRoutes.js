const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');
const authMiddleware = require('../middleware/authMiddleware');

router.get('/', authMiddleware, paymentController.getPayments);
router.post('/', authMiddleware, paymentController.recordPayment);

module.exports = router;
