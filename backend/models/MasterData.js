const mongoose = require('mongoose');

const masterDataSchema = new mongoose.Schema({
    type: { type: String, required: true, enum: ['society', 'area', 'allergy', 'relation', 'dietary'] },
    name: { type: String, required: true },
    metadata: { type: mongoose.Schema.Types.Mixed }
}, { timestamps: true });

module.exports = mongoose.model('MasterData', masterDataSchema);
