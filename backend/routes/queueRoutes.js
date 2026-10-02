const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const {
  getQueue,
  addToQueue,
  updateQueueStatus,
  deleteFromQueue,
  clearQueue,
} = require('../controllers/queueController');

router.get('/', authMiddleware, getQueue);
router.post('/', authMiddleware, addToQueue);
router.patch('/:id', authMiddleware, updateQueueStatus);
router.delete('/clear', authMiddleware, clearQueue);
router.delete('/:id', authMiddleware, deleteFromQueue);

module.exports = router;
