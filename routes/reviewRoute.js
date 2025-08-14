const express = require('express');
const fs = require('fs');
const path = require('path');
const pdfParse = require('pdf-parse');
const { getAIResponse } = require('../services/aiService');

const router = express.Router();
const projectsFile = path.join(__dirname, '../projects.json');

/**
 * Helper: read PDF text and clean BOM / non-printable chars
 */
async function extractPdfText(filePath) {
  if (!fs.existsSync(filePath)) return '';
  const pdfBuffer = fs.readFileSync(filePath);
  const data = await pdfParse(pdfBuffer);

  // Remove non-printable characters and BOM
  return data.text.replace(/[\u0000-\u001F\u007F-\u009F\uFEFF]/g, '');
}

/**
 * GET /api/review/:projectId
 * Fetch AI response for the selected project
 */
router.get('/:projectId', async (req, res) => {
  const projectId = Number(req.params.projectId);

  if (!fs.existsSync(projectsFile)) {
    return res.status(404).json({ error: 'Projects file not found' });
  }

  try {
    const projects = JSON.parse(fs.readFileSync(projectsFile, 'utf8') || '[]');
    const project = projects.find(p => p.id === projectId);
    if (!project) return res.status(404).json({ error: 'Project not found' });

    let pdfText = '';
    if (project.filePath) {
      pdfText = await extractPdfText(path.join(__dirname, '..', project.filePath));
    }

    const aiResponse = await getAIResponse(project.query || 'No query provided', pdfText);

    res.json({ message: aiResponse });

  } catch (err) {
    console.error('❌ AI GET error:', err);
    res.status(500).json({ message: "Oops! Something went wrong while fetching the AI response. Try again." });
  }
});

/**
 * POST /api/review/:projectId
 * Send chat input to AI
 * Body: { prompt: "user message" }
 */
router.post('/:projectId', async (req, res) => {
  const projectId = Number(req.params.projectId);
  const { prompt } = req.body;

  if (!prompt) return res.status(400).json({ message: 'Please provide a message to send to the AI.' });

  if (!fs.existsSync(projectsFile)) {
    return res.status(404).json({ message: 'Projects file not found' });
  }

  try {
    const projects = JSON.parse(fs.readFileSync(projectsFile, 'utf8') || '[]');
    const project = projects.find(p => p.id === projectId);
    if (!project) return res.status(404).json({ message: 'Project not found' });

    let pdfText = '';
    if (project.filePath) {
      pdfText = await extractPdfText(path.join(__dirname, '..', project.filePath));
    }

    const aiResponse = await getAIResponse(prompt, pdfText);

    res.json({ message: aiResponse });

  } catch (err) {
    console.error('❌ AI POST error:', err);
    res.status(500).json({ message: "Oops! Something went wrong while sending your message to the AI." });
  }
});

module.exports = router;
