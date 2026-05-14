// Admin Panel JavaScript
let currentProjects = [];
let currentTab = 'projects';

document.addEventListener('DOMContentLoaded', () => {
  initializeAdmin();
  setupEventListeners();
});

function initializeAdmin() {
  loadProjects();
  setupTheme();
  loadSettings();
}

function setupEventListeners() {
  // Tab switching
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      switchTab(e.target.dataset.tab);
    });
  });

  // Modal controls
  document.querySelectorAll('.modal-close').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.target.closest('.modal').classList.remove('active');
    });
  });

  // Project form
  const projectForm = document.getElementById('projectForm');
  if (projectForm) {
    projectForm.addEventListener('submit', handleProjectSubmit);
  }

  // Settings form
  const settingsForm = document.getElementById('settingsForm');
  if (settingsForm) {
    settingsForm.addEventListener('submit', handleSettingsSubmit);
  }

  // Add project button
  const addBtn = document.querySelector('[data-action="add-project"]');
  if (addBtn) {
    addBtn.addEventListener('click', openAddProjectModal);
  }

  // Theme toggle
  const themeToggle = document.querySelector('.theme-toggle');
  if (themeToggle) {
    themeToggle.addEventListener('click', toggleTheme);
  }
}

function switchTab(tab) {
  currentTab = tab;
  
  // Update tab buttons
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.classList.remove('active');
  });
  document.querySelector(`[data-tab="${tab}"]`).classList.add('active');
  
  // Update tab content
  document.querySelectorAll('.tab-content').forEach(content => {
    content.classList.remove('active');
  });
  document.getElementById(`${tab}-tab`).classList.add('active');
}

async function loadProjects() {
  try {
    const response = await fetch('/api/projects');
    currentProjects = await response.json();
    renderProjectsTable();
    updateStats();
  } catch (error) {
    showAlert('Error loading projects', 'danger');
  }
}

function renderProjectsTable() {
  const tbody = document.querySelector('#projectsTable tbody');
  tbody.innerHTML = '';

  currentProjects.forEach(project => {
    const row = document.createElement('tr');
    row.innerHTML = `
      <td><strong>${project.title}</strong></td>
      <td>${project.category}</td>
      <td>${project.views}</td>
      <td>${new Date(project.createdAt).toLocaleDateString()}</td>
      <td>
        <button class="btn btn-primary btn-sm" onclick="editProject('${project.id}')">Edit</button>
        <button class="btn btn-danger btn-sm" onclick="deleteProject('${project.id}')">Delete</button>
      </td>
    `;
    tbody.appendChild(row);
  });
}

function updateStats() {
  document.querySelector('[data-stat="total-projects"]').textContent = currentProjects.length;
  const totalViews = currentProjects.reduce((sum, p) => sum + (p.views || 0), 0);
  document.querySelector('[data-stat="total-views"]').textContent = totalViews;
  
  const categories = new Set(currentProjects.map(p => p.category));
  document.querySelector('[data-stat="categories"]').textContent = categories.size;
}

function openAddProjectModal() {
  document.getElementById('projectForm').reset();
  document.getElementById('projectForm').dataset.mode = 'create';
  document.querySelector('#projectModal .modal-header h2').textContent = 'Add New Project';
  document.getElementById('projectModal').classList.add('active');
}

async function handleProjectSubmit(e) {
  e.preventDefault();
  
  const formData = new FormData(this);
  const mode = this.dataset.mode;
  const projectId = this.dataset.projectId;
  
  try {
    const url = mode === 'create' ? '/api/projects' : `/api/projects/${projectId}`;
    const method = mode === 'create' ? 'POST' : 'PUT';
    
    const response = await fetch(url, {
      method,
      body: formData
    });
    
    if (response.ok) {
      showAlert('Project saved successfully!', 'success');
      document.getElementById('projectModal').classList.remove('active');
      loadProjects();
    } else {
      showAlert('Error saving project', 'danger');
    }
  } catch (error) {
    showAlert('Error: ' + error.message, 'danger');
  }
}

function editProject(id) {
  const project = currentProjects.find(p => p.id === id);
  if (!project) return;
  
  document.getElementById('projectForm').dataset.mode = 'edit';
  document.getElementById('projectForm').dataset.projectId = id;
  document.querySelector('#projectModal .modal-header h2').textContent = 'Edit Project';
  
  document.querySelector('input[name="title"]').value = project.title;
  document.querySelector('textarea[name="description"]').value = project.description;
  document.querySelector('select[name="category"]').value = project.category;
  document.querySelector('input[name="link"]').value = project.link;
  
  document.getElementById('projectModal').classList.add('active');
}

async function deleteProject(id) {
  if (!confirm('Are you sure you want to delete this project?')) return;
  
  try {
    const response = await fetch(`/api/projects/${id}`, {
      method: 'DELETE'
    });
    
    if (response.ok) {
      showAlert('Project deleted successfully!', 'success');
      loadProjects();
    } else {
      showAlert('Error deleting project', 'danger');
    }
  } catch (error) {
    showAlert('Error: ' + error.message, 'danger');
  }
}

async function loadSettings() {
  try {
    const response = await fetch('/api/settings');
    const settings = await response.json();
    document.querySelector('input[name="discordUsername"]').value = settings.discordUsername;
  } catch (error) {
    console.error('Error loading settings:', error);
  }
}

async function handleSettingsSubmit(e) {
  e.preventDefault();
  
  const discordUsername = document.querySelector('input[name="discordUsername"]').value;
  const newPassword = document.querySelector('input[name="newPassword"]').value;
  
  try {
    const response = await fetch('/api/settings', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        discordUsername,
        newPassword: newPassword || undefined
      })
    });
    
    if (response.ok) {
      showAlert('Settings saved successfully!', 'success');
      document.querySelector('input[name="newPassword"]').value = '';
    } else {
      showAlert('Error saving settings', 'danger');
    }
  } catch (error) {
    showAlert('Error: ' + error.message, 'danger');
  }
}

function toggleTheme() {
  document.body.classList.toggle('light-mode');
  const isDark = !document.body.classList.contains('light-mode');
  localStorage.setItem('admin-theme', isDark ? 'dark' : 'light');
}

function setupTheme() {
  const savedTheme = localStorage.getItem('admin-theme') || 'dark';
  if (savedTheme === 'light') {
    document.body.classList.add('light-mode');
  }
}

function showAlert(message, type = 'info') {
  const alertDiv = document.createElement('div');
  alertDiv.className = `alert alert-${type}`;
  alertDiv.textContent = message;
  
  const container = document.querySelector('.header-actions') || document.querySelector('.main-content');
  container.insertBefore(alertDiv, container.firstChild);
  
  setTimeout(() => {
    alertDiv.remove();
  }, 3000);
}
