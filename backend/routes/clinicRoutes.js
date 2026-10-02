const express = require('express');
const router = express.Router();
const {
  getAllClinics,
  getClinicById,
  createClinic,
  updateClinic,
  deleteClinic,
  getAllDoctors,
  getAllPatientsForAdmin,
  getClinicRequests,
  createClinicRequest,
  updateClinicRequestStatus,
} = require('../controllers/clinicController');

// Requests endpoints (Landing Page <-> Admin)
router.get('/requests', getClinicRequests);
router.post('/register-request', createClinicRequest);
router.patch('/requests/:id', updateClinicRequestStatus);

// Doctors & Patients cross-clinic views
router.get('/doctors', getAllDoctors);
router.get('/patients', getAllPatientsForAdmin);

// Clinics CRUD
router.get('/', getAllClinics);
router.get('/:id', getClinicById);
router.post('/', createClinic);
router.put('/:id', updateClinic);
router.delete('/:id', deleteClinic);

module.exports = router;
