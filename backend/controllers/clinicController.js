const Clinic = require('../models/Clinic');
const ClinicRequest = require('../models/ClinicRequest');
const Patient = require('../models/Patient');
const Consultation = require('../models/Consultation');
const User = require('../models/User');

// Get all clinics
const getClinics = async (req, res) => {
  try {
    let clinics = await Clinic.find().sort({ createdAt: -1 });

    // Compute live stats for each clinic
    const results = await Promise.all(
      clinics.map(async (c) => {
        const cObj = c.toObject();
        const cid = c.clinicId;
        const patientCount = await Patient.countDocuments({ clinicId: cid });
        const visitCount = await Consultation.countDocuments({ clinicId: cid });
        const doctorCount = await User.countDocuments({ role: 'doctor', $or: [{ activeClinicId: cid }, { 'clinics.id': cid }] });

        return {
          ...cObj,
          id: c.clinicId,
          patients: patientCount,
          visits: visitCount,
          doctors: doctorCount || c.doctorsCount || 1,
        };
      })
    );

    res.json({ success: true, count: results.length, data: results });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get single clinic
const getClinicById = async (req, res) => {
  try {
    const { id } = req.params;
    const clinic = await Clinic.findOne({ clinicId: id });
    if (!clinic) {
      return res.status(404).json({ success: false, message: 'Clinic not found' });
    }
    const cObj = clinic.toObject();
    cObj.id = clinic.clinicId;
    res.json({ success: true, data: cObj });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Create new clinic
const createClinic = async (req, res) => {
  try {
    const data = req.body || {};
    const count = await Clinic.countDocuments();
    const clinicId = data.clinicId || data.id || `CLN-${String(count + 1).padStart(3, '0')}`;

    const newClinic = new Clinic({
      clinicId,
      name: data.name,
      city: data.city || 'Ahmedabad',
      phone: data.phone || '',
      email: data.email || '',
      registration: data.registration || '',
      address: data.address || '',
      days: data.days || 'Monday - Saturday',
      hours: data.hours || '09:00 AM - 08:00 PM',
      specialties: data.specialties || 'General Medicine',
      facilities: data.facilities || 'OPD, Pharmacy',
      status: data.status || 'Active',
      services: data.services || ['receptionist', 'appointment', 'digitalPrescription', 'certificates', 'billing'],
      receptionist: data.receptionist || { name: '', email: '', phone: '', shift: 'Morning Shift', status: 'Active' },
      doctorsCount: Number(data.doctorsCount || 1),
    });

    await newClinic.save();
    const cObj = newClinic.toObject();
    cObj.id = newClinic.clinicId;
    res.status(201).json({ success: true, message: 'Clinic created successfully', data: cObj });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Update clinic
const updateClinic = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body || {};
    delete updateData._id;
    delete updateData.clinicId;

    const clinic = await Clinic.findOneAndUpdate({ clinicId: id }, updateData, { new: true });
    if (!clinic) {
      return res.status(404).json({ success: false, message: 'Clinic not found' });
    }
    const cObj = clinic.toObject();
    cObj.id = clinic.clinicId;
    res.json({ success: true, message: 'Clinic updated successfully', data: cObj });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Update clinic services
const updateClinicServices = async (req, res) => {
  try {
    const { id } = req.params;
    const { services } = req.body;

    if (!Array.isArray(services)) {
      return res.status(400).json({ success: false, message: 'Services array is required' });
    }

    const clinic = await Clinic.findOneAndUpdate({ clinicId: id }, { services }, { new: true });
    if (!clinic) {
      return res.status(404).json({ success: false, message: 'Clinic not found' });
    }
    res.json({ success: true, message: 'Clinic services updated', data: clinic });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Delete clinic
const deleteClinic = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await Clinic.findOneAndDelete({ clinicId: id });
    if (!deleted) {
      return res.status(404).json({ success: false, message: 'Clinic not found' });
    }
    res.json({ success: true, message: `Clinic ${id} deleted successfully` });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get clinic registration requests
const getClinicRequests = async (req, res) => {
  try {
    const requests = await ClinicRequest.find().sort({ createdAt: -1 });
    const formatted = requests.map((r) => {
      const obj = r.toObject();
      obj.id = r.requestId;
      return obj;
    });
    res.json({ success: true, count: formatted.length, data: formatted });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Create clinic registration request (Public Landing Page)
const createClinicRequest = async (req, res) => {
  try {
    const data = req.body || {};
    const count = await ClinicRequest.countDocuments();
    const requestId = `REQ-${Date.now().toString().slice(-4)}`;
    const clinicId = `CLN-${String(count + 1).padStart(3, '0')}`;

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
      clinicCertificate: (data.clinicCertificate || '').trim(),
      doctorsCount: data.doctors ? data.doctors.length : Number(data.doctorsCount || 1),
      doctors: Array.isArray(data.doctors)
        ? data.doctors.map((d) => ({
            name: String(d.name || '').trim(),
            specialty: String(d.specialty || '').trim(),
            registration: String(d.registration || '').trim(),
            email: String(d.email || '').trim(),
          }))
        : [],
      status: 'Pending',
      formattedDate: new Intl.DateTimeFormat('en-IN', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date()),
      submittedFrom: data.submittedFrom || 'Landing Page',
    });

    await newReq.save();
    const obj = newReq.toObject();
    obj.id = newReq.requestId;

    res.status(201).json({ success: true, message: 'Clinic registration request submitted successfully', data: obj });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Update request status (Approve / Reject)
const updateClinicRequestStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const target = await ClinicRequest.findOne({ $or: [{ requestId: id }, { _id: id.match(/^[0-9a-fA-F]{24}$/) ? id : null }] });
    if (!target) {
      return res.status(404).json({ success: false, message: 'Registration request not found' });
    }

    target.status = status;
    await target.save();

    // If Approved, automatically create the Clinic in MongoDB if not already existing
    if (status === 'Approved') {
      const exists = await Clinic.findOne({ clinicId: target.clinicId });
      if (!exists) {
        await new Clinic({
          clinicId: target.clinicId,
          name: target.name,
          city: target.city,
          phone: target.phone,
          email: target.email,
          registration: target.registrationNumber,
          address: target.address,
          days: target.operatingDays,
          hours: target.workingHours,
          specialties: target.specialties || 'General Medicine',
          facilities: target.facilities || 'OPD, Pharmacy',
          status: 'Active',
          doctorsCount: target.doctorsCount || 1,
        }).save();
      }
    }

    const obj = target.toObject();
    obj.id = target.requestId;
    res.json({ success: true, message: `Request status updated to ${status}`, data: obj });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getClinics,
  getClinicById,
  createClinic,
  updateClinic,
  updateClinicServices,
  deleteClinic,
  getClinicRequests,
  createClinicRequest,
  updateClinicRequestStatus,
};
