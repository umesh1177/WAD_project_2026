const express = require('express');
const router = express.Router();
const medicineController = require('../controllers/medicineController');
const authMiddleware = require('../middleware/authMiddleware');
const { validateMedicine } = require('../middleware/validateMiddleware');

router.get('/', authMiddleware, medicineController.getMedicines);
router.post('/', authMiddleware, validateMedicine, medicineController.createMedicine);
router.put('/:id', authMiddleware, validateMedicine, medicineController.updateMedicine);
router.delete('/:id', authMiddleware, medicineController.deleteMedicine);

module.exports = router;
