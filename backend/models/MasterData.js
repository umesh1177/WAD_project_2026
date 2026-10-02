const mongoose = require('mongoose');

const MasterDataSchema = new mongoose.Schema(
  {
    clinicId: { type: String, default: 'shared', index: true }, // 'shared' or specific clinicId
    type: { type: String, required: true, index: true }, // 'medicines', 'complaints', 'investigations', 'allergies', 'relations', 'areas', 'societies', 'customShortcuts', 'clinicShortcuts'
    items: { type: mongoose.Schema.Types.Mixed, default: [] },
  },
  { timestamps: true }
);

MasterDataSchema.index({ clinicId: 1, type: 1 }, { unique: true });

module.exports = mongoose.model('MasterData', MasterDataSchema);
