const mongoose = require('mongoose');
const Clinic = require('../models/Clinic');
const ClinicRequest = require('../models/ClinicRequest');
const User = require('../models/User');
const Patient = require('../models/Patient');
const Consultation = require('../models/Consultation');
const bcrypt = require('bcryptjs');

// 1. GET ALL CLINICS
const getAllClinics = async (req, res) => {
  try {
    const clinics = await Clinic.find().sort({ createdAt: -1 }).lean();

    // Dynamically calculate actual patient counts and consultation counts
    for (const c of clinics) {
      const pCount = await Patient.countDocuments({
        $or: [{ clinicId: c.clinicId }, { clinicId: c.clinicId.replace('CLN-', '') }],
      }).catch(() => 0);
      const vCount = await Consultation.countDocuments({
        $or: [{ clinicId: c.clinicId }, { clinicId: c.clinicId.replace('CLN-', '') }],
      }).catch(() => 0);

      c.patients = Math.max(c.patientsCount || 0, pCount);
      c.visits = Math.max(c.visitsCount || 0, vCount);
      c.doctorsCount = (c.doctors && c.doctors.length) || c.doctorsCount || 1;
      c.id = c.clinicId;
    }

    res.json({ success: true, count: clinics.length, data: clinics });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 2. GET CLINIC BY ID
const getClinicById = async (req, res) => {
  try {
    const { id } = req.params;
    const clinic = await Clinic.findOne({ $or: [{ clinicId: id }, { _id: id }] }).lean();
    if (!clinic) {
      return res.status(404).json({ success: false, message: 'Clinic not found' });
    }
    clinic.id = clinic.clinicId;
    res.json({ success: true, data: clinic });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 3. CREATE NEW CLINIC
const createClinic = async (req, res) => {
  try {
    const body = req.body || {};
    const name = String(body.name || '').trim();
    if (!name || name.length < 3) {
      return res.status(400).json({ success: false, message: 'Clinic name must contain at least 3 characters' });
    }

    // Generate unique clinicId if not provided or collision
    let clinicId = body.id || body.clinicId;
    if (!clinicId || (await Clinic.findOne({ clinicId }))) {
      clinicId = `CLN-${Date.now().toString().slice(-4)}${Math.floor(10 + Math.random() * 90)}`;
    }

    const doctorsInput = Array.isArray(body.doctors) ? body.doctors : [];
    const services = Array.isArray(body.services) ? body.services : ['receptionist', 'appointment', 'digitalPrescription', 'certificates', 'billing'];

    const newClinic = new Clinic({
      clinicId,
      name,
      city: String(body.city || (body.address ? body.address.split(',').pop().trim() : 'Ahmedabad')).trim(),
      phone: String(body.phone || '').trim(),
      email: String(body.email || '').trim(),
      registration: String(body.registration || '').trim(),
      address: String(body.address || '').trim(),
      days: String(body.days || 'Monday - Saturday').trim(),
      hours: String(body.hours || '08:30 AM - 08:30 PM').trim(),
      specialties: String(body.specialties || 'General Medicine').trim(),
      facilities: String(body.facilities || 'Consultation, Pharmacy, Diagnostics').trim(),
      status: body.status || 'Active',
      services,
      doctorsCount: doctorsInput.length || Number(body.doctorsCount || 1),
      doctors: doctorsInput.map(d => ({
        name: d.name,
        specialty: d.specialty || 'General Medicine',
        registration: d.registration || '',
        email: String(d.email || '').trim().toLowerCase(),
        phone: d.phone || '',
        password: d.password || 'Password@123',
        status: 'Active',
      })),
      receptionist: body.receptionist ? {
        name: body.receptionist.name,
        email: String(body.receptionist.email || '').trim().toLowerCase(),
        phone: body.receptionist.phone || '',
        shift: body.receptionist.shift || 'General Shift',
        password: body.receptionist.password || '123',
        status: 'Active',
      } : null,
      verifiedDocuments: doctorsInput.length + 1,
    });

    await newClinic.save();

    // Create / Upsert user credentials in MongoDB Atlas for Doctors
    for (const d of doctorsInput) {
      const email = String(d.email || '').trim().toLowerCase();
      if (email) {
        let docUser = await User.findOne({ $or: [{ username: email }, { email }] });
        if (!docUser) {
          docUser = new User({
            username: email,
            email,
            password: d.password || 'Password@123',
            role: 'doctor',
            name: d.name,
            degree: d.specialty || 'General Medicine',
            regNo: d.registration || 'G-9035',
            clinics: [{ id: clinicId, name, address: newClinic.address, phone: newClinic.phone }],
            activeClinicId: clinicId,
          });
          await docUser.save();
        } else {
          docUser.clinics = docUser.clinics || [];
          const hasClinic = docUser.clinics.some(cl => cl.id === clinicId);
          if (!hasClinic) {
            docUser.clinics.push({ id: clinicId, name, address: newClinic.address, phone: newClinic.phone });
          }
          docUser.activeClinicId = clinicId;
          if (d.password) docUser.password = d.password;
          await docUser.save();
        }
      }
    }

    // Create / Upsert user credentials in MongoDB Atlas for Receptionist
    if (body.receptionist && body.receptionist.email) {
      const recEmail = String(body.receptionist.email).trim().toLowerCase();
      let recUser = await User.findOne({ $or: [{ username: recEmail }, { email: recEmail }] });
      if (!recUser) {
        recUser = new User({
          username: recEmail,
          email: recEmail,
          password: body.receptionist.password || '123',
          role: 'receptionist',
          name: body.receptionist.name,
          clinics: [{ id: clinicId, name, address: newClinic.address, phone: newClinic.phone }],
          activeClinicId: clinicId,
        });
        await recUser.save();
      } else {
        recUser.clinics = recUser.clinics || [];
        const hasClinic = recUser.clinics.some(cl => cl.id === clinicId);
        if (!hasClinic) {
          recUser.clinics.push({ id: clinicId, name, address: newClinic.address, phone: newClinic.phone });
        }
        recUser.activeClinicId = clinicId;
        if (body.receptionist.password) recUser.password = body.receptionist.password;
        await recUser.save();
      }
    }

    const resObj = newClinic.toObject();
    resObj.id = clinicId;

    res.status(201).json({
      success: true,
      message: 'Clinic and user credentials registered successfully in MongoDB Atlas',
      data: resObj,
    });
  } catch (error) {
    console.error('Create clinic error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// 4. UPDATE CLINIC
const updateClinic = async (req, res) => {
  try {
    const { id } = req.params;
    const body = req.body || {};

    const clinic = await Clinic.findOne({ $or: [{ clinicId: id }, { _id: id }] });
    if (!clinic) {
      return res.status(404).json({ success: false, message: 'Clinic not found' });
    }

    if (body.name) clinic.name = body.name.trim();
    if (body.city) clinic.city = body.city.trim();
    if (body.phone) clinic.phone = body.phone.trim();
    if (body.email) clinic.email = body.email.trim();
    if (body.registration) clinic.registration = body.registration.trim();
    if (body.address) clinic.address = body.address.trim();
    if (body.days) clinic.days = body.days.trim();
    if (body.hours) clinic.hours = body.hours.trim();
    if (body.specialties) clinic.specialties = body.specialties.trim();
    if (body.facilities) clinic.facilities = body.facilities.trim();
    if (body.status) clinic.status = body.status;
    if (Array.isArray(body.services)) clinic.services = body.services;
    if (Array.isArray(body.doctors)) {
      clinic.doctors = body.doctors;
      clinic.doctorsCount = body.doctors.length;

      // Upsert User accounts in MongoDB Atlas for doctors
      for (const d of body.doctors) {
        const email = String(d.email || '').trim().toLowerCase();
        if (email) {
          let docUser = await User.findOne({ $or: [{ username: email }, { email }] });
          if (!docUser) {
            docUser = new User({
              username: email,
              email,
              password: d.password || 'Password@123',
              role: 'doctor',
              name: d.name,
              degree: d.specialty || 'General Medicine',
              regNo: d.registration || 'G-9035',
              clinics: [{ id: clinic.clinicId, name: clinic.name, address: clinic.address, phone: clinic.phone }],
              activeClinicId: clinic.clinicId,
            });
            await docUser.save();
          } else {
            const hasClinic = (docUser.clinics || []).some(cl => cl.id === clinic.clinicId);
            if (!hasClinic) {
              docUser.clinics = docUser.clinics || [];
              docUser.clinics.push({ id: clinic.clinicId, name: clinic.name, address: clinic.address, phone: clinic.phone });
              await docUser.save();
            }
          }
        }
      }
    }
    if (body.receptionist !== undefined) {
      clinic.receptionist = body.receptionist;
      if (body.receptionist && body.receptionist.email) {
        const recEmail = String(body.receptionist.email).trim().toLowerCase();
        let recUser = await User.findOne({ $or: [{ username: recEmail }, { email: recEmail }] });
        if (!recUser) {
          recUser = new User({
            username: recEmail,
            email: recEmail,
            password: body.receptionist.password || '123',
            role: 'receptionist',
            name: body.receptionist.name,
            clinics: [{ id: clinic.clinicId, name: clinic.name, address: clinic.address, phone: clinic.phone }],
            activeClinicId: clinic.clinicId,
          });
          await recUser.save();
        }
      }
    }

    await clinic.save();

    const resObj = clinic.toObject();
    resObj.id = clinic.clinicId;

    res.json({ success: true, message: 'Clinic updated successfully in MongoDB Atlas', data: resObj });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 5. DELETE CLINIC
const deleteClinic = async (req, res) => {
  try {
    const { id } = req.params;
    await Clinic.findOneAndDelete({ $or: [{ clinicId: id }, { _id: id }] });
    res.json({ success: true, message: 'Clinic deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 6. GET ALL DOCTORS ACROSS CLINICS
const getAllDoctors = async (req, res) => {
  try {
    const users = await User.find({ role: 'doctor' }).select('-password').lean();
    const clinics = await Clinic.find().lean();

    const doctorsList = [];
    const seenEmails = new Set();

    // 1. From User accounts
    users.forEach((u) => {
      const email = u.email || u.username;
      seenEmails.add(email.toLowerCase());
      const clinicName = (u.clinics && u.clinics[0] && u.clinics[0].name) || 'Dhyey Main Clinic';
      const clinicId = (u.clinics && u.clinics[0] && u.clinics[0].id) || u.activeClinicId || 'CLN-001';
      doctorsList.push({
        id: u._id,
        name: u.name || `Dr. ${u.username}`,
        specialty: u.degree || u.specialization || 'General Medicine',
        registration: u.regNo || 'G-9035',
        email,
        phone: (u.clinics && u.clinics[0] && u.clinics[0].phone) || '',
        clinic: clinicName,
        clinicId,
        status: 'Active',
        rating: 94,
      });
    });

    // 2. From Clinic subdocuments
    clinics.forEach((c) => {
      (c.doctors || []).forEach((d) => {
        const dEmail = (d.email || '').toLowerCase();
        if (dEmail && !seenEmails.has(dEmail)) {
          seenEmails.add(dEmail);
          doctorsList.push({
            id: d._id || d.id || `doc_${Date.now()}`,
            name: d.name,
            specialty: d.specialty || 'General Medicine',
            registration: d.registration || 'Document verified',
            email: d.email,
            phone: d.phone || c.phone,
            clinic: c.name,
            clinicId: c.clinicId,
            status: d.status || 'Active',
            rating: 92,
          });
        }
      });
    });

    res.json({ success: true, count: doctorsList.length, data: doctorsList });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 7. GET ALL PATIENTS FOR ADMIN
const getAllPatientsForAdmin = async (req, res) => {
  try {
    const rawPatients = await Patient.find().sort({ createdAt: -1 }).lean();
    const clinics = await Clinic.find().lean();
    const clinicMap = new Map(clinics.map(c => [c.clinicId, c.name]));

    const mapped = rawPatients.map((p) => {
      const cId = p.clinicId ? (p.clinicId.startsWith('CLN-') ? p.clinicId : `CLN-${p.clinicId.padStart(3, '0')}`) : 'CLN-001';
      return {
        id: p.patId || p.customId || p._id,
        name: p.name,
        clinic: clinicMap.get(p.clinicId) || clinicMap.get(cId) || 'Dhyey Main Clinic',
        doctor: p.doctorName || 'Dr. Chirag Paghdal',
        visits: (p.visits && p.visits.length) || 1,
        lastVisit: p.updatedAt ? new Date(p.updatedAt).toLocaleDateString('en-IN') : 'Recent',
        status: 'Active',
        phone: p.phone || '',
        address: p.address || '',
        bloodGroup: p.bloodGroup || '',
      };
    });

    res.json({ success: true, count: mapped.length, data: mapped });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 8. GET REGISTRATION REQUESTS
const getClinicRequests = async (req, res) => {
  try {
    await seedRequestsIfEmpty();
    const requests = await ClinicRequest.find().sort({ createdAt: -1 }).lean();
    const formatted = requests.map(r => ({
      ...r,
      id: r.requestId,
      formattedDate: new Intl.DateTimeFormat('en-IN', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(r.createdAt || Date.now())),
    }));
    res.json({ success: true, count: formatted.length, data: formatted });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 9. CREATE REGISTRATION REQUEST (From Landing page)
const createClinicRequest = async (req, res) => {
  try {
    const data = req.body || {};
    const count = await ClinicRequest.countDocuments();
    const requestId = `REQ-${String(count + 101)}`;
    const clinicId = `CLN-${String(count + 4).padStart(3, '0')}`;

    const newReq = new ClinicRequest({
      requestId,
      clinicId,
      name: (data.name || 'New Clinic').trim(),
      city: (data.city || (data.address ? data.address.split(',').pop().trim() : '') || 'Ahmedabad').trim(),
      registrationNumber: (data.registrationNumber || data.registration || 'REG-PENDING').trim(),
      phone: (data.phone || '').trim(),
      email: (data.email || '').trim(),
      address: (data.address || '').trim(),
      operatingDays: (data.operatingDays || data.days || 'Monday - Saturday').trim(),
      workingHours: (data.workingHours || data.hours || '09:00 - 20:00').trim(),
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
        phone: String(doctor.phone || '').trim(),
        certificate: String(doctor.certificate || '').trim(),
      })) : [],
      status: 'Pending',
      submittedFrom: 'Landing Page',
    });

    await newReq.save();
    res.status(201).json({ success: true, message: 'Clinic registration request submitted successfully', data: newReq });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 10. UPDATE REGISTRATION REQUEST STATUS (Approve / Reject)
const updateClinicRequestStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body || {};

    const reqDoc = await ClinicRequest.findOne({ $or: [{ requestId: id }, { _id: id }] });
    if (!reqDoc) {
      return res.status(404).json({ success: false, message: 'Registration request not found' });
    }

    if (status) {
      reqDoc.status = status;
      if (status === 'Approved') reqDoc.approvedAt = new Date();
      if (status === 'Rejected') reqDoc.rejectedAt = new Date();
      await reqDoc.save();

      // If approved, create clinic in MongoDB Atlas if not exists
      if (status === 'Approved') {
        const existing = await Clinic.findOne({
          $or: [{ name: reqDoc.name }, { clinicId: reqDoc.clinicId }],
        });
        if (!existing) {
          const newClinic = new Clinic({
            clinicId: reqDoc.clinicId || `CLN-${Date.now().toString().slice(-3)}`,
            name: reqDoc.name,
            city: reqDoc.city,
            phone: reqDoc.phone,
            email: reqDoc.email,
            registration: reqDoc.registrationNumber,
            address: reqDoc.address,
            days: reqDoc.operatingDays,
            hours: reqDoc.workingHours,
            specialties: reqDoc.specialties,
            facilities: reqDoc.facilities,
            status: 'Active',
            services: ['receptionist', 'appointment', 'digitalPrescription', 'certificates', 'billing'],
            doctorsCount: (reqDoc.doctors && reqDoc.doctors.length) || reqDoc.doctorsCount || 1,
            doctors: (reqDoc.doctors || []).map(d => ({
              name: d.name,
              specialty: d.specialty || 'General Medicine',
              registration: d.registration || '',
              email: d.email,
              phone: d.phone,
              password: 'Password@123',
              status: 'Active',
            })),
            receptionist: {
              name: `${reqDoc.name.split(' ')[0]} Receptionist`,
              email: `reception.${reqDoc.name.toLowerCase().replace(/[^a-z0-9]/g, '')}@dhyeyclinic.com`,
              phone: reqDoc.phone,
              shift: 'General Shift',
              password: '123',
              status: 'Active',
            },
            verifiedDocuments: ((reqDoc.doctors && reqDoc.doctors.length) || 1) + 1,
          });
          await newClinic.save();

          // Also provision doctor users
          for (const d of reqDoc.doctors || []) {
            if (d.email) {
              const uEmail = d.email.toLowerCase().trim();
              let docUser = await User.findOne({ $or: [{ username: uEmail }, { email: uEmail }] });
              if (!docUser) {
                docUser = new User({
                  username: uEmail,
                  email: uEmail,
                  password: 'Password@123',
                  role: 'doctor',
                  name: d.name,
                  degree: d.specialty || 'General Medicine',
                  regNo: d.registration || 'GMC-PENDING',
                  clinics: [{ id: newClinic.clinicId, name: newClinic.name, address: newClinic.address, phone: newClinic.phone }],
                  activeClinicId: newClinic.clinicId,
                });
                await docUser.save();
              }
            }
          }
        }
      }
    }

    res.json({ success: true, message: `Request status updated to ${status}`, data: reqDoc });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getAllClinics,
  getClinicById,
  createClinic,
  updateClinic,
  deleteClinic,
  getAllDoctors,
  getAllPatientsForAdmin,
  getClinicRequests,
  createClinicRequest,
  updateClinicRequestStatus,
};
