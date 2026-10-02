const express = require('express');
const router = express.Router();
const {
  getClinics,
  getClinicById,
  createClinic,
  updateClinic,
  updateClinicServices,
  deleteClinic,
  getClinicRequests,
  createClinicRequest,
  updateClinicRequestStatus,
} = require('../controllers/clinicController');

// Clinic Registration Requests (Landing page & Admin)
router.get('/requests', getClinicRequests);
router.post('/register-request', createClinicRequest);
router.patch('/requests/:id', updateClinicRequestStatus);

// Clinics CRUD
router.get('/', getClinics);
router.get('/:id', getClinicById);
router.post('/', createClinic);
router.put('/:id', updateClinic);
router.patch('/:id', updateClinic);
router.delete('/:id', deleteClinic);
router.put('/:id/services', updateClinicServices);

module.exports = router;
