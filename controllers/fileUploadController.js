const path = require('path');
const fs = require('fs');

const projectsFile = path.join(__dirname, '../projects.json');

exports.uploadProject = (req, res) => {
  try {
    const { name, query } = req.body;
    if (!name || !query || !req.file) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Read existing projects
    let projects = [];
    if (fs.existsSync(projectsFile)) {
      projects = JSON.parse(fs.readFileSync(projectsFile, 'utf-8') || '[]');
    }

    // New project object
    const newProject = {
      id: Date.now(),
      name,
      query,
      filePath: `/uploads/${req.file.filename}`
    };

    projects.push(newProject);

    // Save updated projects
    fs.writeFileSync(projectsFile, JSON.stringify(projects, null, 2), 'utf-8');

    res.status(201).json({ message: 'Project added successfully', project: newProject });
  } catch (err) {
    console.error('Error saving project:', err);
    res.status(500).json({ error: 'Server error while saving project' });
  }
};
