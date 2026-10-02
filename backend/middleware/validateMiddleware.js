/**
 * ====================================================
 * VALIDATION MIDDLEWARE
 * Reusable request body validators for all routes.
 * Returns user-friendly 400 messages for invalid data.
 * ====================================================
 */

// ---- helpers ----
const isValidEmail = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(v || '').trim());
const isValidPhone = (v) => /^[6-9]\d{9}$/.test(String(v || '').replace(/\D/g, ''));
const isNonEmpty = (v) => v !== undefined && v !== null && String(v).trim().length > 0;
const isPositiveNum = (v) => !isNaN(Number(v)) && Number(v) >= 0;
const validGenders = ['Male', 'Female', 'Other', 'male', 'female', 'other'];
const validBloodGroups = ['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-', 'Unknown', ''];

function validationError(res, message, field = null) {
  return res.status(400).json({
    success: false,
    error: 'VALIDATION_ERROR',
    field,
    message,
  });
}

// ---- Family Registration ----
const validateFamily = (req, res, next) => {
  const { headName, phone, area, society } = req.body;

  if (!isNonEmpty(headName))
    return validationError(res, 'Family head name is required.', 'headName');
  if (String(headName).trim().length < 3)
    return validationError(res, 'Family head name must be at least 3 characters.', 'headName');
  if (phone && !isValidPhone(phone))
    return validationError(res, 'Please enter a valid 10-digit Indian mobile number.', 'phone');

  next();
};

// ---- Patient / Member Registration ----
const validatePatient = (req, res, next) => {
  const { name, age, gender, relation } = req.body;

  if (!isNonEmpty(name))
    return validationError(res, 'Patient name is required.', 'name');
  if (String(name).trim().length < 2)
    return validationError(res, 'Patient name must be at least 2 characters.', 'name');
  if (age !== undefined && age !== null && age !== '') {
    const ageNum = Number(age);
    if (isNaN(ageNum) || ageNum < 0 || ageNum > 130)
      return validationError(res, 'Please enter a valid age between 0 and 130.', 'age');
  }
  if (gender && !validGenders.includes(gender))
    return validationError(res, 'Gender must be Male, Female, or Other.', 'gender');

  next();
};

// ---- Appointment ----
const validateAppointment = (req, res, next) => {
  const patient = req.body.patientName || req.body.patId || req.body.patientId;
  const aptDate = req.body.appointmentDate || req.body.date;

  if (!isNonEmpty(patient))
    return validationError(res, 'Patient information is required for the appointment.', 'patientName');
  if (!isNonEmpty(aptDate))
    return validationError(res, 'Appointment date is required.', 'appointmentDate');

  next();
};

// ---- Consultation ----
const validateConsultation = (req, res, next) => {
  const patient = req.body.patId || req.body.patientId;
  const family = req.body.familyId || req.body.famId;

  if (!isNonEmpty(patient))
    return validationError(res, 'Patient ID is required to create a consultation.', 'patientId');
  if (!isNonEmpty(family))
    return validationError(res, 'Family ID is required to create a consultation.', 'familyId');

  next();
};

// ---- Prescription ----
const validatePrescription = (req, res, next) => {
  const patient = req.body.patId || req.body.patientId;
  const caseRef = req.body.caseId;

  if (!isNonEmpty(patient) && !isNonEmpty(caseRef))
    return validationError(res, 'Patient ID or Case ID is required for the prescription.', 'patientId');

  next();
};

// ---- Billing ----
const validateBill = (req, res, next) => {
  const patient = req.body.patId || req.body.patientId;
  const amount = req.body.totalCharge !== undefined ? req.body.totalCharge : req.body.amount;

  if (!isNonEmpty(patient))
    return validationError(res, 'Patient ID is required to create a bill.', 'patientId');
  if (amount !== undefined && !isPositiveNum(amount))
    return validationError(res, 'Bill amount must be a non-negative number.', 'totalCharge');

  next();
};

// ---- Medical Certificate ----
const validateCertificate = (req, res, next) => {
  const patient = req.body.patientName || req.body.patId || req.body.patientId;
  const diagnosis = req.body.diagnosis;
  const fromDate = req.body.fromDate;
  const toDate = req.body.toDate;

  if (!isNonEmpty(patient))
    return validationError(res, 'Patient name is required for the certificate.', 'patientName');
  if (!isNonEmpty(diagnosis))
    return validationError(res, 'Diagnosis is required for the certificate.', 'diagnosis');
  if (!isNonEmpty(fromDate) || !isNonEmpty(toDate))
    return validationError(res, 'Valid from and to dates are required for the certificate.', 'fromDate');

  next();
};

// ---- Medicine / Inventory ----
const validateMedicine = (req, res, next) => {
  const { name } = req.body;

  if (!isNonEmpty(name))
    return validationError(res, 'Medicine name is required.', 'name');
  if (String(name).trim().length < 2)
    return validationError(res, 'Medicine name must be at least 2 characters.', 'name');

  next();
};

// ---- Feedback / Support ----
const validateFeedback = (req, res, next) => {
  const { subject, message, category } = req.body;

  if (!isNonEmpty(subject))
    return validationError(res, 'Feedback subject is required.', 'subject');
  if (String(subject).trim().length < 5)
    return validationError(res, 'Subject must be at least 5 characters.', 'subject');
  if (!isNonEmpty(message))
    return validationError(res, 'Feedback message is required.', 'message');
  if (String(message).trim().length < 10)
    return validationError(res, 'Please provide a more detailed message (at least 10 characters).', 'message');

  next();
};

// ---- Follow-Up ----
const validateFollowUp = (req, res, next) => {
  const patient = req.body.patId || req.body.patientId;
  const followUpDate = req.body.followUpDate || req.body.date;

  if (!isNonEmpty(patient))
    return validationError(res, 'Patient ID is required for the follow-up.', 'patientId');
  if (!isNonEmpty(followUpDate))
    return validationError(res, 'Follow-up date is required.', 'followUpDate');

  next();
};

// ---- Diagnosis ----
const validateDiagnosis = (req, res, next) => {
  const diagName = req.body.name || req.body.diagnosis;

  if (!isNonEmpty(diagName))
    return validationError(res, 'Diagnosis name is required.', 'name');

  next();
};

// ---- Payment ----
const validatePayment = (req, res, next) => {
  const { billId, patId, patientId, amount } = req.body;
  const patient = patId || patientId || billId;

  if (!isNonEmpty(patient))
    return validationError(res, 'Patient ID or Bill ID is required for payment.', 'patientId');
  if (!isPositiveNum(amount) || Number(amount) <= 0)
    return validationError(res, 'A valid positive payment amount is required.', 'amount');

  next();
};

// ---- History ----
const validateHistory = (req, res, next) => {
  const patient = req.body.patId || req.body.patientId || req.params.patientId;

  if (!isNonEmpty(patient))
    return validationError(res, 'Patient ID is required to save medical history.', 'patientId');

  next();
};

module.exports = {
  validateFamily,
  validatePatient,
  validateAppointment,
  validateConsultation,
  validatePrescription,
  validateBill,
  validateCertificate,
  validateMedicine,
  validateFeedback,
  validateFollowUp,
  validateDiagnosis,
  validatePayment,
  validateHistory,
};
