const Seedling = require('../models/Seedling');
const { Permit } = require('../models/Permit');
const PlantingSite = require('../models/PlantingSite');

// Permit lookup scoped to Seedlings module so NGP can encode batches
// without opening full permits module access.
exports.permitOptions = async (_req, res) => {
  try {
    const permits = await Permit.find({ status: 'active' })
      .select('_id permitNumber holderName status expiryDate')
      .sort({ expiryDate: 1, createdAt: -1 });
    return res.json(permits);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

exports.list = async (req, res) => {
  try {
    const { permit, plantingSite, species } = req.query;
    const filter = {};
    if (permit) filter.permit = permit;
    if (plantingSite) filter.plantingSite = plantingSite;
    if (species) filter.species = new RegExp(species, 'i');
    const rows = await Seedling.find(filter)
      .populate('permit', 'permitNumber status expiryDate')
      .populate('plantingSite', 'name municipality province location')
      .populate('recordedBy', 'fullName email role')
      .sort({ createdAt: -1 });
    return res.json(rows);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

exports.getOne = async (req, res) => {
  try {
    const row = await Seedling.findById(req.params.id)
      .populate('permit')
      .populate('plantingSite')
      .populate('recordedBy', 'fullName email role organizationUnit');
    if (!row) {
      return res.status(404).json({ message: 'Seedling record not found' });
    }
    return res.json(row);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

exports.create = async (req, res) => {
  try {
    const permit = await Permit.findById(req.body.permit);
    if (!permit) {
      return res.status(400).json({ message: 'Invalid permit reference' });
    }
    const site = await PlantingSite.findById(req.body.plantingSite);
    if (!site) {
      return res.status(400).json({ message: 'Invalid planting site reference' });
    }
    if (permit.status !== 'active') {
      return res.status(400).json({ message: 'Permit must be active to record seedlings' });
    }
    if (new Date(permit.expiryDate) < new Date()) {
      return res.status(400).json({ message: 'Permit has expired' });
    }
    const body = {
      ...req.body,
      recordedBy: req.user._id,
    };
    if (body.plantedAt) body.plantedAt = new Date(body.plantedAt);
    const row = await Seedling.create(body);
    const populated = await Seedling.findById(row._id)
      .populate('permit', 'permitNumber status')
      .populate('plantingSite', 'name location municipality')
      .populate('recordedBy', 'fullName');
    return res.status(201).json(populated);
  } catch (err) {
    return res.status(400).json({ message: err.message });
  }
};

exports.update = async (req, res) => {
  try {
    const updates = { ...req.body };
    delete updates.recordedBy;
    delete updates.permit;
    delete updates.plantingSite;
    if (updates.plantedAt) updates.plantedAt = new Date(updates.plantedAt);
    const row = await Seedling.findByIdAndUpdate(req.params.id, updates, {
      new: true,
      runValidators: true,
    })
      .populate('permit', 'permitNumber status')
      .populate('plantingSite', 'name location')
      .populate('recordedBy', 'fullName');
    if (!row) {
      return res.status(404).json({ message: 'Seedling record not found' });
    }
    return res.json(row);
  } catch (err) {
    return res.status(400).json({ message: err.message });
  }
};

exports.remove = async (req, res) => {
  try {
    const row = await Seedling.findByIdAndDelete(req.params.id);
    if (!row) {
      return res.status(404).json({ message: 'Seedling record not found' });
    }
    return res.json({ message: 'Seedling record removed', id: req.params.id });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};
