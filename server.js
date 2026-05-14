const express = require('express');
const session = require('express-session');
const bcrypt = require('bcryptjs');
const path = require('path');
const fs = require('fs');
const multer = require('multer');
const { v4: uuidv4 } = require('uuid');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Ensure data directories exist
if (!fs.existsSync('data')) fs.mkdirSync('data');
if (!fs.existsSync('uploads')) fs.mkdirSync('uploads');
if (!fs.existsSync('uploads/projects')) fs.mkdirSync('uploads/projects', { recursive: true });

// Middleware
app.use(express.static('public'));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(session({
  secret: 'roblox-animator-secret-key-2026',
  resave: false,
  saveUninitialized: false,
  cookie: { maxAge: 1000 * 60 * 60 * 24 * 7 } // 7 days
}));

// Multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/projects/');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname);
  }
});
const upload = multer({ storage, limits: { fileSize: 100 * 1024 * 1024 } });

// Data management
function getProjects() {
  try {
    const data = fs.readFileSync('data/projects.json', 'utf8');
    return JSON.parse(data);
  } catch {
    return [];
  }
}

function saveProjects(projects) {
  fs.writeFileSync('data/projects.json', JSON.stringify(projects, null, 2));
}

function getSettings() {
  try {
    const data = fs.readFileSync('data/settings.json', 'utf8');
    return JSON.parse(data);
  } catch {
    return {
      adminPassword: process.env.ADMIN_PASSWORD || 'admin123',
      discordUsername: 'averageishere',
      theme: 'dark'
    };
  }
}

function saveSettings(settings) {
  fs.writeFileSync('data/settings.json', JSON.stringify(settings, null, 2));
}

// Authentication middleware
function isAuthenticated(req, res, next) {
  if (req.session.authenticated) {
    return next();
  }
  res.redirect('/admin/login');
}

// Routes - Public Portfolio
app.get('/', (req, res) => {
  const projects = getProjects();
  const settings = getSettings();
  res.render('index', { projects, settings });
});

// Routes - Admin Panel
app.get('/admin/login', (req, res) => {
  if (req.session.authenticated) {
    return res.redirect('/admin/dashboard');
  }
  res.render('admin/login');
});

app.post('/admin/login', (req, res) => {
  const { password } = req.body;
  const settings = getSettings();
  
  if (bcrypt.compareSync(password, settings.adminPasswordHash || settings.adminPassword)) {
    req.session.authenticated = true;
    res.json({ success: true });
  } else {
    res.status(401).json({ success: false, message: 'Invalid password' });
  }
});

app.get('/admin/logout', (req, res) => {
  req.session.destroy();
  res.redirect('/');
});

app.get('/admin/dashboard', isAuthenticated, (req, res) => {
  const projects = getProjects();
  const settings = getSettings();
  res.render('admin/dashboard', { projects, settings });
});

// API - Projects
app.get('/api/projects', (req, res) => {
  res.json(getProjects());
});

app.post('/api/projects', isAuthenticated, upload.single('thumbnail'), (req, res) => {
  try {
    const { title, description, category, link } = req.body;
    const projects = getProjects();
    
    const newProject = {
      id: uuidv4(),
      title,
      description,
      category,
      link,
      thumbnail: req.file ? `/uploads/projects/${req.file.filename}` : '/images/default-thumb.png',
      createdAt: new Date(),
      views: 0
    };
    
    projects.push(newProject);
    saveProjects(projects);
    res.json({ success: true, project: newProject });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.put('/api/projects/:id', isAuthenticated, upload.single('thumbnail'), (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, category, link } = req.body;
    const projects = getProjects();
    
    const projectIndex = projects.findIndex(p => p.id === id);
    if (projectIndex === -1) {
      return res.status(404).json({ success: false, message: 'Project not found' });
    }
    
    projects[projectIndex] = {
      ...projects[projectIndex],
      title,
      description,
      category,
      link,
      thumbnail: req.file ? `/uploads/projects/${req.file.filename}` : projects[projectIndex].thumbnail
    };
    
    saveProjects(projects);
    res.json({ success: true, project: projects[projectIndex] });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.delete('/api/projects/:id', isAuthenticated, (req, res) => {
  try {
    const { id } = req.params;
    let projects = getProjects();
    projects = projects.filter(p => p.id !== id);
    saveProjects(projects);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// API - Settings
app.get('/api/settings', (req, res) => {
  const settings = getSettings();
  // Don't send password hash to client
  delete settings.adminPasswordHash;
  delete settings.adminPassword;
  res.json(settings);
});

app.put('/api/settings', isAuthenticated, (req, res) => {
  try {
    const { discordUsername, theme, newPassword } = req.body;
    let settings = getSettings();
    
    if (discordUsername) settings.discordUsername = discordUsername;
    if (theme) settings.theme = theme;
    if (newPassword) {
      settings.adminPasswordHash = bcrypt.hashSync(newPassword, 10);
    }
    
    saveSettings(settings);
    res.json({ success: true, settings });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Initialize default data
if (!fs.existsSync('data/projects.json')) {
  saveProjects([
    {
      id: uuidv4(),
      title: 'Smooth Combat Animations',
      description: 'A collection of fluid combat sequences with seamless transitions for Roblox games.',
      category: 'combat',
      link: '#',
      thumbnail: '/images/project1.png',
      createdAt: new Date(),
      views: 124
    },
    {
      id: uuidv4(),
      title: 'Cinematic Cutscene Pack',
      description: 'Professional-grade cutscene animations featuring expressive character movements.',
      category: 'cutscene',
      link: '#',
      thumbnail: '/images/project2.png',
      createdAt: new Date(),
      views: 89
    },
    {
      id: uuidv4(),
      title: 'Character Emotes Collection',
      description: 'Expressive emotes and action animations for immersive player experiences.',
      category: 'emotes',
      link: '#',
      thumbnail: '/images/project3.png',
      createdAt: new Date(),
      views: 156
    }
  ]);
}

if (!fs.existsSync('data/settings.json')) {
  const settings = {
    adminPasswordHash: bcrypt.hashSync(process.env.ADMIN_PASSWORD || 'admin123', 10),
    discordUsername: 'averageishere',
    theme: 'dark'
  };
  saveSettings(settings);
}

app.listen(PORT, () => {
  console.log(`🎬 Roblox Animator Portfolio running on http://localhost:${PORT}`);
});
