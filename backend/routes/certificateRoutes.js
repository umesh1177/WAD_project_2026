const express = require('express');
const router = express.Router();
const certificateController = require('../controllers/certificateController');
const authMiddleware = require('../middleware/authMiddleware');

router.get('/', authMiddleware, certificateController.getCertificates);
router.post('/', authMiddleware, certificateController.createCertificate);
router.delete('/:id', authMiddleware, certificateController.deleteCertificate);

module.exports = router;
