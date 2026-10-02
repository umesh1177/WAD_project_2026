const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve frontend static assets
app.use(express.static(path.join(__dirname, '../frontend')));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    timestamp: new Date().toISOString(),
    service: 'Dhyey Clinic Admin Portal API',
  });
});

// Admin dashboard direct route
app.get('/admin', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/pages/admin/dashboard.html'));
});

// Root route redirect to Admin Dashboard
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/pages/admin/dashboard.html'));
});

// SPA fallback for all other routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/pages/admin/dashboard.html'));
});

app.listen(PORT, () => {
  console.log('=========================================');
  console.log(` Admin Portal Server running on port ${PORT}`);
  console.log(` Admin Dashboard: http://localhost:${PORT}/pages/admin/dashboard.html`);
  console.log(` Root URL:        http://localhost:${PORT}`);
  console.log('=========================================');
});
