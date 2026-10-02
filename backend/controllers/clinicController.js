const Clinic = require('../models/Clinic');
const ClinicRequest = require('../models/ClinicRequest');

// Get all clinics (Admin or public search)
const getClinics = async (req, res) => {
    try {
        const clinics = await Clinic.find().sort({ createdAt: -1 });
        res.json({ success: true, count: clinics.length, data: clinics });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Create a new active clinic
const createClinic = async (req, res) => {
    try {
        const data = req.body;
        let newClinicId = data.clinicId || `CLN-${String(Date.now()).slice(-3)}`;

        const newClinic = new Clinic({
            clinicId: newClinicId,
            name: data.name,
            city: data.city,
            phone: data.phone,
            email: data.email,
            address: data.address,
            registration: data.registration || data.registrationNumber,
            services: data.services || ['receptionist', 'appointment', 'digitalPrescription', 'certificates', 'billing'],
            receptionist: data.receptionist || {},
            specialties: data.specialties,
            facilities: data.facilities,
            days: data.days || data.operatingDays,
            hours: data.hours || data.workingHours,
            doctorsCount: data.doctorsCount || 1,
            status: data.status || 'Active'
        });

        await newClinic.save();
        res.status(201).json({ success: true, message: 'Clinic created', data: newClinic });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Clinic Requests
const getClinicRequests = async (req, res) => {
    try {
        const requests = await ClinicRequest.find().sort({ createdAt: -1 });
        res.json({ success: true, count: requests.length, data: requests });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

const registerClinicRequest = async (req, res) => {
    try {
        const data = req.body || {};
        const newReqId = `CLN-${String(Date.now()).slice(-3)}`;
        const newReq = new ClinicRequest({
            clinicId: newReqId,
            name: (data.name || 'New Clinic').trim(),
            city: (data.city || (data.address ? data.address.split(',').pop().trim() : '') || 'Ahmedabad').trim(),
            registrationNumber: (data.registrationNumber || data.registration || 'REG-PENDING').trim(),
            phone: (data.phone || '').trim(),
            email: (data.email || '').trim(),
            address: (data.address || '').trim(),
            days: (data.operatingDays || data.days || 'Monday - Saturday').trim(),
            hours: (data.workingHours || data.hours || '09:00 - 20:00').trim(),
            specialties: (data.specialties || '').trim(),
            facilities: (data.facilities || '').trim(),
            applicantName: (data.applicantName || 'Applicant').trim(),
            applicantRole: (data.applicantRole || 'Owner').trim(),
            doctorsCount: data.doctors ? data.doctors.length : Number(data.doctorsCount || 1),
            doctors: Array.isArray(data.doctors) ? data.doctors.map((doctor) => ({
                name: String(doctor.name || '').trim(),
                specialty: String(doctor.specialty || '').trim(),
                registration: String(doctor.registration || '').trim(),
                email: String(doctor.email || '').trim(),
                phone: String(doctor.phone || '').trim()
            })) : [],
            status: 'Pending'
        });

        await newReq.save();
        res.status(201).json({ success: true, message: 'Clinic registration request submitted successfully', data: newReq });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

const updateClinicRequest = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body || {};

        const request = await ClinicRequest.findById(id) || await ClinicRequest.findOne({ clinicId: id });
        if (!request) {
            return res.status(404).json({ success: false, message: 'Registration request not found' });
        }

        if (status) request.status = status;
        await request.save();

        res.json({ success: true, message: `Request status updated to ${status}`, data: request });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

module.exports = {
    getClinics,
    createClinic,
    getClinicRequests,
    registerClinicRequest,
    updateClinicRequest
};
