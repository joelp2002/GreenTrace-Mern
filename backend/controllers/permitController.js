const { Permit } = require('../models/Permit');
const Seedling = require('../models/Seedling');

exports.list = async (req, res) => {
  try {
    const { status } = req.query;
    const filter = {};
    if (status) filter.status = status;
    const permits = await Permit.find(filter)
      .populate('issuedBy', 'fullName email role')
      .sort({ createdAt: -1 });
    return res.json(permits);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

exports.getOne = async (req, res) => {
  try {
    const permit = await Permit.findById(req.params.id).populate(
      'issuedBy',
      'fullName email role organizationUnit'
    );
    if (!permit) {
      return res.status(404).json({ message: 'Permit not found' });
    }
    const seedlingSummary = await Seedling.aggregate([
      { $match: { permit: permit._id } },
      { $group: { _id: null, totalQty: { $sum: '$quantity' }, batches: { $sum: 1 } } },
    ]);
    const summary = seedlingSummary[0] || { totalQty: 0, batches: 0 };
    return res.json({ permit, seedlingReconciliation: summary });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

exports.create = async (req, res) => {
  try {
    const body = {
      ...req.body,
      issuedBy: req.user._id,
    };
    if (body.issueDate) body.issueDate = new Date(body.issueDate);
    if (body.expiryDate) body.expiryDate = new Date(body.expiryDate);
    const permit = await Permit.create(body);
    const populated = await Permit.findById(permit._id).populate(
      'issuedBy',
      'fullName email role'
    );
    return res.status(201).json(populated);
  } catch (err) {
    if (err.code === 11000) {
      return res.status(409).json({ message: 'Permit number already exists' });
    }
    return res.status(400).json({ message: err.message });
  }
};

exports.update = async (req, res) => {
  try {
    const updates = { ...req.body };
    delete updates.issuedBy;
    if (updates.issueDate) updates.issueDate = new Date(updates.issueDate);
    if (updates.expiryDate) updates.expiryDate = new Date(updates.expiryDate);
    const permit = await Permit.findByIdAndUpdate(req.params.id, updates, {
      new: true,
      runValidators: true,
    }).populate('issuedBy', 'fullName email role');
    if (!permit) {
      return res.status(404).json({ message: 'Permit not found' });
    }
    return res.json(permit);
  } catch (err) {
    return res.status(400).json({ message: err.message });
  }
};

exports.remove = async (req, res) => {
  try {
    const linked = await Seedling.countDocuments({ permit: req.params.id });
    if (linked > 0) {
      return res.status(400).json({
        message: `Cannot delete permit with ${linked} linked seedling record(s). Reassign or delete seedlings first.`,
      });
    }
    const permit = await Permit.findByIdAndDelete(req.params.id);
    if (!permit) {
      return res.status(404).json({ message: 'Permit not found' });
    }
    return res.json({ message: 'Permit removed', id: req.params.id });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};
