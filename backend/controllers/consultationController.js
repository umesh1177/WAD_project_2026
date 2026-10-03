const mongoose = require('mongoose');
const Consultation = require('../models/Consultation');

const getConsultations = async (req, res) => {
  try {
    const clinicId = req.headers['x-clinic-id'] || req.user?.activeClinicId || req.query.clinicId;
    const { patientId, caseId } = req.query;
    const query = {};
    if (clinicId) query.clinicId = clinicId;
    if (patientId) {
      query.patientId = patientId;
    }
    if (caseId) query.caseId = caseId;

    const visits = await Consultation.find(query).sort({ date: -1, createdAt: -1 });
    res.json({ success: true, count: visits.length, data: visits });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const createConsultation = async (req, res) => {
  try {
    const {
      _id,
      id,
      caseId,
      patientId,
      familyId,
      date,
      time,
      bp,
      sugar,
      other,
      reference,
      refDr,
      complaint,
      investigation,
      dietary,
      diagnosis,
      vitals,
      treatment,
      prescription,
      labReport,
      charge,
      paid,
      received
    } = req.body;

    const clinicId = req.headers['x-clinic-id'] || req.user?.activeClinicId || req.body.clinicId || 'demo';

    const chargeNum = Number(charge || 0);
    const paidNum = Number(paid !== undefined ? paid : (received || 0));
    const dueNum = Math.max(0, chargeNum - paidNum);

    // If updating an existing consultation explicitly by MongoDB _id
    const targetDbId = _id || (id && mongoose.Types.ObjectId.isValid(id) ? id : null);
    if (targetDbId && mongoose.Types.ObjectId.isValid(targetDbId)) {
      let existing = await Consultation.findOne({ _id: targetDbId, clinicId });
      if (existing) {
        Object.assign(existing, req.body, {
          clinicId,
          charge: chargeNum,
          paid: paidNum,
          received: paidNum,
          due: dueNum
        });
        await existing.save();
        return res.status(200).json({ success: true, message: 'Consultation updated', data: existing });
      }
    }

    // Generate clean, unique caseId for new consultation
    let finalCaseId = caseId;
    if (!finalCaseId || String(finalCaseId).startsWith('v_') || String(finalCaseId).includes('undefined')) {
      const count = await Consultation.countDocuments({ clinicId, patientId });
      finalCaseId = `${patientId || 'PAT'}-${String(count + 1).padStart(2, '0')}`;
    }

    // Ensure caseId is unique within this clinic
    let conflict = await Consultation.findOne({ caseId: finalCaseId, clinicId });
    let seq = 1;
    while (conflict) {
      seq++;
      finalCaseId = `${patientId || 'PAT'}-${String(seq).padStart(2, '0')}`;
      conflict = await Consultation.findOne({ caseId: finalCaseId, clinicId });
    }

    const newVisit = new Consultation({
      caseId: finalCaseId,
      patientId: patientId || '',
      familyId: familyId || '',
      clinicId,
      doctorId: req.user?.id || 'demo',
      doctorName: req.user?.name || 'Dr. Chirag Paghdal',
      date: date || new Date().toISOString().slice(0, 10),
      time: time || new Date().toLocaleTimeString(),
      bp,
      sugar,
      other,
      reference: reference || refDr || '',
      refDr: refDr || reference || '',
      complaint,
      investigation,
      dietary,
      diagnosis,
      vitals: vitals || {},
      treatment: treatment || [],
      prescription: prescription || [],
      labReport: (labReport && typeof labReport === 'object') ? labReport : (labReport || null),
      charge: chargeNum,
      paid: paidNum,
      received: paidNum,
      due: dueNum
    });

    await newVisit.save();

    res.status(201).json({ success: true, message: 'Consultation saved', data: newVisit });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const updateConsultation = async (req, res) => {
  try {
    const clinicId = req.headers['x-clinic-id'] || req.user?.activeClinicId || req.query.clinicId;
    const { id } = req.params;
    let query = { $or: [{ caseId: id }, { id: id }] };
    if (mongoose.Types.ObjectId.isValid(id)) {
      query.$or.push({ _id: id });
    }
    if (clinicId) query = { $and: [query, { clinicId }] };

    if (req.body.charge !== undefined || req.body.paid !== undefined || req.body.received !== undefined) {
      const chargeNum = Number(req.body.charge !== undefined ? req.body.charge : 0);
      const paidNum = Number(req.body.paid !== undefined ? req.body.paid : (req.body.received !== undefined ? req.body.received : 0));
      req.body.due = Math.max(0, chargeNum - paidNum);
    }

    const updated = await Consultation.findOneAndUpdate(query, { $set: req.body }, { new: true });
    if (!updated) {
      return res.status(404).json({ success: false, message: 'Consultation not found for update' });
    }

    res.json({ success: true, message: 'Consultation updated', data: updated });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const deleteConsultation = async (req, res) => {
  try {
    const clinicId = req.headers['x-clinic-id'] || req.user?.activeClinicId || req.query.clinicId;
    const { id } = req.params;
    let query = { $or: [{ caseId: id }, { id: id }] };
    if (mongoose.Types.ObjectId.isValid(id)) {
      query.$or.push({ _id: id });
    }
    if (clinicId) query = { $and: [query, { clinicId }] };

    await Consultation.findOneAndDelete(query);
    res.json({ success: true, message: 'Consultation deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { getConsultations, createConsultation, updateConsultation, deleteConsultation };
