const express = require('express');
const router = express.Router();
const {
  getDoctors,
  createDoctor,
  updateDoctor,
  deleteDoctor,
  getAdminAccounts,
  createAdminAccount,
  deleteAdminAccount,
  getAuditLogs,
  createAuditLog,
} = require('../controllers/adminController');

// Doctors CRUD
router.get('/doctors', getDoctors);
router.post('/doctors', createDoctor);
router.put('/doctors/:id', updateDoctor);
router.patch('/doctors/:id', updateDoctor);
router.delete('/doctors/:id', deleteDoctor);

// Admin Accounts CRUD
router.get('/accounts', getAdminAccounts);
router.post('/accounts', createAdminAccount);
router.delete('/accounts/:id', deleteAdminAccount);

// Audit Logs
router.get('/logs', getAuditLogs);
router.post('/logs', createAuditLog);

module.exports = router;
