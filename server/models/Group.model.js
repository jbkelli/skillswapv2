const mongoose = require('mongoose');

const groupSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    enum: [
      'Full-Stack Development',
      'Mobile & Cross-Platform',
      'Data & AI',
      'Cloud & Infrastructure',
      'Security & Blockchain',
      'Creative & Gaming',
      'Quality & Collaboration'
    ]
  },
  icon: {
    type: String,
    required: true
  },
  color: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  members: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  messages: [{
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    message: {
      type: String,
      required: true
    },
    messageType: {
      type: String,
      enum: ['text', 'image', 'file', 'system'],
      default: 'text'
    },
    fileUrl: String,
    fileName: String,
    fileSize: Number,
    isVally: {
      type: Boolean,
      default: false
    },
    vallyTriggeredBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Group', groupSchema);
