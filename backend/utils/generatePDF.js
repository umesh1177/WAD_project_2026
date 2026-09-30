/**
 * HTML Print Template Generators for Prescription & Medical Certificate
 */
const { fmtDate, fmtMoney } = require('./generateId');

const generatePrescriptionHTML = ({ doctor, clinic, patient, visit, dietaryText, lang = 'EN' }) => {
  const isGu = lang === 'GU';
  const isHi = lang === 'HI';

  const t = {
    med: isGu ? 'દવા' : isHi ? 'दवा' : 'Medicine',
    qty: isGu ? 'માત્રા' : isHi ? 'मात्रा' : 'Qty',
    inst: isGu ? 'લેવાની રીત' : isHi ? 'खुराक का विवरण' : 'Dosage Instructions',
    diet: isGu ? 'ખાવાની પરેજી:' : isHi ? 'आहार संबंधी सलाह:' : 'Dietary Advice:',
    mor: isGu ? 'સવારે' : isHi ? 'सुबह' : 'Morning',
    noon: isGu ? 'બપોરે' : isHi ? 'दोपहर' : 'Noon',
    eve: isGu ? 'સાંજે' : isHi ? 'शाम' : 'Evening',
    ngt: isGu ? 'રાત્રે' : isHi ? 'रात' : 'Night',
    bf: isGu ? 'જમ્યા પહેલા' : isHi ? 'खाने से पहले' : 'Before Food',
    af: isGu ? 'જમ્યા પછી' : isHi ? 'खाने के बाद' : 'After Food',
  };

  const rxRows = (visit.prescription || [])
    .map((p) => {
      const parts = [];
      if (p.mor && p.mor !== '0') parts.push(`${p.mor} ${t.mor}`);
      if (p.noon && p.noon !== '0') parts.push(`${p.noon} ${t.noon}`);
      if (p.eve && p.eve !== '0') parts.push(`${p.eve} ${t.eve}`);
      if (p.ngt && p.ngt !== '0') parts.push(`${p.ngt} ${t.ngt}`);

      let timing = '';
      if (p.timing === 'BF') timing = ` (${t.bf})`;
      else if (p.timing === 'AF') timing = ` (${t.af})`;
      else if (p.timing) timing = ` (${p.timing})`;

      const dosage = parts.length > 0 ? parts.join(', ') + timing : timing || '-';
      return `
      <tr>
        <td style="padding: 6px 8px; border-bottom: 1px solid #eee; font-weight: 600;">${p.name}</td>
        <td style="padding: 6px 8px; border-bottom: 1px solid #eee; text-align: center;">${p.qty || '-'}</td>
        <td style="padding: 6px 8px; border-bottom: 1px solid #eee; color: #444;">${dosage}</td>
      </tr>`;
    })
    .join('');

  return `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="utf-8">
    <title>Prescription - ${patient.name}</title>
    <style>
      @page { size: A5 portrait; margin: 8mm; }
      body { font-family: 'Inter', Arial, sans-serif; color: #222; margin: 0; padding: 12px; }
      .header { display: flex; justify-content: space-between; border-bottom: 2px solid #146B5C; padding-bottom: 8px; }
      .clinic-name { font-size: 22px; font-weight: bold; color: #146B5C; }
      .dr-name { font-size: 14px; font-weight: 600; color: #333; }
      .patient-bar { display: flex; justify-content: space-between; margin: 12px 0; font-size: 13px; font-weight: bold; background: #EEF6F4; padding: 6px 10px; border-radius: 6px; }
      table { width: 100%; border-collapse: collapse; margin-top: 8px; font-size: 12px; }
      th { text-align: left; padding: 6px 8px; border-bottom: 2px solid #ccc; font-size: 11px; text-transform: uppercase; }
      .dietary { margin-top: 16px; font-size: 12px; background: #fffbe6; padding: 8px 12px; border-radius: 6px; border: 1px solid #ffe58f; }
    </style>
  </head>
  <body>
    <div class="header">
      <div>
        <div class="clinic-name">${clinic.name || 'Dhyey Clinic'}</div>
        <div class="dr-name">Dr. ${doctor.name || doctor.username || 'Physician'}</div>
      </div>
      <div style="text-align: right; font-size: 12px; color: #666;">
        <div>Date: <b>${fmtDate(visit.date)}</b></div>
        <div>Case: <b>${visit.caseId || '-'}</b></div>
      </div>
    </div>

    <div class="patient-bar">
      <div>PATIENT: <span style="text-transform: uppercase;">${patient.name}</span> (Age: ${patient.age || '-'}, ${patient.bloodGroup || ''})</div>
      <div>BP: ${visit.bp || '-'} | Wt: ${visit.weight || '-'} kg</div>
    </div>

    <table>
      <thead>
        <tr>
          <th style="width: 45%;">${t.med}</th>
          <th style="width: 15%; text-align: center;">${t.qty}</th>
          <th style="width: 40%;">${t.inst}</th>
        </tr>
      </thead>
      <tbody>
        ${rxRows}
      </tbody>
    </table>

    ${dietaryText ? `<div class="dietary"><b>${t.diet}</b><br/>${dietaryText}</div>` : ''}

    <div style="margin-top: 40px; display: flex; justify-content: space-between; font-size: 12px;">
      <div>Doctor Signature: _______________</div>
      <div>Clinic Seal</div>
    </div>
  </body>
  </html>`;
};

const generateCertificateHTML = ({ clinicName, patientName, diagnosis, fromDate, toDate, todayDate }) => {
  return `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="utf-8">
    <title>Medical Certificate - ${patientName}</title>
    <style>
      @page { size: A4 portrait; margin: 20mm; }
      body { font-family: 'Inter', Arial, sans-serif; color: #222; padding: 30px; border: 2px solid #146B5C; border-radius: 8px; }
      .header { text-align: center; border-bottom: 2px solid #146B5C; padding-bottom: 16px; margin-bottom: 30px; }
      .clinic { font-size: 28px; font-weight: 800; color: #146B5C; }
      .title { font-size: 18px; font-weight: bold; letter-spacing: 2px; margin-top: 8px; text-transform: uppercase; color: #333; }
      .content { font-size: 16px; line-height: 2.2; text-align: justify; margin: 40px 0; }
      .footer { display: flex; justify-content: space-between; margin-top: 80px; font-size: 14px; }
    </style>
  </head>
  <body>
    <div class="header">
      <div class="clinic">${clinicName || 'Dhyey Clinic & Hospital'}</div>
      <div class="title">Medical Fitness & Rest Certificate</div>
    </div>

    <div class="content">
      This is to certify that <b>${patientName || '____________________'}</b> has been under medical evaluation and treatment for <b>${diagnosis || '____________________'}</b> at this clinic from <b>${fmtDate(fromDate)}</b> to <b>${fmtDate(toDate)}</b>.
      The patient was advised complete medical rest during this period and is now fit to resume normal duties.
    </div>

    <div class="footer">
      <div>
        <b>Date:</b> ${fmtDate(todayDate)}<br>
        <b>Place:</b> Surat
      </div>
      <div style="text-align: right;">
        ___________________________<br>
        <b>Authorized Medical Officer</b><br>
        Registration No. G-9035
      </div>
    </div>
  </body>
  </html>`;
};

module.exports = {
  generatePrescriptionHTML,
  generateCertificateHTML,
};
