/**
 * ID Generation and Formatting Utilities
 */

const pad = (n, len = 4) => String(n || 0).padStart(len, '0');

const todayISO = () => new Date().toISOString().slice(0, 10);

const nowTime = () => {
  const d = new Date();
  return `${pad(d.getHours(), 2)}:${pad(d.getMinutes(), 2)}`;
};

const fmtDate = (iso) => {
  if (!iso) return '-';
  const parts = String(iso).slice(0, 10).split('-');
  if (parts.length < 3) return iso;
  const [y, m, d] = parts;
  return `${d}/${m}/${y}`;
};

const fmtMoney = (n) => `₹${Number(n || 0).toLocaleString('en-IN')}`;

const uid = () => Math.random().toString(36).slice(2, 10);

const makeCaseId = (famId, patId, visitNum) => {
  const f = pad(String(famId).replace(/\D/g, '') || famId, 2);
  const p = pad(String(patId).replace(/\D/g, '') || patId, 2);
  const v = pad(String(visitNum).replace(/\D/g, '') || visitNum, 2);
  return `${f}${p}${v}`;
};

module.exports = {
  pad,
  todayISO,
  nowTime,
  fmtDate,
  fmtMoney,
  uid,
  makeCaseId,
};
