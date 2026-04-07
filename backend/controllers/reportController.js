const Seedling = require('../models/Seedling');
const PlantingSite = require('../models/PlantingSite');
const { Permit } = require('../models/Permit');

exports.summary = async (_req, res) => {
  try {
    const [permitCounts, siteCount, seedAgg, byProvince] = await Promise.all([
      Permit.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]),
      PlantingSite.countDocuments(),
      Seedling.aggregate([
        {
          $group: {
            _id: null,
            totalSeedlings: { $sum: '$quantity' },
            records: { $sum: 1 },
            avgSurvival: { $avg: '$survivalRatePercent' },
          },
        },
      ]),
      Seedling.aggregate([
        {
          $lookup: {
            from: 'plantingsites',
            localField: 'plantingSite',
            foreignField: '_id',
            as: 'site',
          },
        },
        { $unwind: '$site' },
        {
          $group: {
            _id: '$site.province',
            totalQty: { $sum: '$quantity' },
            sites: { $addToSet: '$site._id' },
          },
        },
        {
          $project: {
            province: '$_id',
            totalQty: 1,
            siteCount: { $size: '$sites' },
          },
        },
        { $sort: { totalQty: -1 } },
      ]),
    ]);

    const seed = seedAgg[0] || {
      totalSeedlings: 0,
      records: 0,
      avgSurvival: null,
    };

    return res.json({
      permitsByStatus: permitCounts,
      plantingSiteCount: siteCount,
      seedlingTotals: {
        totalQuantity: seed.totalSeedlings,
        recordCount: seed.records,
        avgSurvivalRatePercent: seed.avgSurvival
          ? Math.round(seed.avgSurvival * 10) / 10
          : null,
      },
      seedlingsByProvince: byProvince,
      generatedAt: new Date().toISOString(),
    });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};
