const Certificate = require('../models/Certificate');
const CertificateTemplate = require('../models/CertificateTemplate');
const { todayISO, pad } = require('../utils/generateId');
const { generateCertificateNumber } = require('../services/certificateService');

// Default built-in certificate templates
const DEFAULT_TEMPLATES = [
  {
    templateName: 'Medical Fitness Certificate',
    title: 'MEDICAL FITNESS CERTIFICATE',
    body: 'This is to certify that {PATIENT_NAME}, aged {AGE}, has been examined by me. The patient has clinically recovered from {DIAGNOSIS} and is now found medically fit in all respects to resume normal daily duties.',
    category: 'Fitness',
    isDefault: true,
  },
  {
    templateName: 'Medical Leave & Rest Certificate',
    title: 'MEDICAL SICKNESS & LEAVE CERTIFICATE',
    body: 'This is to certify that {PATIENT_NAME}, aged {AGE}, is suffering from {DIAGNOSIS} and has been under my medical care. The patient is advised complete bed rest and absence from work/studies from {FROM_DATE} to {TO_DATE} ({REST_DAYS} days) for proper recovery.',
    category: 'Leave',
    isDefault: true,
  },
  {
    templateName: 'Medical Examination & Treatment Certificate',
    title: 'CERTIFICATE OF MEDICAL EXAMINATION',
    body: 'This is to certify that {PATIENT_NAME} was medically examined and provided treatment for {DIAGNOSIS} on {TODAY_DATE} at this clinic. The patient has been given necessary medications and medical advice.',
    category: 'General',
    isDefault: true,
  },
  {
    templateName: 'Light Duty / Work Exemption Certificate',
    title: 'MEDICAL EXEMPTION / LIGHT WORK CERTIFICATE',
    body: 'This is to certify that {PATIENT_NAME} is undergoing medical management for {DIAGNOSIS}. The patient is advised to avoid heavy physical exertion, lifting, or prolonged standing from {FROM_DATE} to {TO_DATE}, and is recommended only light duties.',
    category: 'Exemption',
    isDefault: true,
  },
];

// Get all certificates
const getCertificates = async (req, res) => {
  try {
    const clinicId = req.headers['x-clinic-id'] || req.user?.activeClinicId || 'demo';
    const certs = await Certificate.find({ clinicId }).sort({ createdAt: -1 });
    res.json({ success: true, count: certs.length, data: certs });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Issue new certificate with auto-generated unique Certificate ID
const createCertificate = async (req, res) => {
  try {
    const clinicId = req.headers['x-clinic-id'] || req.user?.activeClinicId || 'demo';
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

    // Generate unique Certificate ID
    const count = await Certificate.countDocuments({ clinicId });
    const year = new Date().getFullYear();
    let certNo = `CERT-${year}-${pad(count + 1, 4)}`;

    // Ensure certNo uniqueness
    let exists = await Certificate.findOne({ certNo, clinicId });
    let seq = count + 1;
    while (exists) {
      seq++;
      certNo = `CERT-${year}-${pad(seq, 4)}`;
      exists = await Certificate.findOne({ certNo, clinicId });
    }

    const newCert = new Certificate({
      certNo,
      patientId: patientId || '',
      patientName: patientName.trim(),
      patientAge: patientAge || '',
      patientGender: patientGender || '',
      diagnosis: diagnosis.trim(),
      fromDate,
      toDate,
      restDays: Number(restDays) || 0,
      templateId: templateId || '',
      templateName: templateName || 'Medical Fitness / Leave',
      customBody: customBody || '',
      clinicId,
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
    await Certificate.findByIdAndDelete(id);
    res.json({ success: true, message: 'Certificate deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get all certificate templates (built-in defaults + clinic custom templates)
const getTemplates = async (req, res) => {
  try {
    const clinicId = req.headers['x-clinic-id'] || req.user?.activeClinicId || 'demo';
    const customTemplates = await CertificateTemplate.find({ clinicId }).sort({ createdAt: -1 });

    const allTemplates = [...DEFAULT_TEMPLATES, ...customTemplates];
    res.json({ success: true, count: allTemplates.length, data: allTemplates });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Add new custom certificate template
const createTemplate = async (req, res) => {
  try {
    const clinicId = req.headers['x-clinic-id'] || req.user?.activeClinicId || 'demo';
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
  verifyCertificate,
  deleteCertificate,
  getTemplates,
  createTemplate,
  deleteTemplate,
};
