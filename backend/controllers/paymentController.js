const Payment = require('../models/Payment');
const Consultation = require('../models/Consultation');
const Bill = require('../models/Bill');
const Patient = require('../models/Patient');
const { todayISO, pad } = require('../utils/generateId');

// Get all payments
const getPayments = async (req, res) => {
  try {
    const clinicId = req.headers['x-clinic-id'] || req.user?.activeClinicId || 'demo';
    const { date, patientId } = req.query;

    const query = { clinicId };
    if (date) query.paymentDate = date;
    if (patientId) query.patientId = patientId;

    const payments = await Payment.find(query).sort({ paymentDate: -1, createdAt: -1 });
    const totalCollected = payments.reduce((sum, p) => sum + (Number(p.amount) || 0), 0);

    res.json({
      success: true,
      count: payments.length,
      totalCollected,
      data: payments,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Record a new payment
const recordPayment = async (req, res) => {
  try {
    const clinicId = req.headers['x-clinic-id'] || req.user?.activeClinicId || 'demo';
    const { patientId, caseId, billId, amount, paymentMethod, transactionRef, remarks, paymentDate } = req.body;

    const payAmount = Number(amount || 0);
    if (!patientId || payAmount <= 0) {
      return res.status(400).json({ success: false, message: 'Valid patient ID and positive amount are required' });
    }

    const patient = await Patient.findOne({ patId: patientId, clinicId });
    const patientName = patient ? patient.name : 'Patient';
    const familyId = patient ? patient.familyId : '';

    const count = await Payment.countDocuments({ clinicId });
    const receiptNo = `REC-${new Date().getFullYear()}-${pad(count + 1, 5)}`;

    const newPayment = new Payment({
      receiptNo,
      billId: billId || '',
      caseId: caseId || '',
      patientId,
      patientName,
      familyId,
      clinicId,
      amount: payAmount,
      paymentMethod: paymentMethod || 'Cash',
      transactionRef: transactionRef || '',
      paymentDate: paymentDate || todayISO(),
      remarks: remarks || '',
    });

    await newPayment.save();

    // If payment is against a specific consultation case, update its received and due
    if (caseId) {
      const visit = await Consultation.findOne({ caseId, clinicId });
      if (visit) {
        visit.received = (Number(visit.received) || 0) + payAmount;
        visit.due = Math.max(0, (Number(visit.charge) || 0) - visit.received);
        await visit.save();
      }
    }

    res.status(201).json({
      success: true,
      message: `Payment of ₹${payAmount} recorded successfully`,
      data: newPayment,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getPayments,
  recordPayment,
};
