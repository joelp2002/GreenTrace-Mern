const mongoose = require('mongoose');

const ROLES = ['ADMIN', 'FRU', 'NGP', 'MES'];

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email address'],
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [8, 'Password must be at least 8 characters'],
      select: false,
    },
    fullName: {
      type: String,
      required: [true, 'Full name is required'],
      trim: true,
      maxlength: [120, 'Full name cannot exceed 120 characters'],
    },
    role: {
      type: String,
      required: true,
      enum: {
        values: ROLES,
        message: 'Role must be one of: ADMIN, FRU, NGP, MES',
      },
      default: 'NGP',
    },
    organizationUnit: {
      type: String,
      trim: true,
      maxlength: [200, 'Organization unit cannot exceed 200 characters'],
    },
  },
  { timestamps: true }
);

userSchema.methods.toJSON = function toJSON() {
  const obj = this.toObject({ versionKey: false });
  delete obj.password;
  return obj;
};

module.exports = {
  User: mongoose.model('User', userSchema),
  ROLES,
};