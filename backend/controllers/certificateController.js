const mongoose = require('mongoose');
const Certificate = require('../models/Certificate');
const CertificateTemplate = require('../models/CertificateTemplate');
const { todayISO, pad } = require('../utils/generateId');

// Default built-in certificate templates
const DEFAULT_TEMPLATES = [
  {
    id: 'tpl-1',
    templateName: 'Medical Fitness Certificate',
    title: 'MEDICAL FITNESS CERTIFICATE',
    body: 'This is to certify that {PATIENT_NAME}, aged {AGE}, has been examined by me. The patient has clinically recovered from {DIAGNOSIS} and is now found medically fit in all respects to resume normal daily duties.',
    category: 'Fitness',
    isDefault: true,
  },
  {
    id: 'tpl-2',
    templateName: 'Medical Leave & Rest Certificate',
    title: 'MEDICAL SICKNESS & LEAVE CERTIFICATE',
    body: 'This is to certify that {PATIENT_NAME}, aged {AGE}, is suffering from {DIAGNOSIS} and has been under my medical care. The patient is advised complete bed rest and absence from work/studies from {FROM_DATE} to {TO_DATE} ({REST_DAYS} days) for proper recovery.',
    category: 'Leave',
    isDefault: true,
  },
  {
    id: 'tpl-3',
    templateName: 'Medical Examination & Treatment Certificate',
    title: 'CERTIFICATE OF MEDICAL EXAMINATION',
    body: 'This is to certify that {PATIENT_NAME} was medically examined and provided treatment for {DIAGNOSIS} on {TODAY_DATE} at this clinic. The patient has been given necessary medications and medical advice.',
    category: 'General',
    isDefault: true,
  },
  {
    id: 'tpl-4',
    templateName: 'Light Duty / Work Exemption Certificate',
    title: 'MEDICAL EXEMPTION / LIGHT WORK CERTIFICATE',
    body: 'This is to certify that {PATIENT_NAME} is undergoing medical management for {DIAGNOSIS}. The patient is advised to avoid heavy physical exertion, lifting, or prolonged standing from {FROM_DATE} to {TO_DATE}, and is recommended only light duties.',
    category: 'Exemption',
    isDefault: true,
  },
];

// Get all certificates for the current clinic
const getCertificates = async (req, res) => {
  try {
    const clinicId = req.headers['x-clinic-id'] || req.user?.activeClinicId || req.query.clinicId || 'demo';
    const certs = await Certificate.find({ clinicId }).sort({ createdAt: -1 }).lean();
    res.json({ success: true, count: certs.length, data: certs });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Issue new certificate
const createCertificate = async (req, res) => {
  try {
    const clinicId = req.headers['x-clinic-id'] || req.user?.activeClinicId || req.body.clinicId || 'demo';
    const {
      patientName,
      patientAge,
      patientGender,
      patientId,
      diagnosis,
      fromDate,
      toDate,
      restDays,
      templateId,
      templateName,
      customBody,
      reason,
      place,
    } = req.body;

    if (!patientName || !diagnosis || !fromDate || !toDate) {
      return res.status(400).json({ success: false, message: 'Patient name, diagnosis, and dates are required' });
    }

    const count = await Certificate.countDocuments({ clinicId });
    const year = new Date().getFullYear();
    let certNo = `CERT-${year}-${pad(count + 1, 4)}`;

    let exists = await Certificate.findOne({ certNo });
    let seq = count + 1;
    while (exists) {
      seq++;
      certNo = `CERT-${year}-${pad(seq, 4)}`;
      exists = await Certificate.findOne({ certNo });
    }

    const newCert = new Certificate({
      certNo,
      patientId: patientId || '',
      patientName: (patientName || '').trim(),
      patientAge: patientAge || '',
      patientGender: patientGender || '',
      diagnosis: (diagnosis || '').trim(),
      fromDate,
      toDate,
      restDays: Number(restDays) || 0,
      templateId: templateId || '',
      templateName: templateName || 'Medical Fitness / Leave',
      customBody: customBody || '',
      reason: reason || 'Medical Rest & Treatment',
      certificateType: templateName || 'Medical Fitness / Leave',
      clinicId,
      doctorId: req.user?.id || 'demo',
      doctorName: req.user?.name || 'Dr. Chirag Paghdal',
      issuedDate: todayISO(),
      place: place || 'Surat',
      status: 'Issued',
    });

    await newCert.save();
    res.status(201).json({ success: true, message: 'Certificate issued successfully', data: newCert });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Update certificate
const updateCertificate = async (req, res) => {
  try {
    const { id } = req.params;
    let query = { certNo: id };
    if (mongoose.Types.ObjectId.isValid(id)) {
      query = { $or: [{ _id: id }, { certNo: id }] };
    }

    const updated = await Certificate.findOneAndUpdate(query, { $set: req.body }, { new: true });
    if (!updated) {
      return res.status(404).json({ success: false, message: 'Certificate not found for update' });
    }
    res.json({ success: true, message: 'Certificate updated', data: updated });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Verify certificate by Unique Certificate ID
const verifyCertificate = async (req, res) => {
  try {
    const { certNo } = req.params;
    const cert = await Certificate.findOne({ certNo: certNo.trim() });
    if (!cert) {
      return res.status(404).json({ success: false, message: `No certificate found with ID: ${certNo}`, valid: false });
    }
    res.json({
      success: true,
      valid: true,
      data: cert,
      message: 'Certificate successfully verified as authentic & valid',
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Delete certificate
const deleteCertificate = async (req, res) => {
  try {
    const { id } = req.params;
    let query = { certNo: id };
    if (mongoose.Types.ObjectId.isValid(id)) {
      query = { $or: [{ _id: id }, { certNo: id }] };
    }

    await Certificate.findOneAndDelete(query);
    res.json({ success: true, message: 'Certificate deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get all certificate templates for the current clinic
const getTemplates = async (req, res) => {
  try {
    const clinicId = req.headers['x-clinic-id'] || req.user?.activeClinicId || req.query.clinicId || 'demo';
    const customTemplates = await CertificateTemplate.find({ clinicId }).sort({ createdAt: -1 }).lean();

    const formattedCustom = customTemplates.map(t => ({
      ...t,
      id: t._id.toString()
    }));

    const allTemplates = [...DEFAULT_TEMPLATES, ...formattedCustom];
    res.json({ success: true, count: allTemplates.length, data: allTemplates });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Add new custom certificate template for the current clinic
const createTemplate = async (req, res) => {
  try {
    const clinicId = req.headers['x-clinic-id'] || req.user?.activeClinicId || req.body.clinicId || 'demo';
    const { templateName, title, body, category } = req.body;

    if (!templateName || !body) {
      return res.status(400).json({ success: false, message: 'Template name and body text are required' });
    }

    const newTemplate = new CertificateTemplate({
      templateName: templateName.trim(),
      title: title ? title.trim().toUpperCase() : 'MEDICAL CERTIFICATE',
      body: body.trim(),
      category: category || 'Custom',
      clinicId,
      doctorId: req.user?.id || 'demo',
      isDefault: false,
    });

    await newTemplate.save();
    res.status(201).json({ success: true, message: 'Certificate template created', data: newTemplate });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Update custom template
const updateTemplate = async (req, res) => {
  try {
    const { id } = req.params;
    const updated = await CertificateTemplate.findByIdAndUpdate(id, { $set: req.body }, { new: true });
    if (!updated) {
      return res.status(404).json({ success: false, message: 'Template not found' });
    }
    res.json({ success: true, message: 'Template updated', data: updated });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Delete custom template
const deleteTemplate = async (req, res) => {
  try {
    const { id } = req.params;
    await CertificateTemplate.findByIdAndDelete(id);
    res.json({ success: true, message: 'Certificate template deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getCertificates,
  createCertificate,
  updateCertificate,
  verifyCertificate,
  deleteCertificate,
  getTemplates,
  createTemplate,
  updateTemplate,
  deleteTemplate,
};
