const mongoose = require('mongoose');

const requestSchema = new mongoose.Schema({
    clinicId: { type: String },
    name: { type: String, required: true },
    city: { type: String },
    registrationNumber: { type: String },
    phone: { type: String },
    email: { type: String },
    address: { type: String },
    days: { type: String },
    hours: { type: String },
    applicantName: { type: String },
    applicantRole: { type: String },
    specialties: { type: String },
    facilities: { type: String },
    doctorsCount: { type: Number, default: 1 },
    doctors: [{
        name: String,
        specialty: String,
        registration: String,
        email: String,
        phone: String
    }],
    status: { type: String, enum: ['Pending', 'Approved', 'Rejected'], default: 'Pending' }
}, { timestamps: true });

module.exports = mongoose.model('ClinicRequest', requestSchema);
