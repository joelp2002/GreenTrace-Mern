const mongoose = require('mongoose');

const seedlingSchema = new mongoose.Schema(
  {
    species: {
      type: String,
      required: [true, 'Species is required'],
      trim: true,
      maxlength: [120, 'Species name too long'],
    },
    quantity: {
      type: Number,
      required: [true, 'Quantity is required'],
      min: [1, 'Quantity must be at least 1'],
      validate: {
        validator(v) {
          return Number.isInteger(v);
        },
        message: 'Quantity must be a whole number',
      },
    },
    batchCode: {
      type: String,
      required: [true, 'Batch code is required'],
      trim: true,
      uppercase: true,
      minlength: [3, 'Batch code must be at least 3 characters'],
      maxlength: [40, 'Batch code too long'],
    },
    sourceNursery: {
      type: String,
      trim: true,
      maxlength: [200, 'Source nursery name too long'],
    },
    plantedAt: {
      type: Date,
    },
    survivalRatePercent: {
      type: Number,
      min: [0, 'Survival rate cannot be negative'],
      max: [100, 'Survival rate cannot exceed 100'],
    },
    condition: {
      type: String,
      trim: true,
      enum: {
        values: ['excellent', 'good', 'fair', 'poor', 'unknown'],
        message: 'Invalid condition',
      },
      default: 'unknown',
    },
    photoUrl: {
      type: String,
      trim: true,
    },
    reconciliationNotes: {
      type: String,
      maxlength: [2000, 'Notes too long'],
    },
    permit: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Permit',
      required: [true, 'Linked permit is required'],
    },
    plantingSite: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'PlantingSite',
      required: [true, 'Planting site is required'],
    },
    recordedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Recording user is required'],
    },
  },
  { timestamps: true }
);

seedlingSchema.index({ permit: 1 });
seedlingSchema.index({ plantingSite: 1 });
seedlingSchema.index({ batchCode: 1 });

module.exports = mongoose.model('Seedling', seedlingSchema);
