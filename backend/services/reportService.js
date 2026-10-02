const Consultation = require('../models/Consultation');
const Family = require('../models/Family');
const Patient = require('../models/Patient');
const Payment = require('../models/Payment');

const aggregateClinicStats = async (clinicId, dateFilter) => {
  try {
    const families = await Family.find({ clinicId });
    const patients = await Patient.find({ clinicId });
    const allVisits = await Consultation.find({ clinicId });

    const totalFamilies = families.length;
    const totalPatients = patients.length;

    const targetVisits = dateFilter
      ? allVisits.filter((v) => v.date === dateFilter)
      : allVisits;

    const dateCollection = targetVisits.reduce((s, v) => s + (Number(v.received) || 0), 0);
    const totalDue = allVisits.reduce((s, v) => s + (Number(v.due) || 0), 0);

    // Group visits by Referring Doctor
    const drCounts = {};
    // Group visits by Diagnosis
    const diagCounts = {};
    // Group by Area
    const areaCounts = {};

    allVisits.forEach((v) => {
      const dr = v.reference || 'Self';
      drCounts[dr] = (drCounts[dr] || 0) + 1;

      if (v.diagnosis) {
        diagCounts[v.diagnosis] = (diagCounts[v.diagnosis] || 0) + 1;
      }
    });

    families.forEach((f) => {
      const area = f.area || 'Unknown';
      areaCounts[area] = areaCounts[area] || { families: 0, patients: 0, visits: 0 };
      areaCounts[area].families += 1;
    });

    return {
      totalFamilies,
      totalPatients,
      visitsCount: targetVisits.length,
      dateCollection,
      totalDue,
      drCounts,
      diagCounts,
      areaCounts,
    };
  } catch (error) {
    return {
      totalFamilies: 0,
      totalPatients: 0,
      visitsCount: 0,
      dateCollection: 0,
      totalDue: 0,
      drCounts: {},
      diagCounts: {},
      areaCounts: {},
    };
  }
};

module.exports = {
  aggregateClinicStats,
};
