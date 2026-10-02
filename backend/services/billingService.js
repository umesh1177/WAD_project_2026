const { pad, uid } = require('../utils/generateId');

const calculateBillAmounts = (items = [], discount = 0, previousDue = 0) => {
  const totalCharge = items.reduce((sum, item) => sum + (Number(item.qty || 1) * Number(item.rate || item.cost || item.price || 0)), 0);
  const netAmount = Math.max(0, totalCharge - Number(discount || 0)) + Number(previousDue || 0);

  return {
    totalCharge,
    discount: Number(discount || 0),
    netAmount,
  };
};

const generateBillNumber = (count = 1) => {
  const year = new Date().getFullYear();
  return `INV-${year}-${pad(count, 5)}`;
};

module.exports = {
  calculateBillAmounts,
  generateBillNumber,
};
