const mongoose = require('mongoose');
const Clinic = require('../models/Clinic');

/**
 * Resolve all equivalent clinic identifier representations (clinicId, name, Mongo _id)
 * so that both Doctor and Receptionist of a clinic always see the exact same isolated data.
 */
const resolveClinicMatchValues = async (rawClinicId) => {
  if (!rawClinicId) return [];
  const cleanId = String(rawClinicId).trim();
  const values = new Set([cleanId]);

  if (cleanId === 'demo' || cleanId === 'CLN-001') {
    values.add('demo');
    values.add('CLN-001');
  }

  try {
    const isMongoId = mongoose.Types.ObjectId.isValid(cleanId) && String(new mongoose.Types.ObjectId(cleanId)) === cleanId;
    const filter = isMongoId
      ? { $or: [{ _id: cleanId }, { clinicId: cleanId }, { name: cleanId }] }
      : { $or: [{ clinicId: cleanId }, { name: cleanId }] };

    const clinic = await Clinic.findOne(filter).lean();
    if (clinic) {
      if (clinic.clinicId) values.add(clinic.clinicId);
      if (clinic._id) values.add(clinic._id.toString());
      if (clinic.name) values.add(clinic.name);
      if (clinic.clinicId === 'CLN-001') values.add('demo');
    }
  } catch (e) {
    // Non-blocking fallback
  }

  return Array.from(values);
};

/**
 * Build a MongoDB query object for clinic matching
 */
const getClinicQuery = async (rawClinicId) => {
  if (!rawClinicId) return {};
  const values = await resolveClinicMatchValues(rawClinicId);
  return values.length === 1 ? { clinicId: values[0] } : { clinicId: { $in: values } };
};

module.exports = {
  resolveClinicMatchValues,
  getClinicQuery
};
