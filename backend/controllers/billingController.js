const Bill = require('../models/Bill');

const getBills = async (req, res) => {
  try {
    const bills = await Bill.find().sort({ billDate: -1 });
    res.json({ success: true, count: bills.length, data: bills });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const createBill = async (req, res) => {
  try {
    const { billNo, consultationId, patientId, patientName, totalCharge, paidAmount } = req.body;
    let finalBillNo = billNo;
    if (!finalBillNo) {
      const count = await Bill.countDocuments();
      finalBillNo = `INV-${String(count + 1).padStart(4, '0')}`;
    }

    const netAmount = Number(totalCharge || 0);
    const paidNum = Number(paidAmount || 0);
    const dueAmount = Math.max(0, netAmount - paidNum);

    const newBill = new Bill({
      billNo: finalBillNo,
      consultationId: consultationId || null,
      patientId: patientId || null,
      patientName,
      totalCharge: netAmount,
      paidAmount: paidNum,
      dueAmount,
      status: dueAmount === 0 ? 'Paid' : 'Due'
    });

    await newBill.save();
    res.status(201).json({ success: true, data: newBill });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getDuesReport = async (req, res) => {
  try {
    const bills = await Bill.find({ status: 'Due' });
    res.json({ success: true, count: bills.length, data: bills });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { getBills, createBill, getDuesReport };
