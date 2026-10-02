const Bill = require('../models/Bill');
const Patient = require('../models/Patient');
const Family = require('../models/Family');
const Consultation = require('../models/Consultation');
const { todayISO } = require('../utils/generateId');
const { generateBillNumber } = require('../services/billingService');

// Get all bills
const getBills = async (req, res) => {
  try {
    const clinicId = req.headers['x-clinic-id'] || req.user?.activeClinicId || 'demo';
    const { patientId, status, date } = req.query;

    const query = { clinicId };
    if (patientId) query.patientId = patientId;
    if (status) query.status = status;
    if (date) query.billDate = date;

    const bills = await Bill.find(query).sort({ createdAt: -1 });
    res.json({ success: true, count: bills.length, data: bills });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Create a new bill
const createBill = async (req, res) => {
  try {
    const clinicId = req.headers['x-clinic-id'] || req.user?.activeClinicId || 'demo';
    const { patientId, caseId, items, totalCharge, discount, paidAmount, billDate } = req.body;

    if (!patientId) {
      return res.status(400).json({ success: false, message: 'Patient ID is required' });
    }

    const patient = await Patient.findOne({ patId: patientId, clinicId });
    const patientName = patient ? patient.name : 'Patient';
    const familyId = patient ? patient.familyId : '';

    const chargeNum = Number(totalCharge || 0);
    const discNum = Number(discount || 0);
    const netAmount = Math.max(0, chargeNum - discNum);
    const paidNum = Number(paidAmount || 0);
    const dueAmount = Math.max(0, netAmount - paidNum);

    const count = await Bill.countDocuments({ clinicId });
    const billNo = generateBillNumber(count + 1);

    const newBill = new Bill({
      billNo,
      caseId: caseId || '',
      patientId,
      patientName,
      familyId,
      doctorId: req.user?.id || 'demo',
      clinicId,
      items: items || [],
      totalCharge: chargeNum,
      discount: discNum,
      netAmount,
      paidAmount: paidNum,
      dueAmount,
      status: dueAmount === 0 ? 'Paid' : paidNum > 0 ? 'Partial' : 'Due',
      billDate: billDate || todayISO(),
    });

    await newBill.save();
    res.status(201).json({ success: true, message: 'Bill generated successfully', data: newBill });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get outstanding dues breakdown (patient-wise and family-wise)
const getDuesReport = async (req, res) => {
  try {
    const clinicId = req.headers['x-clinic-id'] || req.user?.activeClinicId || 'demo';
    const visits = await Consultation.find({ clinicId, due: { $gt: 0 } });
    const patients = await Patient.find({ clinicId });
    const families = await Family.find({ clinicId });

    const famMap = {};
    families.forEach((f) => { famMap[f.famId] = f; });

    const patMap = {};
    patients.forEach((p) => { patMap[p.patId] = p; });

    // Aggregate by patient
    const patientDues = {};
    visits.forEach((v) => {
      if (!patientDues[v.patientId]) {
        const pat = patMap[v.patientId] || { name: 'Unknown', familyId: v.familyId };
        const fam = famMap[v.familyId] || { headName: 'Unknown' };
        patientDues[v.patientId] = {
          patientId: v.patientId,
          patientName: pat.name,
          familyId: v.familyId,
          familyHead: fam.headName,
          totalDue: 0,
          visitsCount: 0,
          lastVisitDate: v.date,
        };
      }
      patientDues[v.patientId].totalDue += Number(v.due || 0);
      patientDues[v.patientId].visitsCount += 1;
    });

    const duesList = Object.values(patientDues).sort((a, b) => b.totalDue - a.totalDue);
    const grandTotalDue = duesList.reduce((s, d) => s + d.totalDue, 0);

    res.json({
      success: true,
      grandTotalDue,
      count: duesList.length,
      data: duesList,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Update bill status / payment
const updateBill = async (req, res) => {
  try {
    const { id } = req.params;
    const { paidAmount, status, notes } = req.body;

    const bill = await Bill.findById(id);
    if (!bill) {
      return res.status(404).json({ success: false, message: 'Bill not found' });
    }

    if (paidAmount !== undefined) {
      bill.paidAmount = Number(paidAmount);
      bill.dueAmount = Math.max(0, bill.netAmount - bill.paidAmount);
      bill.status = bill.dueAmount === 0 ? 'Paid' : bill.paidAmount > 0 ? 'Partial' : 'Due';
    }
    if (status) bill.status = status;
    if (notes) bill.notes = notes;

    await bill.save();
    res.json({ success: true, message: 'Bill updated successfully', data: bill });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Delete bill
const deleteBill = async (req, res) => {
  try {
    const { id } = req.params;
    await Bill.findByIdAndDelete(id);
    res.json({ success: true, message: 'Bill deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getBills,
  createBill,
  updateBill,
  deleteBill,
  getDuesReport,
};
