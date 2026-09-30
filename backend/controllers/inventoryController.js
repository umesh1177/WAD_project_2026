const Inventory = require('../models/Inventory');

// Get all inventory stock
const getInventory = async (req, res) => {
  try {
    const clinicId = req.headers['x-clinic-id'] || req.user?.activeClinicId || 'demo';
    const items = await Inventory.find({ clinicId }).sort({ itemName: 1 });

    const lowStockItems = items.filter((i) => i.quantity <= i.reorderLevel);

    res.json({
      success: true,
      count: items.length,
      lowStockCount: lowStockItems.length,
      data: items,
      lowStockItems,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Add stock item
const createInventoryItem = async (req, res) => {
  try {
    const clinicId = req.headers['x-clinic-id'] || req.user?.activeClinicId || 'demo';
    const { itemName, category, batchNo, expiryDate, quantity, reorderLevel, unit, unitPrice, supplier } = req.body;

    if (!itemName || !itemName.trim()) {
      return res.status(400).json({ success: false, message: 'Item name is required' });
    }

    const newItem = new Inventory({
      itemName: itemName.trim(),
      category: category || 'Pharmacy',
      batchNo: (batchNo || '').trim(),
      expiryDate: (expiryDate || '').trim(),
      quantity: Number(quantity || 0),
      reorderLevel: Number(reorderLevel || 10),
      unit: unit || 'Strips',
      unitPrice: Number(unitPrice || 0),
      supplier: (supplier || '').trim(),
      clinicId,
    });

    await newItem.save();
    res.status(201).json({ success: true, message: 'Stock item added', data: newItem });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Update stock quantity
const updateStock = async (req, res) => {
  try {
    const { id } = req.params;
    const { quantityChange, setQuantity } = req.body;

    const item = await Inventory.findById(id);
    if (!item) {
      return res.status(404).json({ success: false, message: 'Item not found' });
    }

    if (setQuantity !== undefined) {
      item.quantity = Number(setQuantity);
    } else if (quantityChange !== undefined) {
      item.quantity += Number(quantityChange);
    }

    await item.save();
    res.json({ success: true, message: 'Stock updated', data: item });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Delete item
const deleteInventoryItem = async (req, res) => {
  try {
    const { id } = req.params;
    await Inventory.findByIdAndDelete(id);
    res.json({ success: true, message: 'Stock item deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getInventory,
  createInventoryItem,
  updateStock,
  deleteInventoryItem,
};
