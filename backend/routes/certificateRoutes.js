const express = require('express');
const router = express.Router();
const certificateController = require('../controllers/certificateController');
const authMiddleware = require('../middleware/authMiddleware');
const { validateCertificate } = require('../middleware/validateMiddleware');

// Certificate CRUD & Verification
router.get('/', authMiddleware, certificateController.getCertificates);
router.post('/', authMiddleware, validateCertificate, certificateController.createCertificate);
router.put('/:id', authMiddleware, certificateController.updateCertificate);
router.delete('/:id', authMiddleware, certificateController.deleteCertificate);
router.get('/verify/:certNo', certificateController.verifyCertificate); // Public verification endpoint

// Certificate Templates CRUD
router.get('/templates', authMiddleware, certificateController.getTemplates);
router.post('/templates', authMiddleware, certificateController.createTemplate);
router.put('/templates/:id', authMiddleware, certificateController.updateTemplate);
router.delete('/templates/:id', authMiddleware, certificateController.deleteTemplate);

module.exports = router;
