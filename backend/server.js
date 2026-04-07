require('dotenv').config();
const path = require('path');
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');

const authRoutes = require('./routes/authRoutes');
const permitRoutes = require('./routes/permitRoutes');
const siteRoutes = require('./routes/siteRoutes');
const seedlingRoutes = require('./routes/seedlingRoutes');
const reportRoutes = require('./routes/reportRoutes');
const uploadRoutes = require('./routes/uploadRoutes');

const app = express();
const PORT = process.env.PORT || 5002;

const origins = (process.env.FRONTEND_URL || 'http://localhost:5173')
  .split(',')
  .map((o) => o.trim())
  .filter(Boolean);

app.use(
  cors({
    origin: origins.length ? origins : true,
    credentials: true,
  })
);
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true }));

app.use(
  '/uploads',
  express.static(path.join(__dirname, 'uploads'), {
    maxAge: '7d',
  })
);

app.get('/api/v1/health', (_req, res) => {
  res.json({
    ok: true,
    service: 'GreenTrace API',
    timestamp: new Date().toISOString(),
  });
});

app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/permits', permitRoutes);
app.use('/api/v1/planting-sites', siteRoutes);
app.use('/api/v1/seedlings', seedlingRoutes);
app.use('/api/v1/reports', reportRoutes);
app.use('/api/v1/upload', uploadRoutes);

app.use((err, _req, res, _next) => {
  console.error(err);
  if (err.message && err.message.includes('Only JPEG')) {
    return res.status(400).json({ message: err.message });
  }
  res.status(500).json({ message: err.message || 'Internal server error' });
});

async function start() {
  try {
    await connectDB();
    app.listen(PORT, () => {
      console.log(`GreenTrace API listening on port ${PORT}`);
    });
  } catch (e) {
    console.error('Failed to start server:', e.message);
    process.exit(1);
  }
}

start();
