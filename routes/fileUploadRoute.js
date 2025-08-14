/**
 * LexiCore AI – Project Review Tool
 * Version: 1.1.0
 * Release Date: 14-Aug-2025
 * Description: Handles PDF file uploads, stores project metadata in projects.json
 */



const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const router = express.Router();

// Multer storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(__dirname, '../uploads');
    if (!fs.existsSync(uploadPath)) fs.mkdirSync(uploadPath, { recursive: true });
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const sanitized = file.originalname.replace(/\s+/g, '_'); // replace spaces
    cb(null, uniqueSuffix + '-' + sanitized);
  }

});

const upload = multer({ storage });

// POST /api/upload
router.post('/', upload.single('pdfFile'), (req, res) => {
  try {
    const { name, description, query } = req.body;

    if (!name || !query || !req.file) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const pdfFilePath = `/uploads/${req.file.filename}`; // safe URL

    const projectsFile = path.join(__dirname, '../projects.json');
    let projects = [];

    if (fs.existsSync(projectsFile)) {
      const data = fs.readFileSync(projectsFile, 'utf8');
      try { projects = JSON.parse(data || '[]'); } catch { projects = []; }
    }

    const newProject = {
      id: Date.now(),
      name,
      description: description || '',
      query,
      filePath: pdfFilePath
    };

    projects.push(newProject);
    fs.writeFileSync(projectsFile, JSON.stringify(projects, null, 2));

    res.json({ message: 'Project saved successfully', project: newProject });
  } catch (err) {
    console.error('Error saving project:', err);
    res.status(500).json({ error: 'Server error while saving project' });
  }
});

module.exports = router;


