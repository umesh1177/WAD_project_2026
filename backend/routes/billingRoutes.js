const express = require('express');
const router = express.Router();
const billingController = require('../controllers/billingController');
const authMiddleware = require('../middleware/authMiddleware');

router.get('/', authMiddleware, billingController.getBills);
router.post('/', authMiddleware, billingController.createBill);
router.get('/dues', authMiddleware, billingController.getDuesReport);

module.exports = router;
