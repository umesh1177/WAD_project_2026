const Consultation = require('../models/Consultation');
const Bill = require('../models/Bill');

const getConsultations = async (req, res) => {
  try {
    const { patientId } = req.query;
    const query = {};
    if (patientId) query.patientId = patientId;
    const visits = await Consultation.find(query).sort({ date: -1, time: -1 });
    res.json({ success: true, count: visits.length, data: visits });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const createConsultation = async (req, res) => {
  try {
    const { patientId, familyId, date, time, bp, sugar, other, reference, complaint, investigation, dietary, vitals, treatment, prescription, labReport, charge, paid } = req.body;

    const count = await Consultation.countDocuments();
    const caseId = `CASE-${String(count + 1).padStart(4, '0')}`;
    const chargeNum = Number(charge || 0);
    const paidNum = Number(paid || 0);
    const dueNum = Math.max(0, chargeNum - paidNum);

    const newVisit = new Consultation({
      caseId,
      patientId,
      familyId,
      date: date || new Date().toISOString().slice(0, 10),
      time: time || new Date().toLocaleTimeString(),
      bp, sugar, other, reference, complaint, investigation, dietary,
      vitals: vitals || {},
      treatment: treatment || [],
      prescription: prescription || [],
      labReport: labReport || false,
      charge: chargeNum,
      paid: paidNum,
      due: dueNum
    });

    await newVisit.save();

    if (chargeNum > 0) {
      await new Bill({
        billNo: `INV-${caseId}`,
        consultationId: newVisit._id,
        patientId,
        totalCharge: chargeNum,
        paidAmount: paidNum,
        dueAmount: dueNum,
        status: dueNum === 0 ? 'Paid' : 'Due'
      }).save();
    }

    res.status(201).json({ success: true, data: newVisit });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const updateConsultation = async (req, res) => {
  try {
    const { id } = req.params;
    const updated = await Consultation.findByIdAndUpdate(id, req.body, { new: true });
    res.json({ success: true, data: updated });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const deleteConsultation = async (req, res) => {
  try {
    const { id } = req.params;
    await Consultation.findByIdAndDelete(id);
    res.json({ success: true, message: 'Deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { getConsultations, createConsultation, updateConsultation, deleteConsultation };
