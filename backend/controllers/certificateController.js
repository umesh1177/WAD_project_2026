const Certificate = require('../models/Certificate');
const { todayISO, pad } = require('../utils/generateId');
const { generateCertificateNumber } = require('../services/certificateService');

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

// Issue new certificate
const createCertificate = async (req, res) => {
  try {
    const clinicId = req.headers['x-clinic-id'] || req.user?.activeClinicId || 'demo';
    const { patientName, diagnosis, fromDate, toDate, reason, patientId } = req.body;

    if (!patientName || !diagnosis || !fromDate || !toDate) {
      return res.status(400).json({ success: false, message: 'Patient name, diagnosis, and dates are required' });
    }

    const count = await Certificate.countDocuments({ clinicId });
    const certNo = generateCertificateNumber(count + 1);

    const newCert = new Certificate({
      certNo,
      patientId: patientId || '',
      patientName: patientName.trim(),
      diagnosis: diagnosis.trim(),
      fromDate,
      toDate,
      reason: reason || 'Medical Rest & Treatment',
      clinicId,
      doctorId: req.user?.id || 'demo',
      issuedDate: todayISO(),
    });

    await newCert.save();
    res.status(201).json({ success: true, message: 'Certificate issued', data: newCert });
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

module.exports = {
  getCertificates,
  createCertificate,
  deleteCertificate,
};
