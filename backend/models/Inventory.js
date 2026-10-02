const mongoose = require('mongoose');

const InventorySchema = new mongoose.Schema(
  {
    itemName: { type: String, required: true, trim: true },
    batchNo: { type: String, default: '' },
    quantity: { type: Number, required: true, default: 0 },
    reorderLevel: { type: Number, default: 10 },
    unitPrice: { type: Number, default: 0 },
    clinicId: { type: String, default: 'demo', index: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Inventory', InventorySchema);
