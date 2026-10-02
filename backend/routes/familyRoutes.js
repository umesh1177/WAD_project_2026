const express = require('express');
const router = express.Router();
const familyController = require('../controllers/familyController');
const authMiddleware = require('../middleware/authMiddleware');
const { validateFamily } = require('../middleware/validateMiddleware');

router.get('/', authMiddleware, familyController.getFamilies);
router.get('/:id', authMiddleware, familyController.getFamilyById);
router.post('/', authMiddleware, validateFamily, familyController.createFamily);
router.put('/:id', authMiddleware, validateFamily, familyController.updateFamily);
router.delete('/:id', authMiddleware, familyController.deleteFamily);

module.exports = router;
