/**
 * LexiCore AI – Project Review Tool
 * Version: 1.1.2
 * Release Date: 14-Aug-2025
 * Description: Main backend entry point for LexiCore AI – serves frontend, handles API routes.
 */

const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const helmet = require('helmet');
const fs = require('fs');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(
  helmet({
    contentSecurityPolicy: false, // Easier for dev/Render static serving
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Paths
const publicPath = path.resolve(__dirname, 'public');
const uploadsPath = path.resolve(__dirname, 'uploads');

// Serve static frontend
app.use(express.static(publicPath));

// Serve uploaded files
app.use('/uploads', express.static(uploadsPath));

// Routes
const fileUploadRoute = require('./routes/fileUploadRoute');
const reviewRoute = require('./routes/reviewRoute');
app.use('/api/upload', fileUploadRoute);

// Shortcut for greetings in review route
app.post('/api/review/:projectId', async (req, res, next) => {
  const greetings = ['hi', 'hello', 'hey', 'yo'];
  const prompt = req.body?.prompt || '';
  if (prompt && greetings.includes(prompt.toLowerCase().trim())) {
    return res.json({
      message: 'Hey there! How can I help you with your project today?',
    });
  }
  next();
});

// AI review route
app.use('/api/review', reviewRoute);

// Serve projects.json
app.get('/projects.json', (req, res) => {
  const projectsFile = path.resolve(__dirname, 'projects.json');
  if (!fs.existsSync(projectsFile)) return res.json([]);
  fs.readFile(projectsFile, 'utf8', (err, data) => {
    if (err) {
      console.error('Error reading projects.json:', err);
      return res.status(500).json({ error: 'Error reading projects file' });
    }
    try {
      res.json(JSON.parse(data || '[]'));
    } catch (parseErr) {
      console.error('Invalid JSON format in projects.json:', parseErr);
      res.status(500).json({ error: 'Invalid projects file format' });
    }
  });
});

// Fallback – Serve index.html for all unknown GET routes (SPA support)
app.get('*', (req, res) => {
  res.sendFile(path.join(publicPath, 'index.html'));
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Server Error:', err.stack);
  res.status(500).json({ message: 'Something broke!' });
});

// Start server
app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
});
