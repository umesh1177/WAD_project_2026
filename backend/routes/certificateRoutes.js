const express = require('express');
const router = express.Router();
const certificateController = require('../controllers/certificateController');
const authMiddleware = require('../middleware/authMiddleware');
const { validateCertificate } = require('../middleware/validateMiddleware');

// Certificate Templates CRUD (MUST come before /:id wildcard)
router.get('/templates', authMiddleware, certificateController.getTemplates);
router.post('/templates', authMiddleware, certificateController.createTemplate);
router.delete('/templates/:id', authMiddleware, certificateController.deleteTemplate);

// Certificate Verification (Public)
router.get('/verify/:certNo', certificateController.verifyCertificate);

// Certificate CRUD
router.get('/', authMiddleware, certificateController.getCertificates);
router.post('/', authMiddleware, validateCertificate, certificateController.createCertificate);
router.delete('/:id', authMiddleware, certificateController.deleteCertificate);

module.exports = router;
