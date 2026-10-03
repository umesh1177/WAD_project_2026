const mongoose = require('mongoose');
const Clinic = require('../models/Clinic');
const ClinicRequest = require('../models/ClinicRequest');
const User = require('../models/User');
const Patient = require('../models/Patient');
const Consultation = require('../models/Consultation');
const bcrypt = require('bcryptjs');

// Helper to safely build query for clinic by clinicId or Mongo _id without CastError
const getClinicFilter = (id) => {
    if (!id) return { clinicId: '__none__' };
    const idStr = String(id).trim();
    if (mongoose.Types.ObjectId.isValid(idStr) && String(new mongoose.Types.ObjectId(idStr)) === idStr) {
        return { $or: [{ clinicId: idStr }, { _id: idStr }] };
    }
    return { clinicId: idStr };
};

// Seed default clinics if none exist in MongoDB
const ensureSeedClinics = async () => {
    try {
        const count = await Clinic.countDocuments();
        if (count === 0) {
            const defaultClinics = [
                {
                    clinicId: 'CLN-001',
                    name: 'Dhyey Main Clinic',
                    city: 'Ahmedabad',
                    phone: '9876543210',
                    email: 'contact@dhyeyclinic.com',
                    registration: 'GUJ-MED-2026-001',
                    address: '101, Medical Enclave, CG Road, Navrangpura, Ahmedabad, Gujarat - 380009',
                    services: ['receptionist', 'appointment', 'digitalPrescription', 'certificates', 'billing'],
                    receptionist: {
                        name: 'Pooja Sharma',
                        email: 'pooja.reception@dhyeyclinic.com',
                        phone: '9876543210',
                        shift: 'Morning Shift (08:00 AM - 03:00 PM)',
                        status: 'Active'
                    },
                    specialties: 'General Medicine, Cardiology, Pediatrics',
                    facilities: 'Pharmacy, Pathology Lab, ECG, Emergency Care',
                    days: 'Monday - Saturday',
                    hours: '08:30 AM - 08:30 PM',
                    doctorsCount: 2,
                    patientsCount: 1840,
                    visitsCount: 428,
                    status: 'Active',
                    verifiedDocuments: 13
                },
                {
                    clinicId: 'CLN-002',
                    name: 'Satellite Wellness Centre',
                    city: 'Ahmedabad',
                    phone: '9876543222',
                    email: 'help@satelliteclinic.com',
                    registration: 'GUJ-MED-2026-002',
                    address: '304, Titanium City Centre, Anandnagar Road, Satellite, Ahmedabad, Gujarat - 380015',
                    services: ['receptionist', 'appointment', 'digitalPrescription', 'billing'],
                    receptionist: {
                        name: 'Kavita Dave',
                        email: 'kavita.reception@satelliteclinic.com',
                        phone: '9876543222',
                        shift: 'Full Day (09:00 AM - 07:00 PM)',
                        status: 'Active'
                    },
                    specialties: 'Dermatology, Cosmetology, Trichology',
                    facilities: 'Laser Suite, Minor Procedure Room',
                    days: 'Monday - Saturday',
                    hours: '09:00 AM - 08:00 PM',
                    doctorsCount: 1,
                    patientsCount: 920,
                    visitsCount: 216,
                    status: 'Active',
                    verifiedDocuments: 8
                },
                {
                    clinicId: 'CLN-003',
                    name: 'Riverside Family Care',
                    city: 'Gandhinagar',
                    phone: '9876543233',
                    email: 'info@riversidecare.com',
                    registration: 'GUJ-MED-2026-003',
                    address: '12, Riverside Arcades, Sector 11, Gandhinagar, Gujarat - 382010',
                    services: ['digitalPrescription', 'billing'], // Doctor-only direct access mode
                    receptionist: null,
                    specialties: 'Family Medicine, Gynecology, Geriatrics',
                    facilities: 'Vaccination Centre, Ultrasound',
                    days: 'Monday - Friday',
                    hours: '10:00 AM - 06:00 PM',
                    doctorsCount: 1,
                    patientsCount: 380,
                    visitsCount: 92,
                    status: 'Paused',
                    verifiedDocuments: 5
                }
            ];
            await Clinic.insertMany(defaultClinics);

            // Seed initial doctors in User collection
            const existingDoctors = await User.countDocuments({ role: 'doctor' });
            if (existingDoctors === 0) {
                const defaultDocs = [
                    { username: 'dr.mehul', email: 'dr.mehul.shah@dhyeyclinic.com', name: 'Dr. Mehul Shah', password: 'Password@123', role: 'doctor', specialty: 'General Medicine', clinic: 'Dhyey Main Clinic', clinicId: 'CLN-001', registration: 'GMC-2026-01' },
                    { username: 'dr.riya', email: 'dr.riya.patel@satelliteclinic.com', name: 'Dr. Riya Patel', password: 'Password@123', role: 'doctor', specialty: 'Dermatology', clinic: 'Satellite Wellness Centre', clinicId: 'CLN-002', registration: 'GMC-2026-02' },
                    { username: 'dr.harsh', email: 'dr.harsh.trivedi@dhyeyclinic.com', name: 'Dr. Harsh Trivedi', password: 'Password@123', role: 'doctor', specialty: 'Pediatrics', clinic: 'Dhyey Main Clinic', clinicId: 'CLN-001', registration: 'GMC-2026-03' },
                    { username: 'dr.neha', email: 'dr.neha.desai@riversidecare.com', name: 'Dr. Neha Desai', password: 'Password@123', role: 'doctor', specialty: 'Gynecology', clinic: 'Riverside Family Care', clinicId: 'CLN-003', registration: 'GMC-2026-04' },
                ];
                for (const doc of defaultDocs) {
                    await User.create({
                        ...doc,
                        clinics: [{ id: doc.clinicId, name: doc.clinic }],
                        activeClinicId: doc.clinicId,
                        services: ['receptionist', 'appointment', 'digitalPrescription', 'certificates', 'billing']
                    });
                }
            }
        }
    } catch (e) {
        console.error('Error seeding clinics:', e);
    }
};

const ensureSeedRequests = async () => {
    try {
        const count = await ClinicRequest.countDocuments();
        if (count === 0) {
            const defaultRequests = [
                {
                    clinicId: 'CLN-004',
                    name: 'Apollo City Clinic & Diagnostics',
                    city: 'Ahmedabad',
                    registrationNumber: 'REG-GJ-2026-9021',
                    phone: '+91 98250 12345',
                    email: 'info@apollocityclinic.com',
                    address: 'GF-04, Shivalik Plaza, IIM Road, Panjrapole, Ahmedabad - 380015',
                    days: 'Monday - Saturday',
                    hours: '09:00 - 21:00',
                    specialties: 'General Medicine, Cardiology, Orthopedics',
                    facilities: 'Pharmacy, Path Lab, Minor OT, ECG',
                    applicantName: 'Dr. Ramesh S. Parikh',
                    applicantRole: 'Medical Director',
                    doctorsCount: 2,
                    doctors: [
                        { name: 'Dr. Ramesh S. Parikh', specialty: 'Cardiology', registration: 'MCI-88291', email: 'ramesh.parikh@apollocityclinic.com', phone: '+91 98250 12345' },
                        { name: 'Dr. Sunita K. Sharma', specialty: 'General Medicine', registration: 'MCI-91024', email: 'sunita.sharma@apollocityclinic.com', phone: '+91 98250 54321' }
                    ],
                    status: 'Pending'
                },
                {
                    clinicId: 'CLN-005',
                    name: 'Aura Health & Skin Clinic',
                    city: 'Ahmedabad',
                    registrationNumber: 'REG-GJ-2026-7841',
                    phone: '+91 98790 54321',
                    email: 'contact@auraskinclinic.com',
                    address: '2nd Floor, Safal Pegasuss, Prahlad Nagar, Ahmedabad',
                    days: 'Monday - Saturday',
                    hours: '10:00 - 19:00',
                    specialties: 'Dermatology, Cosmetology',
                    facilities: 'Laser Treatment, Minor OT',
                    applicantName: 'Dr. Ananya Roy',
                    applicantRole: 'Clinic Owner',
                    doctorsCount: 1,
                    doctors: [
                        { name: 'Dr. Ananya Roy', specialty: 'Dermatology', registration: 'MCI-76543', email: 'ananya.roy@auraskinclinic.com', phone: '+91 98790 54321' }
                    ],
                    status: 'Approved'
                }
            ];
            await ClinicRequest.insertMany(defaultRequests);
        }
    } catch (e) {
        console.error('Error seeding requests:', e);
    }
};

// Get all clinics
const getClinics = async (req, res) => {
    try {
        await ensureSeedClinics();
        const clinics = await Clinic.find().sort({ createdAt: -1 }).lean();

        // Calculate live doctor counts from User collection
        for (const clinic of clinics) {
            const docCount = await User.countDocuments({
                role: 'doctor',
                $or: [{ clinicId: clinic.clinicId }, { clinic: clinic.name }]
            });
            if (docCount > 0) {
                clinic.doctorsCount = docCount;
                clinic.doctors = docCount;
            } else {
                clinic.doctors = clinic.doctorsCount || 1;
            }
            clinic.id = clinic.clinicId;
        }

        res.json({ success: true, count: clinics.length, data: clinics });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Get single clinic
const getClinicById = async (req, res) => {
    try {
        const { id } = req.params;
        const clinic = await Clinic.findOne(getClinicFilter(id)).lean();
        if (!clinic) {
            return res.status(404).json({ success: false, message: 'Clinic not found' });
        }
        clinic.id = clinic.clinicId;
        res.json({ success: true, data: clinic });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Create a new active clinic
const createClinic = async (req, res) => {
    try {
        const data = req.body || {};
        const count = await Clinic.countDocuments();
        let newClinicId = data.clinicId || `CLN-${String(count + 1).padStart(3, '0')}`;

        // Ensure unique clinicId
        let exists = await Clinic.findOne({ clinicId: newClinicId });
        if (exists) {
            newClinicId = `CLN-${String(Date.now()).slice(-3)}`;
        }

        const city = data.city || (data.address ? data.address.split(',').pop().trim() : 'Ahmedabad');

        const newClinic = new Clinic({
            clinicId: newClinicId,
            name: data.name,
            city,
            phone: data.phone,
            email: data.email,
            address: data.address,
            registration: data.registration || data.registrationNumber,
            services: data.services || ['receptionist', 'appointment', 'digitalPrescription', 'certificates', 'billing'],
            receptionist: data.receptionist || null,
            specialties: data.specialties,
            facilities: data.facilities,
            days: data.days || data.operatingDays || 'Monday - Saturday',
            hours: data.hours || data.workingHours || '09:00 - 20:00',
            doctorsCount: Array.isArray(data.doctors) ? data.doctors.length : Number(data.doctorsCount || 1),
            status: data.status || 'Active',
            verifiedDocuments: Array.isArray(data.doctors) ? data.doctors.length + 1 : 1
        });

        await newClinic.save();

        // Create doctor accounts in User collection if provided
        if (Array.isArray(data.doctors) && data.doctors.length > 0) {
            for (const doc of data.doctors) {
                if (!doc.name) continue;
                const docEmail = (doc.email || '').trim().toLowerCase();
                const docUsername = docEmail || `doc_${newClinicId}_${String(Math.random()).slice(-4)}`;
                const existingUser = await User.findOne({ $or: [{ email: docEmail }, { username: docUsername }] });
                if (!existingUser) {
                    await User.create({
                        username: docUsername,
                        email: docEmail,
                        password: doc.password || 'Password@123',
                        role: 'doctor',
                        name: doc.name.startsWith('Dr.') ? doc.name : `Dr. ${doc.name}`,
                        specialty: doc.specialty || data.specialties || 'General Medicine',
                        registration: doc.registration || '',
                        clinicId: newClinicId,
                        clinic: data.name,
                        clinics: [{ id: newClinicId, name: data.name }],
                        activeClinicId: newClinicId,
                        services: newClinic.services
                    });
                } else {
                    // Update clinic assignment
                    existingUser.clinicId = newClinicId;
                    existingUser.clinic = data.name;
                    existingUser.clinics.push({ id: newClinicId, name: data.name });
                    existingUser.services = newClinic.services;
                    await existingUser.save();
                }
            }
        }

        // If receptionist data provided, create/update receptionist User
        if (data.receptionist && data.receptionist.email) {
            const recEmail = data.receptionist.email.trim().toLowerCase();
            const existingRec = await User.findOne({ $or: [{ email: recEmail }, { username: recEmail }] });
            if (!existingRec) {
                await User.create({
                    username: recEmail,
                    email: recEmail,
                    password: data.receptionist.password || '123',
                    role: 'receptionist',
                    name: data.receptionist.name || `${data.name} Front Desk`,
                    phone: data.receptionist.phone || data.phone,
                    shift: data.receptionist.shift || 'General Shift',
                    clinicId: newClinicId,
                    clinic: data.name,
                    clinics: [{ id: newClinicId, name: data.name }],
                    activeClinicId: newClinicId
                });
            }
        }

        res.status(201).json({ success: true, message: 'Clinic created successfully', data: newClinic });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Update clinic details
const updateClinic = async (req, res) => {
    try {
        const { id } = req.params;
        const data = req.body || {};

        const clinic = await Clinic.findOne(getClinicFilter(id));
        if (!clinic) {
            return res.status(404).json({ success: false, message: 'Clinic not found' });
        }

        if (data.name) clinic.name = data.name;
        if (data.city) clinic.city = data.city;
        if (data.phone) clinic.phone = data.phone;
        if (data.email) clinic.email = data.email;
        if (data.address) {
            clinic.address = data.address;
            clinic.city = data.address.split(',').pop().trim() || clinic.city;
        }
        if (data.registration) clinic.registration = data.registration;
        if (data.days) clinic.days = data.days;
        if (data.hours) clinic.hours = data.hours;
        if (data.specialties) clinic.specialties = data.specialties;
        if (data.facilities) clinic.facilities = data.facilities;
        if (data.status) clinic.status = data.status;
        if (Array.isArray(data.services)) clinic.services = data.services;
        if (data.receptionist !== undefined) clinic.receptionist = data.receptionist;

        await clinic.save();

        // If receptionist service is active and data provided, create/update receptionist User
        if (clinic.services.includes('receptionist') && data.receptionist && data.receptionist.email) {
            const recEmail = data.receptionist.email.trim().toLowerCase();
            const existingRec = await User.findOne({ $or: [{ email: recEmail }, { username: recEmail }] });
            if (!existingRec) {
                await User.create({
                    username: recEmail,
                    email: recEmail,
                    password: data.receptionist.password || '123',
                    role: 'receptionist',
                    name: data.receptionist.name || `${clinic.name} Front Desk`,
                    phone: data.receptionist.phone || clinic.phone,
                    shift: data.receptionist.shift || 'General Shift',
                    clinicId: clinic.clinicId,
                    clinic: clinic.name,
                    clinics: [{ id: clinic.clinicId, name: clinic.name }],
                    activeClinicId: clinic.clinicId
                });
            } else {
                existingRec.clinicId = clinic.clinicId;
                existingRec.clinic = clinic.name;
                existingRec.name = data.receptionist.name || existingRec.name;
                await existingRec.save();
            }
        }

        // Propagate service and clinic name changes to associated doctors in DB
        await User.updateMany(
            { $or: [{ clinicId: clinic.clinicId }, { clinic: clinic.name }] },
            { $set: { services: clinic.services, clinic: clinic.name } }
        );

        res.json({ success: true, message: 'Clinic updated successfully', data: clinic });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Delete clinic
const deleteClinic = async (req, res) => {
    try {
        const { id } = req.params;
        const clinic = await Clinic.findOne(getClinicFilter(id));
        if (!clinic) {
            return res.status(404).json({ success: false, message: 'Clinic not found' });
        }

        await Clinic.deleteOne({ _id: clinic._id });

        // Unlink doctors
        await User.updateMany(
            { $or: [{ clinicId: clinic.clinicId }, { clinic: clinic.name }] },
            { $set: { clinicId: null, clinic: 'Unassigned' } }
        );

        res.json({ success: true, message: `Clinic "${clinic.name}" deleted successfully` });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Update services only
const updateClinicServices = async (req, res) => {
    try {
        const { id } = req.params;
        const { services } = req.body;

        if (!Array.isArray(services)) {
            return res.status(400).json({ success: false, message: 'Services array is required' });
        }

        const clinic = await Clinic.findOne(getClinicFilter(id));
        if (!clinic) {
            return res.status(404).json({ success: false, message: 'Clinic not found' });
        }

        clinic.services = services;
        await clinic.save();

        // Update all doctors mapped to this clinic in MongoDB
        await User.updateMany(
            { $or: [{ clinicId: clinic.clinicId }, { clinic: clinic.name }] },
            { $set: { services: clinic.services } }
        );

        res.json({ success: true, message: 'Clinic services updated', services: clinic.services, data: clinic });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Update clinic status (Active, Paused, Suspended)
const updateClinicStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        const clinic = await Clinic.findOne(getClinicFilter(id));
        if (!clinic) {
            return res.status(404).json({ success: false, message: 'Clinic not found' });
        }

        clinic.status = status;
        await clinic.save();

        res.json({ success: true, message: `Clinic status changed to ${status}`, data: clinic });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Clinic Requests
const getClinicRequests = async (req, res) => {
    try {
        await ensureSeedRequests();
        const requests = await ClinicRequest.find().sort({ createdAt: -1 }).lean();
        const formatted = requests.map(r => ({
            ...r,
            id: r.clinicId || `REQ-${r._id.toString().slice(-4)}`,
            formattedDate: r.createdAt ? new Date(r.createdAt).toLocaleDateString('en-IN') : 'Recent'
        }));
        res.json({ success: true, count: formatted.length, data: formatted });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

const registerClinicRequest = async (req, res) => {
    try {
        const data = req.body || {};
        const count = await ClinicRequest.countDocuments();
        const newReqId = `REQ-${String(count + 101).padStart(3, '0')}`;
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

        // If Approved, automatically create active clinic and doctor accounts in MongoDB
        if (status === 'Approved') {
            const count = await Clinic.countDocuments();
            const newClinicId = `CLN-${String(count + 1).padStart(3, '0')}`;
            const existingClinic = await Clinic.findOne({ name: request.name });

            if (!existingClinic) {
                const createdClinic = new Clinic({
                    clinicId: newClinicId,
                    name: request.name,
                    city: request.city || 'Ahmedabad',
                    phone: request.phone,
                    email: request.email,
                    address: request.address,
                    registration: request.registrationNumber,
                    services: ['receptionist', 'appointment', 'digitalPrescription', 'certificates', 'billing'],
                    specialties: request.specialties,
                    facilities: request.facilities,
                    days: request.days || 'Monday - Saturday',
                    hours: request.hours || '09:00 - 20:00',
                    doctorsCount: (request.doctors && request.doctors.length) || request.doctorsCount || 1,
                    status: 'Active'
                });
                await createdClinic.save();

                // Create doctors in MongoDB
                if (Array.isArray(request.doctors) && request.doctors.length > 0) {
                    for (const doc of request.doctors) {
                        if (!doc.name) continue;
                        const docEmail = (doc.email || '').trim().toLowerCase();
                        const docUsername = docEmail || `doc_${newClinicId}_${String(Math.random()).slice(-4)}`;
                        const existsUser = await User.findOne({ username: docUsername });
                        if (!existsUser) {
                            await User.create({
                                username: docUsername,
                                email: docEmail,
                                password: 'Password@123',
                                role: 'doctor',
                                name: doc.name.startsWith('Dr.') ? doc.name : `Dr. ${doc.name}`,
                                specialty: doc.specialty || request.specialties || 'General Medicine',
                                registration: doc.registration || request.registrationNumber,
                                clinicId: newClinicId,
                                clinic: request.name,
                                clinics: [{ id: newClinicId, name: request.name }],
                                activeClinicId: newClinicId,
                                services: createdClinic.services
                            });
                        }
                    }
                }
            }
        }

        res.json({ success: true, message: `Request status updated to ${status}`, data: request });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

const deleteClinicRequest = async (req, res) => {
    try {
        const { id } = req.params;
        const request = await ClinicRequest.findById(id) || await ClinicRequest.findOne({ clinicId: id });
        if (!request) {
            return res.status(404).json({ success: false, message: 'Request not found' });
        }
        await ClinicRequest.deleteOne({ _id: request._id });
        res.json({ success: true, message: 'Clinic request deleted' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

module.exports = {
    getClinics,
    getClinicById,
    createClinic,
    updateClinic,
    deleteClinic,
    updateClinicServices,
    updateClinicStatus,
    getClinicRequests,
    registerClinicRequest,
    updateClinicRequest,
    deleteClinicRequest
};
