const { pad, todayISO } = require('../utils/generateId');
const { generateCertificateHTML } = require('../utils/generatePDF');

const generateCertificateNumber = (count = 1) => {
  const year = new Date().getFullYear();
  return `MC-${year}-${pad(count, 4)}`;
};

module.exports = {
  generateCertificateNumber,
  generateCertificateHTML,
};
