const express = require('express');
const router = express.Router();
const {
    getClinics,
    getClinicById,
    createClinic,
    updateClinic,
    deleteClinic,
    updateClinicServices,
    updateClinicStatus,
    getClinicRequests,
    registerClinicRequest,
    updateClinicRequest,
    deleteClinicRequest
} = require('../controllers/clinicController');

// Clinics CRUD
router.get('/', getClinics);
router.get('/:id', getClinicById);
router.post('/', createClinic);
router.put('/:id', updateClinic);
router.patch('/:id', updateClinic);
router.delete('/:id', deleteClinic);
router.patch('/:id/services', updateClinicServices);
router.patch('/:id/status', updateClinicStatus);

// Clinic Requests
router.get('/requests/all', getClinicRequests);
router.get('/requests', getClinicRequests);
router.post('/register-request', registerClinicRequest);
router.patch('/requests/:id', updateClinicRequest);
router.delete('/requests/:id', deleteClinicRequest);

module.exports = router;
