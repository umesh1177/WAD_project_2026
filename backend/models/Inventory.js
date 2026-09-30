const mongoose = require('mongoose');

const InventorySchema = new mongoose.Schema(
  {
    itemName: { type: String, required: true, trim: true },
    category: { type: String, default: 'Pharmacy' },
    batchNo: { type: String, default: '' },
    expiryDate: { type: String, default: '' },
    quantity: { type: Number, required: true, default: 0 },
    reorderLevel: { type: Number, default: 10 },
    unit: { type: String, default: 'Strips' },
    unitPrice: { type: Number, default: 0 },
    supplier: { type: String, default: '' },
    clinicId: { type: String, default: 'demo', index: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Inventory', InventorySchema);
