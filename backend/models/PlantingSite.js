const mongoose = require('mongoose');

const sitePhotoSchema = new mongoose.Schema(
  {
    url: {
      type: String,
      required: true,
      trim: true,
    },
    caption: {
      type: String,
      trim: true,
      maxlength: [500, 'Caption too long'],
    },
    uploadedAt: { type: Date, default: Date.now },
  },
  { _id: true }
);

const plantingSiteSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Site name is required'],
      trim: true,
      maxlength: [200, 'Name cannot exceed 200 characters'],
    },
    location: {
      type: {
        type: String,
        enum: ['Point'],
        required: true,
        default: 'Point',
      },
      coordinates: {
        type: [Number],
        required: [true, 'Coordinates [longitude, latitude] are required'],
        validate: {
          validator(coords) {
            return (
              Array.isArray(coords) &&
              coords.length === 2 &&
              typeof coords[0] === 'number' &&
              typeof coords[1] === 'number' &&
              coords[0] >= -180 &&
              coords[0] <= 180 &&
              coords[1] >= -90 &&
              coords[1] <= 90
            );
          },
          message: 'Invalid GeoJSON point: use [longitude, latitude] in valid ranges',
        },
      },
    },
    address: {
      type: String,
      trim: true,
      maxlength: [500, 'Address too long'],
    },
    municipality: {
      type: String,
      required: [true, 'Municipality is required'],
      trim: true,
      maxlength: [120, 'Municipality name too long'],
    },
    province: {
      type: String,
      required: [true, 'Province is required'],
      trim: true,
      maxlength: [120, 'Province name too long'],
    },
    region: {
      type: String,
      required: [true, 'Region is required'],
      trim: true,
      maxlength: [80, 'Region label too long'],
    },
    areaHectares: {
      type: Number,
      min: [0, 'Area cannot be negative'],
      max: [100000, 'Area unrealistically large'],
    },
    establishedDate: {
      type: Date,
    },
    photos: [sitePhotoSchema],
    notes: {
      type: String,
      maxlength: [2000, 'Notes too long'],
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Creating user is required'],
    },
  },
  { timestamps: true }
);

plantingSiteSchema.index({ location: '2dsphere' });
plantingSiteSchema.index({ municipality: 1, province: 1 });

module.exports = mongoose.model('PlantingSite', plantingSiteSchema);
