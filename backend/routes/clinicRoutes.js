const express = require('express');
const router = express.Router();
const {
    getClinics,
    createClinic,
    getClinicRequests,
    registerClinicRequest,
    updateClinicRequest
} = require('../controllers/clinicController');
const auth = require('../middleware/authMiddleware');

router.get('/', getClinics);
router.post('/', auth, createClinic);
router.get('/requests', getClinicRequests);
router.post('/register-request', registerClinicRequest);
router.patch('/requests/:id', auth, updateClinicRequest);

module.exports = router;
