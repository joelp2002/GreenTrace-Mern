const { filePublicUrl } = require('../utils/publicUrl');
const exifr = require('exifr');

/**
 * Optional server-side EXIF parse (project also uses exifr on the client).
 */
exports.uploadPhoto = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file' });
    }
    const url = filePublicUrl(req, req.file.filename);
    let exif = null;
    try {
      exif = await exifr.parse(req.file.path, { pick: ['GPSLatitude', 'GPSLongitude', 'DateTimeOriginal'] });
    } catch {
      exif = null;
    }
    return res.status(201).json({ url, filename: req.file.filename, exif });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};
