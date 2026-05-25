const mongoose = require('mongoose');

const analyticsEventSchema = new mongoose.Schema(
  {
    eventType: {
      type: String,
      required: true,
      enum: ['module_start', 'module_complete', 'drop_off', 'error', 'feature_usage'],
    },
    sessionId: {
      type: String,
      required: true,
      index: true,
    },
    platform: {
      type: String,
      enum: ['ios', 'android', 'web'],
      default: 'web',
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    timestamp: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

// We explicitly do NOT include user references here to ensure privacy by default for analytics.
module.exports = mongoose.model('AnalyticsEvent', analyticsEventSchema);
