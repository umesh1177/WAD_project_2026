const mongoose = require('mongoose');

const ActivityLogSchema = new mongoose.Schema({
  logId: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
  admin: { type: String, default: 'Administrator' },
  action: { type: String, required: true },
  entity: { type: String, required: true },
  entityId: { type: String },
  result: { type: String, default: 'Success' },
  details: { type: String, default: '' },
}, { timestamps: true });

module.exports = mongoose.model('ActivityLog', ActivityLogSchema);
