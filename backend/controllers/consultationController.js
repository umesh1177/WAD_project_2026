const Consultation = require('../models/Consultation');
const Patient = require('../models/Patient');
const Family = require('../models/Family');
const Prescription = require('../models/Prescription');
const Bill = require('../models/Bill');
const Payment = require('../models/Payment');
const { makeCaseId, todayISO, nowTime } = require('../utils/generateId');

// Get consultations / visits
const getConsultations = async (req, res) => {
  try {
    const clinicId = req.headers['x-clinic-id'] || req.user?.activeClinicId || 'demo';
    const { patientId, familyId, date } = req.query;

    const query = { clinicId };
    if (patientId) query.patientId = patientId;
    if (familyId) query.familyId = familyId;
    if (date) query.date = date;

    const visits = await Consultation.find(query).sort({ date: -1, time: -1 });
    res.json({ success: true, count: visits.length, data: visits });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Create new visit / consultation
const createConsultation = async (req, res) => {
  try {
    const clinicId = req.headers['x-clinic-id'] || req.user?.activeClinicId || 'demo';
    const {
      familyId,
      patientId,
      date,
      time,
      weight,
      bp,
      sugar,
      pulse,
      other,
      reference,
      investigation,
      complaint,
      diagnosis,
      treatment,
      prescription,
      labReports,
      charge,
      received,
      due,
    } = req.body;

    if (!familyId || !patientId) {
      return res.status(400).json({ success: false, message: 'Family ID and Patient ID are required' });
    }

    const patient = await Patient.findOne({ patId: patientId, clinicId });
    if (!patient) {
      return res.status(404).json({ success: false, message: 'Patient not found' });
    }

    // Determine visit number for this patient
    const existingVisitsCount = await Consultation.countDocuments({ patientId, clinicId });
    const visitNum = existingVisitsCount + 1;
    const caseId = makeCaseId(familyId, patientId, visitNum);

    const chargeNum = Number(charge || 0);
    const recNum = Number(received || 0);
    const dueNum = Math.max(0, chargeNum - recNum);

    const newVisit = new Consultation({
      caseId,
      visitNum,
      patientId,
      familyId,
      clinicId,
      date: date || todayISO(),
      time: time || nowTime(),
      weight: (weight || '').trim(),
      bp: (bp || '').trim(),
      sugar: (sugar || '').trim(),
      pulse: (pulse || '').trim(),
      other: (other || '').trim(),
      reference: (reference || 'Self').trim(),
      investigation: (investigation || '').trim(),
      complaint: (complaint || '').trim(),
      diagnosis: (diagnosis || '').trim(),
      treatment: treatment || [],
      prescription: prescription || [],
      charge: chargeNum,
      received: recNum,
      due: dueNum,
    });

    await newVisit.save();

    // Auto-create Prescription record if medicines provided
    if (prescription && prescription.length > 0) {
      const newRx = new Prescription({
        caseId,
        patientId,
        familyId,
        clinicId,
        doctorId: req.user?.id || 'demo',
        medicines: prescription,
      });
      await newRx.save();
    }

    // Auto-create Billing Record
    if (chargeNum > 0) {
      const newBill = new Bill({
        billNo: `INV-${caseId}`,
        caseId,
        patientId,
        patientName: patient.name,
        familyId,
        clinicId,
        totalCharge: chargeNum,
        netAmount: chargeNum,
        paidAmount: recNum,
        dueAmount: dueNum,
        status: dueNum === 0 ? 'Paid' : recNum > 0 ? 'Partial' : 'Due',
        billDate: date || todayISO(),
        items: (treatment || []).map((t) => ({
          description: t.name,
          qty: Number(t.qty) || 1,
          rate: Number(t.cost) || chargeNum,
          amount: Number(t.cost) || chargeNum,
        })),
      });
      await newBill.save();
    }

    // Auto-create Payment receipt if money received
    if (recNum > 0) {
      const newPayment = new Payment({
        receiptNo: `REC-${caseId}`,
        caseId,
        patientId,
        patientName: patient.name,
        familyId,
        clinicId,
        amount: recNum,
        paymentMethod: 'Cash',
        paymentDate: date || todayISO(),
        remarks: `Consultation Case ${caseId}`,
      });
      await newPayment.save();
    }

    res.status(201).json({
      success: true,
      message: `Visit saved for ${patient.name}! Case ${caseId}`,
      data: newVisit,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Update consultation
const updateConsultation = async (req, res) => {
  try {
    const { id } = req.params;
    const clinicId = req.headers['x-clinic-id'] || req.user?.activeClinicId || 'demo';

    const chargeNum = Number(req.body.charge || 0);
    const recNum = Number(req.body.received || 0);
    const dueNum = Math.max(0, chargeNum - recNum);

    const updateData = {
      ...req.body,
      charge: chargeNum,
      received: recNum,
      due: dueNum,
    };

    const updated = await Consultation.findOneAndUpdate(
      { $or: [{ _id: id }, { caseId: id }], clinicId },
      updateData,
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({ success: false, message: 'Consultation not found' });
    }

    res.json({ success: true, message: 'Visit updated successfully', data: updated });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Delete consultation
const deleteConsultation = async (req, res) => {
  try {
    const { id } = req.params;
    const clinicId = req.headers['x-clinic-id'] || req.user?.activeClinicId || 'demo';

    const deleted = await Consultation.findOneAndDelete({ $or: [{ _id: id }, { caseId: id }], clinicId });
    if (deleted && deleted.caseId) {
      await Prescription.deleteMany({ caseId: deleted.caseId, clinicId });
      await Bill.deleteMany({ caseId: deleted.caseId, clinicId });
      await Payment.deleteMany({ caseId: deleted.caseId, clinicId });
    }
    res.json({ success: true, message: 'Visit deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getConsultations,
  createConsultation,
  updateConsultation,
  deleteConsultation,
};
