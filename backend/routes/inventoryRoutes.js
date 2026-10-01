const express = require('express');
const router = express.Router();
const inventoryController = require('../controllers/inventoryController');
const authMiddleware = require('../middleware/authMiddleware');

router.get('/', authMiddleware, inventoryController.getInventory);
router.post('/', authMiddleware, inventoryController.createInventoryItem);
router.put('/:id/stock', authMiddleware, inventoryController.updateStock);
router.delete('/:id', authMiddleware, inventoryController.deleteInventoryItem);

module.exports = router;
