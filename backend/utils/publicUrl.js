const path = require('path');

function filePublicUrl(req, filename) {
  const base =
    process.env.API_PUBLIC_URL ||
    `${req.protocol}://${req.get('host')}`;
  return `${base.replace(/\/$/, '')}/uploads/${filename}`;
}

function uploadsAbsolutePath(filename) {
  return path.join(__dirname, '..', 'uploads', filename);
}

module.exports = { filePublicUrl, uploadsAbsolutePath };
