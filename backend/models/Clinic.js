const mongoose = require('mongoose');

const clinicSchema = new mongoose.Schema({
    clinicId: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    city: { type: String },
    phone: { type: String },
    email: { type: String },
    address: { type: String },
    registration: { type: String },
    services: [{ type: String }],
    receptionist: {
        name: String,
        email: String,
        phone: String,
        shift: String,
        status: String
    },
    specialties: { type: String },
    facilities: { type: String },
    days: { type: String },
    hours: { type: String },
    doctorsCount: { type: Number, default: 0 },
    patientsCount: { type: Number, default: 0 },
    visitsCount: { type: Number, default: 0 },
    status: { type: String, enum: ['Active', 'Paused', 'Suspended'], default: 'Active' },
    verifiedDocuments: { type: Number, default: 0 }
}, { timestamps: true });

module.exports = mongoose.model('Clinic', clinicSchema);
