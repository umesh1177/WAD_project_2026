const express = require('express');
const router = express.Router();
const familyController = require('../controllers/familyController');
const authMiddleware = require('../middleware/authMiddleware');

router.get('/', authMiddleware, familyController.getFamilies);
router.get('/:id', authMiddleware, familyController.getFamilyById);
router.post('/', authMiddleware, familyController.createFamily);
router.put('/:id', authMiddleware, familyController.updateFamily);
router.delete('/:id', authMiddleware, familyController.deleteFamily);

module.exports = router;
