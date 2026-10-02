const express = require('express');
const router = express.Router();
const followUpController = require('../controllers/followUpController');
const authMiddleware = require('../middleware/authMiddleware');
const { validateFollowUp } = require('../middleware/validateMiddleware');

router.get('/', authMiddleware, followUpController.getFollowUps);
router.post('/', authMiddleware, validateFollowUp, followUpController.createFollowUp);
router.put('/:id', authMiddleware, followUpController.updateFollowUp);
router.delete('/:id', authMiddleware, followUpController.deleteFollowUp);

module.exports = router;
