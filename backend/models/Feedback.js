const mongoose = require('mongoose');

const FeedbackReplySchema = new mongoose.Schema({
  senderRole: {
    type: String,
    enum: ['admin', 'doctor', 'staff'],
    default: 'admin',
  },
  senderName: {
    type: String,
    required: true,
    trim: true,
  },
  message: {
    type: String,
    required: true,
    trim: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const FeedbackSchema = new mongoose.Schema(
  {
    ticketNo: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    doctorId: {
      type: String,
      required: true,
      trim: true,
    },
    doctorName: {
      type: String,
      required: true,
      trim: true,
    },
    clinicId: {
      type: String,
      default: 'demo',
      trim: true,
    },
    clinicName: {
      type: String,
      default: 'Dhyey Clinic & Hospital',
      trim: true,
    },
    category: {
      type: String,
      enum: ['clinic_request', 'feature_request', 'bug_report', 'general_feedback'],
      default: 'general_feedback',
    },
    categoryLabel: {
      type: String,
      default: 'General Feedback',
    },
    priority: {
      type: String,
      enum: ['Low', 'Normal', 'High', 'Urgent'],
      default: 'Normal',
    },
    subject: {
      type: String,
      required: true,
      trim: true,
    },
    message: {
      type: String,
      required: true,
      trim: true,
    },
    // Category-specific metadata
    metaDetails: {
      // For clinic registration requests
      requestedClinicName: { type: String, trim: true },
      clinicCity: { type: String, trim: true },
      clinicAddress: { type: String, trim: true },
      clinicPhone: { type: String, trim: true },
      speciality: { type: String, trim: true },
      clinicApproved: { type: Boolean, default: false },

      // For bug reports
      affectedModule: { type: String, trim: true },
      deviceInfo: { type: String, trim: true },

      // For feature requests
      targetModule: { type: String, trim: true },
      expectedBenefit: { type: String, trim: true },
    },
    status: {
      type: String,
      enum: ['Pending', 'In Progress', 'Resolved', 'Closed'],
      default: 'Pending',
    },
    replies: [FeedbackReplySchema],
    lastReplyAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Feedback', FeedbackSchema);
