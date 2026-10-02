const express = require('express');
const router = express.Router();
const appointmentController = require('../controllers/appointmentController');
const authMiddleware = require('../middleware/authMiddleware');
const { validateAppointment } = require('../middleware/validateMiddleware');

router.get('/', authMiddleware, appointmentController.getAppointments);
router.post('/', authMiddleware, validateAppointment, appointmentController.createAppointment);
router.put('/:id', authMiddleware, appointmentController.updateAppointment);
router.delete('/:id', authMiddleware, appointmentController.deleteAppointment);

module.exports = router;
