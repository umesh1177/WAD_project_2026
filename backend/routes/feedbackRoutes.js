const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');
const {
  createFeedback,
  getDoctorFeedback,
  getAllFeedback,
  getFeedbackById,
  addReply,
  updateStatus,
  approveClinicRequest,
} = require('../controllers/feedbackController');

// All feedback routes require authentication
router.use(authMiddleware);

// Doctor & General User Routes
router.post('/', createFeedback);
router.get('/', getDoctorFeedback);
router.get('/my-tickets', getDoctorFeedback);

// Admin Routes
router.get('/admin/all', roleMiddleware(['admin']), getAllFeedback);
router.patch('/:id/status', updateStatus);
router.post('/:id/approve-clinic', roleMiddleware(['admin']), approveClinicRequest);

// Single ticket & Replies
router.get('/:id', getFeedbackById);
router.post('/:id/reply', addReply);

module.exports = router;
