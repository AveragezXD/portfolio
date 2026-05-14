// Portfolio Main Script
document.addEventListener('DOMContentLoaded', () => {
  loadProjects();
  setupFilters();
  setupIntersectionObserver();
});

let allProjects = [];
let currentFilter = 'all';

async function loadProjects() {
  try {
    const response = await fetch('/api/projects');
    allProjects = await response.json();
    renderProjects(allProjects);
  } catch (error) {
    console.error('Error loading projects:', error);
  }
}

function renderProjects(projects) {
  const grid = document.querySelector('.projects-grid');
  grid.innerHTML = '';

  projects.forEach((project, index) => {
    const card = document.createElement('div');
    card.className = 'project-card';
    card.style.animation = `fadeInUp 0.6s ease ${index * 0.1}s both`;
    card.innerHTML = `
      <div class="project-image">
        <img src="${project.thumbnail}" alt="${project.title}" onerror="this.style.display='none'">
      </div>
      <div class="project-info">
        <span class="project-category">${project.category}</span>
        <h3 class="project-title">${project.title}</h3>
        <p class="project-description">${project.description}</p>
        <div class="project-footer">
          <span class="project-views">👁️ ${project.views}</span>
          <a href="${project.link}" class="project-link">View →</a>
        </div>
      </div>
    `;
    grid.appendChild(card);
  });
}

function setupFilters() {
  const filterButtons = document.querySelectorAll('.filter-btn');
  filterButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      filterButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentFilter = btn.dataset.filter;
      
      if (currentFilter === 'all') {
        renderProjects(allProjects);
      } else {
        const filtered = allProjects.filter(p => p.category === currentFilter);
        renderProjects(filtered);
      }
    });
  });
}

function setupIntersectionObserver() {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.style.opacity = '1';
        entry.target.style.transform = 'translateY(0)';
      }
    });
  });

  document.querySelectorAll('.project-card').forEach(card => {
    observer.observe(card);
  });
}
