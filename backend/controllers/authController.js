const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { User, ROLES } = require('../models/User');

const signToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });

exports.register = async (req, res) => {
  try {
    const { email, password, fullName, role, organizationUnit } = req.body;

    if (!email || !password || !fullName) {
      return res.status(400).json({ message: 'email, password, and fullName are required' });
    }

    let assignedRole = 'NGP';

    if (role) {
      if (!ROLES.includes(role)) {
        return res.status(400).json({ message: `role must be one of: ${ROLES.join(', ')}` });
      }

      // Public registration must never create ADMIN (or any forced role).
      if (!req.user) {
        if (role !== 'NGP') {
          return res.status(403).json({ message: 'Public registration always creates NGP accounts' });
        }
      } else {
        // Only ADMIN can assign staff roles when using /auth/staff.
        if (req.user.role !== 'ADMIN') {
          return res.status(403).json({ message: 'Only ADMIN can assign roles for staff accounts' });
        }
        // Staff creation is limited to non-admin operational roles.
        if (!['FRU', 'NGP', 'MES'].includes(role)) {
          return res.status(400).json({ message: 'Staff role must be FRU, NGP, or MES' });
        }
        assignedRole = role;
      }
    }

    const existing = await User.findOne({ email: email.toLowerCase().trim() });
    if (existing) {
      return res.status(409).json({ message: 'Email already registered' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashed = await bcrypt.hash(password, salt);

    const user = await User.create({
      email: email.toLowerCase().trim(),
      password: hashed,
      fullName: fullName.trim(),
      role: assignedRole,
      organizationUnit: organizationUnit?.trim(),
    });

    const token = signToken(user._id);

    return res.status(201).json({
      token,
      user: user.toJSON(),
    });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(409).json({ message: 'Email already registered' });
    }
    return res.status(500).json({ message: err.message || 'Registration failed' });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'email and password are required' });
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() }).select('+password');
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    user.password = undefined;
    const token = signToken(user._id);

    return res.json({ token, user: user.toJSON() });
  } catch (err) {
    return res.status(500).json({ message: err.message || 'Login failed' });
  }
};

exports.me = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    return res.json(user.toJSON());
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const { fullName, organizationUnit, password, email } = req.body;
    const user = await User.findById(req.user._id).select('+password');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (fullName !== undefined) user.fullName = String(fullName).trim();
    if (organizationUnit !== undefined) user.organizationUnit = String(organizationUnit).trim();
    if (email !== undefined) user.email = String(email).toLowerCase().trim();

    if (password) {
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(password, salt);
    }

    await user.save();
    return res.json(user.toJSON());
  } catch (err) {
    if (err.code === 11000) {
      return res.status(409).json({ message: 'Email already in use' });
    }
    return res.status(400).json({ message: err.message });
  }
};

// ADMIN only — change another user's role
exports.updateUserRole = async (req, res) => {
  try {
    const { id } = req.params;
    const { role } = req.body;

    if (!ROLES.includes(role)) {
      return res.status(400).json({ message: `role must be one of: ${ROLES.join(', ')}` });
    }

    const user = await User.findByIdAndUpdate(id, { role }, { new: true, runValidators: true });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    return res.json(user.toJSON());
  } catch (err) {
    return res.status(400).json({ message: err.message });
  }
};

exports.listUsers = async (_req, res) => {
  try {
    const users = await User.find().sort({ createdAt: -1 });
    return res.json(users.map((u) => u.toJSON()));
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};