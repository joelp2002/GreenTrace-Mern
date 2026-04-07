const mongoose = require('mongoose');

const PERMIT_STATUSES = ['draft', 'active', 'expired', 'revoked', 'suspended'];

const permitSchema = new mongoose.Schema(
  {
    permitNumber: {
      type: String,
      required: [true, 'Permit number is required'],
      unique: true,
      trim: true,
      uppercase: true,
      minlength: [4, 'Permit number must be at least 4 characters'],
      maxlength: [64, 'Permit number cannot exceed 64 characters'],
    },
    issueDate: {
      type: Date,
      required: [true, 'Issue date is required'],
    },
    expiryDate: {
      type: Date,
      required: [true, 'Expiry date is required'],
      validate: {
        validator(value) {
          return !this.issueDate || value >= this.issueDate;
        },
        message: 'Expiry date must be on or after issue date',
      },
    },
    holderName: {
      type: String,
      required: [true, 'Permit holder name is required'],
      trim: true,
      maxlength: [200, 'Holder name cannot exceed 200 characters'],
    },
    holderContact: {
      type: String,
      trim: true,
      maxlength: [100, 'Contact cannot exceed 100 characters'],
    },
    status: {
      type: String,
      required: true,
      enum: {
        values: PERMIT_STATUSES,
        message: `Status must be one of: ${PERMIT_STATUSES.join(', ')}`,
      },
      default: 'draft',
    },
    speciesAllowed: [
      {
        type: String,
        trim: true,
        maxlength: [120, 'Species name too long'],
      },
    ],
    maxSeedlingCap: {
      type: Number,
      min: [0, 'Cap cannot be negative'],
      default: null,
    },
    notes: {
      type: String,
      maxlength: [2000, 'Notes cannot exceed 2000 characters'],
    },
    issuedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Issuing officer (User) is required'],
    },
  },
  { timestamps: true }
);

permitSchema.index({ status: 1, expiryDate: 1 });
permitSchema.index({ issuedBy: 1 });

module.exports = {
  Permit: mongoose.model('Permit', permitSchema),
  PERMIT_STATUSES,
};
