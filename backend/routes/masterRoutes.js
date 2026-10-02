const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const {
  getAllMasters,
  getMasterByType,
  createMasterItem,
  updateMasterItem,
  deleteMasterItem,
  bulkSyncMaster,
} = require('../controllers/masterController');

router.get('/', authMiddleware, getAllMasters);
router.get('/:type', authMiddleware, getMasterByType);
router.post('/:type', authMiddleware, createMasterItem);
router.post('/:type/bulk', authMiddleware, bulkSyncMaster);
router.put('/:type/:id', authMiddleware, updateMasterItem);
router.patch('/:type/:id', authMiddleware, updateMasterItem);
router.delete('/:type/:id', authMiddleware, deleteMasterItem);

module.exports = router;
