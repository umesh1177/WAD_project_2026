const mongoose = require('mongoose');

const familySchema = new mongoose.Schema({
  famId: { type: String, required: true, unique: true },
  headName: { type: String, required: true },
  society: { type: String },
  area: { type: String },
  phone: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('Family', familySchema);
