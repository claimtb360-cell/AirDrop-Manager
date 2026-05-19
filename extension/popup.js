// AirDrop Manager - Chrome Extension Popup Script

const STORAGE_KEY = 'airdrop-projects'

// State
let projects = []
let activeTab = 'tasks'

// DOM Elements
const tabButtons = document.querySelectorAll('.tab')
const tasksView = document.getElementById('tasks-view')
const projectsView = document.getElementById('projects-view')
const tasksList = document.getElementById('tasksList')
const projectsList = document.getElementById('projectsList')
const addBtn = document.getElementById('addBtn')
const addForm = document.getElementById('addForm')
const cancelBtn = document.getElementById('cancelBtn')
const saveBtn = document.getElementById('saveBtn')
const todayDate = document.getElementById('todayDate')
const progressText = document.getElementById('progressText')
const progressFill = document.getElementById('progressFill')

// Initialize
document.addEventListener('DOMContentLoaded', () => {
  loadProjects()
  setupEventListeners()
  renderActiveView()
  updateDateDisplay()
})

function setupEventListeners() {
  tabButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      activeTab = btn.dataset.tab
      tabButtons.forEach(b => b.classList.remove('active'))
      btn.classList.add('active')
      renderActiveView()
    })
  })

  addBtn.addEventListener('click', () => {
    addForm.classList.toggle('hidden')
  })

  cancelBtn.addEventListener('click', () => {
    addForm.classList.add('hidden')
    clearForm()
  })

  saveBtn.addEventListener('click', saveProject)
}

function loadProjects() {
  chrome.storage.local.get([STORAGE_KEY], (result) => {
    projects = result[STORAGE_KEY] || []
    renderActiveView()
  })
}

function saveToStorage() {
  chrome.storage.local.set({ [STORAGE_KEY]: projects })
}

function getToday() {
  return new Date().toISOString().split('T')[0]
}

function updateDateDisplay() {
  const now = new Date()
  todayDate.textContent = now.toLocaleDateString('en-US', {
    weekday: 'short', month: 'short', day: 'numeric'
  })
}

function getProjectStatus(project) {
  const now = new Date()
  if (project.endDate && new Date(project.endDate) < now) return 'ended'
  if (project.startDate && new Date(project.startDate) > now) return 'upcoming'
  return 'active'
}

function renderActiveView() {
  tasksView.classList.toggle('active', activeTab === 'tasks')
  projectsView.classList.toggle('active', activeTab === 'projects')

  if (activeTab === 'tasks') {
    renderTasks()
  } else {
    renderProjects()
  }
}

function renderTasks() {
  const today = getToday()
  const projectsWithTasks = projects.filter(p => p.tasks && p.tasks.length > 0)

  if (projectsWithTasks.length === 0) {
    tasksList.innerHTML = `
      <div class="empty-state">
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <polyline points="9 11 12 14 22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>
        </svg>
        <h4>No daily tasks</h4>
        <p>Add tasks to your projects</p>
      </div>
    `
    progressText.textContent = ''
    progressFill.style.width = '0%'
    return
  }

  let totalTasks = 0
  let totalCompleted = 0
  let html = ''

  projectsWithTasks.forEach(project => {
    const completedForDate = project.completedDates?.[today] || []
    totalTasks += project.tasks.length
    totalCompleted += completedForDate.length

    const mainLink = project.links?.[0]?.url

    html += `<div class="project-group">`
    html += `<div class="project-group-header">
      <h4>${escapeHtml(project.name)}</h4>
      ${mainLink ? `<button class="link-btn" onclick="openLink('${escapeHtml(mainLink)}')">
        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
        Open
      </button>` : ''}
    </div>`

    project.tasks.forEach(task => {
      const isChecked = completedForDate.includes(task.id)
      html += `
        <div class="task-item" onclick="toggleTask('${project.id}', '${task.id}')">
          <div class="task-checkbox ${isChecked ? 'checked' : ''}">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="3">
              <polyline points="20 6 9 17 4 12"/>
            </svg>
          </div>
          <span class="task-label ${isChecked ? 'completed' : ''}">${escapeHtml(task.label)}</span>
        </div>
      `
    })

    html += `</div>`
  })

  tasksList.innerHTML = html
  progressText.textContent = `${totalCompleted}/${totalTasks}`
  const pct = totalTasks > 0 ? (totalCompleted / totalTasks) * 100 : 0
  progressFill.style.width = `${pct}%`
}

function renderProjects() {
  if (projects.length === 0) {
    projectsList.innerHTML = `
      <div class="empty-state">
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z"/>
          <path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z"/>
        </svg>
        <h4>No projects yet</h4>
        <p>Click + to add your first project</p>
      </div>
    `
    return
  }

  let html = ''
  projects.forEach(project => {
    const status = getProjectStatus(project)
    html += `
      <div class="project-card">
        <div class="project-card-top">
          <h4>${escapeHtml(project.name)}</h4>
          <span class="status-badge status-${status}">${status}</span>
        </div>
        ${project.description ? `<div class="project-card-meta"><span>${escapeHtml(project.description)}</span></div>` : ''}
        <div class="project-card-meta">
          ${project.network ? `<span>${escapeHtml(project.network)}</span>` : ''}
          ${project.tasks?.length ? `<span>${project.tasks.length} tasks</span>` : ''}
          ${project.startDate ? `<span>${formatDate(project.startDate)}</span>` : ''}
        </div>
        ${project.links?.length ? `
          <div class="project-card-links">
            ${project.links.map(l => `
              <a href="${escapeHtml(l.url)}" target="_blank" class="project-link">
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
                ${escapeHtml(l.label)}
              </a>
            `).join('')}
          </div>
        ` : ''}
      </div>
    `
  })

  projectsList.innerHTML = html
}

function toggleTask(projectId, taskId) {
  const today = getToday()
  projects = projects.map(p => {
    if (p.id !== projectId) return p
    const completedDates = { ...p.completedDates } || {}
    if (!completedDates[today]) completedDates[today] = []
    if (completedDates[today].includes(taskId)) {
      completedDates[today] = completedDates[today].filter(id => id !== taskId)
    } else {
      completedDates[today] = [...completedDates[today], taskId]
    }
    return { ...p, completedDates }
  })
  saveToStorage()
  renderTasks()
}

function openLink(url) {
  chrome.tabs.create({ url })
}

function saveProject() {
  const name = document.getElementById('projectName').value.trim()
  if (!name) return

  const project = {
    id: Date.now().toString(),
    name,
    description: document.getElementById('projectDesc').value.trim(),
    network: document.getElementById('projectNetwork').value.trim(),
    startDate: document.getElementById('projectStart').value || null,
    endDate: document.getElementById('projectEnd').value || null,
    links: [],
    tasks: [],
    completedDates: {},
    createdAt: new Date().toISOString()
  }

  const link = document.getElementById('projectLink').value.trim()
  if (link) {
    project.links.push({ id: Date.now().toString() + '1', label: 'Website', url: link })
  }

  const task = document.getElementById('projectTask').value.trim()
  if (task) {
    project.tasks.push({ id: Date.now().toString() + '2', label: task })
  }

  projects.push(project)
  saveToStorage()
  clearForm()
  addForm.classList.add('hidden')
  renderActiveView()
}

function clearForm() {
  document.getElementById('projectName').value = ''
  document.getElementById('projectDesc').value = ''
  document.getElementById('projectNetwork').value = ''
  document.getElementById('projectStart').value = ''
  document.getElementById('projectEnd').value = ''
  document.getElementById('projectLink').value = ''
  document.getElementById('projectTask').value = ''
}

function formatDate(dateStr) {
  const d = new Date(dateStr + 'T00:00:00')
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

function escapeHtml(str) {
  if (!str) return ''
  const div = document.createElement('div')
  div.textContent = str
  return div.innerHTML
}
