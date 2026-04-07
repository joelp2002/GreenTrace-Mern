const PlantingSite = require('../models/PlantingSite');
const Seedling = require('../models/Seedling');

function toGeoBody(body) {
  const { longitude, latitude, ...rest } = body;
  if (
    longitude != null &&
    latitude != null &&
    !rest.location
  ) {
    rest.location = {
      type: 'Point',
      coordinates: [Number(longitude), Number(latitude)],
    };
  }
  return rest;
}

exports.list = async (req, res) => {
  try {
    const { municipality, province } = req.query;
    const filter = {};
    if (municipality) filter.municipality = new RegExp(municipality, 'i');
    if (province) filter.province = new RegExp(province, 'i');

    const sites = await PlantingSite.find(filter)
      .populate('createdBy', 'fullName email role')
      .sort({ createdAt: -1 });
    return res.json(sites);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

/** Geo near query: ?near=lng,lat&maxKm=50 */
exports.listNear = async (req, res) => {
  try {
    const { near, maxKm = 100 } = req.query;
    if (!near) {
      return res.status(400).json({ message: 'Query param near=lng,lat is required' });
    }
    const [lng, lat] = near.split(',').map(Number);
    if (Number.isNaN(lng) || Number.isNaN(lat)) {
      return res.status(400).json({ message: 'near must be longitude,latitude' });
    }
    const sites = await PlantingSite.find({
      location: {
        $near: {
          $geometry: { type: 'Point', coordinates: [lng, lat] },
          $maxDistance: Number(maxKm) * 1000,
        },
      },
    })
      .populate('createdBy', 'fullName email role')
      .limit(100);
    return res.json(sites);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

exports.getOne = async (req, res) => {
  try {
    const site = await PlantingSite.findById(req.params.id).populate(
      'createdBy',
      'fullName email role'
    );
    if (!site) {
      return res.status(404).json({ message: 'Planting site not found' });
    }
    const seedlings = await Seedling.find({ plantingSite: site._id })
      .populate('permit', 'permitNumber status')
      .populate('recordedBy', 'fullName')
      .sort({ createdAt: -1 });
    return res.json({ site, seedlings });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

exports.create = async (req, res) => {
  try {
    const body = toGeoBody({
      ...req.body,
      createdBy: req.user._id,
    });
    if (body.establishedDate) body.establishedDate = new Date(body.establishedDate);
    const site = await PlantingSite.create(body);
    const populated = await PlantingSite.findById(site._id).populate(
      'createdBy',
      'fullName email role'
    );
    return res.status(201).json(populated);
  } catch (err) {
    return res.status(400).json({ message: err.message });
  }
};

exports.update = async (req, res) => {
  try {
    const body = toGeoBody({ ...req.body });
    delete body.createdBy;
    if (body.establishedDate) body.establishedDate = new Date(body.establishedDate);
    const site = await PlantingSite.findByIdAndUpdate(req.params.id, body, {
      new: true,
      runValidators: true,
    }).populate('createdBy', 'fullName email role');
    if (!site) {
      return res.status(404).json({ message: 'Planting site not found' });
    }
    return res.json(site);
  } catch (err) {
    return res.status(400).json({ message: err.message });
  }
};

exports.addPhoto = async (req, res) => {
  try {
    const { filePublicUrl } = require('../utils/publicUrl');
    if (!req.file) {
      return res.status(400).json({ message: 'No image file uploaded' });
    }
    const url = filePublicUrl(req, req.file.filename);
    const site = await PlantingSite.findById(req.params.id);
    if (!site) {
      return res.status(404).json({ message: 'Planting site not found' });
    }
    site.photos.push({ url, caption: req.body.caption || '' });
    await site.save();
    return res.status(201).json(site);
  } catch (err) {
    return res.status(400).json({ message: err.message });
  }
};

exports.remove = async (req, res) => {
  try {
    const linked = await Seedling.countDocuments({ plantingSite: req.params.id });
    if (linked > 0) {
      return res.status(400).json({
        message: `Cannot delete site with ${linked} seedling record(s).`,
      });
    }
    const site = await PlantingSite.findByIdAndDelete(req.params.id);
    if (!site) {
      return res.status(404).json({ message: 'Planting site not found' });
    }
    return res.json({ message: 'Planting site removed', id: req.params.id });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};
