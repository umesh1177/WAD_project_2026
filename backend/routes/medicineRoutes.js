const express = require('express');
const router = express.Router();
const medicineController = require('../controllers/medicineController');
const authMiddleware = require('../middleware/authMiddleware');

router.get('/', authMiddleware, medicineController.getMedicines);
router.post('/', authMiddleware, medicineController.createMedicine);
router.put('/:id', authMiddleware, medicineController.updateMedicine);
router.delete('/:id', authMiddleware, medicineController.deleteMedicine);

module.exports = router;
