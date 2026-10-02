const Feedback = require('../models/Feedback');
const User = require('../models/User');

// Helper to generate unique ticket ID: TKT-2026-0001
const generateTicketNo = async () => {
  const year = new Date().getFullYear();
  const count = await Feedback.countDocuments();
  const seq = String(count + 1).padStart(4, '0');
  return `TKT-${year}-${seq}`;
};

// @desc Create new feedback / support ticket / clinic request
// @route POST /api/feedback
// @access Private (Doctor/Staff/Admin)
const createFeedback = async (req, res, next) => {
  try {
    const {
      category,
      categoryLabel,
      priority,
      subject,
      message,
      metaDetails,
      doctorName,
      clinicName,
    } = req.body;

    if (!subject || !message) {
      return res.status(400).json({
        success: false,
        message: 'Subject and message description are required',
      });
    }

    const doctorId = req.user?.id || req.user?._id || 'demo-doc';
    const activeDoctorName = doctorName || req.user?.name || 'Dr. Chirag Paghdal';
    const activeClinicId = req.headers['x-clinic-id'] || req.user?.activeClinicId || 'demo';
    const activeClinicName = clinicName || 'Dhyey Clinic & Hospital';

    const ticketNo = await generateTicketNo();

    const categoryMap = {
      clinic_request: 'New Clinic Registration Request',
      feature_request: 'Feature Request / Enhancement',
      bug_report: 'Technical Issue / Bug Report',
      general_feedback: 'General Feedback / Support',
    };

    const feedback = new Feedback({
      ticketNo,
      doctorId,
      doctorName: activeDoctorName,
      clinicId: activeClinicId,
      clinicName: activeClinicName,
      category: category || 'general_feedback',
      categoryLabel: categoryLabel || categoryMap[category] || 'General Feedback',
      priority: priority || 'Normal',
      subject: subject.trim(),
      message: message.trim(),
      metaDetails: metaDetails || {},
      status: 'Pending',
      replies: [],
    });

    await feedback.save();

    res.status(201).json({
      success: true,
      message: 'Support request submitted successfully. Admin will review and respond shortly.',
      data: feedback,
    });
  } catch (err) {
    next(err);
  }
};

// @desc Get tickets for the logged-in doctor
// @route GET /api/feedback/my-tickets
// @access Private
const getDoctorFeedback = async (req, res, next) => {
  try {
    const doctorId = req.user?.id || req.user?._id;
    const { status, category, search } = req.query;

    const filter = {};
    if (doctorId && req.user?.role !== 'admin') {
      filter.doctorId = doctorId;
    }
    if (status && status !== 'all') {
      filter.status = status;
    }
    if (category && category !== 'all') {
      filter.category = category;
    }
    if (search) {
      filter.$or = [
        { ticketNo: { $regex: search, $options: 'i' } },
        { subject: { $regex: search, $options: 'i' } },
        { message: { $regex: search, $options: 'i' } },
        { doctorName: { $regex: search, $options: 'i' } },
      ];
    }

    const tickets = await Feedback.find(filter).sort({ createdAt: -1 });

    res.json({
      success: true,
      count: tickets.length,
      data: tickets,
    });
  } catch (err) {
    next(err);
  }
};

// @desc Get all tickets (Admin view)
// @route GET /api/feedback/admin/all
// @access Private (Admin)
const getAllFeedback = async (req, res, next) => {
  try {
    const { status, category, search } = req.query;
    const filter = {};

    if (status && status !== 'all') {
      filter.status = status;
    }
    if (category && category !== 'all') {
      filter.category = category;
    }
    if (search) {
      filter.$or = [
        { ticketNo: { $regex: search, $options: 'i' } },
        { subject: { $regex: search, $options: 'i' } },
        { message: { $regex: search, $options: 'i' } },
        { doctorName: { $regex: search, $options: 'i' } },
        { clinicName: { $regex: search, $options: 'i' } },
      ];
    }

    const tickets = await Feedback.find(filter).sort({ createdAt: -1 });

    res.json({
      success: true,
      count: tickets.length,
      data: tickets,
    });
  } catch (err) {
    next(err);
  }
};

// @desc Get single ticket by ID or TicketNo
// @route GET /api/feedback/:id
// @access Private
const getFeedbackById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const ticket = await Feedback.findOne({
      $or: [{ _id: id.match(/^[0-9a-fA-F]{24}$/) ? id : null }, { ticketNo: id }],
    });

    if (!ticket) {
      return res.status(404).json({
        success: false,
        message: 'Feedback ticket not found',
      });
    }

    res.json({
      success: true,
      data: ticket,
    });
  } catch (err) {
    next(err);
  }
};

// @desc Add reply to feedback ticket
// @route POST /api/feedback/:id/reply
// @access Private
const addReply = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { message, status } = req.body;

    if (!message || !message.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Reply message text is required',
      });
    }

    const ticket = await Feedback.findOne({
      $or: [{ _id: id.match(/^[0-9a-fA-F]{24}$/) ? id : null }, { ticketNo: id }],
    });

    if (!ticket) {
      return res.status(404).json({
        success: false,
        message: 'Feedback ticket not found',
      });
    }

    const role = req.user?.role === 'admin' ? 'admin' : 'doctor';
    const name = req.user?.name || (role === 'admin' ? 'System Administrator' : 'Doctor');

    ticket.replies.push({
      senderRole: role,
      senderName: name,
      message: message.trim(),
      createdAt: new Date(),
    });

    ticket.lastReplyAt = new Date();

    if (status) {
      ticket.status = status;
    } else if (role === 'admin') {
      ticket.status = 'Resolved';
    } else {
      ticket.status = 'Pending';
    }

    await ticket.save();

    res.json({
      success: true,
      message: 'Reply sent successfully',
      data: ticket,
    });
  } catch (err) {
    next(err);
  }
};

// @desc Update ticket status
// @route PATCH /api/feedback/:id/status
// @access Private (Admin)
const updateStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!['Pending', 'In Progress', 'Resolved', 'Closed'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status value',
      });
    }

    const ticket = await Feedback.findOne({
      $or: [{ _id: id.match(/^[0-9a-fA-F]{24}$/) ? id : null }, { ticketNo: id }],
    });

    if (!ticket) {
      return res.status(404).json({
        success: false,
        message: 'Ticket not found',
      });
    }

    ticket.status = status;
    await ticket.save();

    res.json({
      success: true,
      message: `Ticket status updated to ${status}`,
      data: ticket,
    });
  } catch (err) {
    next(err);
  }
};

// @desc Approve clinic registration request and auto-create clinic
// @route POST /api/feedback/:id/approve-clinic
// @access Private (Admin)
const approveClinicRequest = async (req, res, next) => {
  try {
    const { id } = req.params;
    const ticket = await Feedback.findOne({
      $or: [{ _id: id.match(/^[0-9a-fA-F]{24}$/) ? id : null }, { ticketNo: id }],
    });

    if (!ticket) {
      return res.status(404).json({
        success: false,
        message: 'Ticket not found',
      });
    }

    const clinicName = ticket.metaDetails?.requestedClinicName || ticket.subject;
    const doctorId = ticket.doctorId;

    // Find doctor user and attach new clinic if exists in DB
    const doctorUser = (doctorId && doctorId.match(/^[0-9a-fA-F]{24}$/))
      ? await User.findById(doctorId)
      : await User.findOne({ username: 'dhyey' });

    const newClinicId = 'clinic-' + Date.now();

    if (doctorUser) {
      if (!doctorUser.clinics) doctorUser.clinics = [];
      if (!doctorUser.clinics.some(c => c.name.toLowerCase() === clinicName.toLowerCase())) {
        doctorUser.clinics.push({
          id: newClinicId,
          name: clinicName,
        });
        await doctorUser.save();
      }
    }

    if (!ticket.metaDetails) ticket.metaDetails = {};
    ticket.metaDetails.clinicApproved = true;
    ticket.status = 'Resolved';

    // Auto-append approval reply
    ticket.replies.push({
      senderRole: 'admin',
      senderName: 'System Administrator',
      message: `Official Approval: Your request for registering "${clinicName}" has been APPROVED. The clinic is now active under your account clinics list!`,
      createdAt: new Date(),
    });
    ticket.lastReplyAt = new Date();

    await ticket.save();

    res.json({
      success: true,
      message: `Clinic "${clinicName}" registered and approved successfully!`,
      data: ticket,
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  createFeedback,
  getDoctorFeedback,
  getAllFeedback,
  getFeedbackById,
  addReply,
  updateStatus,
  approveClinicRequest,
};
