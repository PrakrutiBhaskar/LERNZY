const mongoose = require('mongoose');

const curriculumNodeSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    nodeType: {
      type: String,
      required: true,
      enum: ['concept', 'grade', 'language', 'example', 'topic'],
    },
    parent: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'CurriculumNode',
      default: null,
    },
    tags: [
      {
        type: String,
        trim: true,
      },
    ],
    metadata: {
      // Store additional specific info like NCERT standard reference, description, etc.
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
  },
  { timestamps: true }
);

// Index for faster lookups by type and name
curriculumNodeSchema.index({ nodeType: 1, name: 1 });

module.exports = mongoose.model('CurriculumNode', curriculumNodeSchema);
