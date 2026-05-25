import { useState, useEffect } from 'react'
import Sidebar from './components/Sidebar'
import ProjectsView from './components/ProjectsView'
import AddProjectModal from './components/AddProjectModal'
import DailyChecklist from './components/DailyChecklist'
import TelegramFeed from './components/TelegramFeed'
import TelegramConfig from './components/TelegramConfig'
import './App.css'

export const STATUSES = [
  { id: 'chua_lam', label: 'Chưa làm', color: '#6c6c8a' },
  { id: 'dang_lam', label: 'Đang làm', color: '#4ade80' },
  { id: 'da_ket_thuc', label: 'Đã kết thúc', color: '#60a5fa' },
  { id: 'da_tra_air', label: 'Đã trả air', color: '#a78bfa' },
  { id: 'da_list_san', label: 'Đã list sàn', color: '#2dd4bf' },
  { id: 'bo_qua', label: 'Bỏ qua', color: '#6c6c8a' },
  { id: 'cho_task_moi', label: 'Chờ task mới', color: '#fb923c' },
  { id: 'scam', label: 'Scam', color: '#f87171' },
]

export const CHAINS = [
  { id: 'ethereum', label: 'Ethereum', color: '#627eea' },
  { id: 'solana', label: 'Solana', color: '#14f195' },
  { id: 'base', label: 'BASE', color: '#0052ff' },
  { id: 'arbitrum', label: 'Arbitrum', color: '#28a0f0' },
  { id: 'optimism', label: 'Optimism', color: '#ff0420' },
  { id: 'polygon', label: 'Polygon', color: '#8247e5' },
  { id: 'bnb', label: 'BNB Chain', color: '#f0b90b' },
  { id: 'avalanche', label: 'Avalanche', color: '#e84142' },
  { id: 'sui', label: 'Sui', color: '#4da2ff' },
  { id: 'aptos', label: 'Aptos', color: '#2ed8a3' },
  { id: 'sei', label: 'Sei', color: '#9b1c1c' },
  { id: 'zksync', label: 'zkSync', color: '#8b8dfc' },
  { id: 'scroll', label: 'Scroll', color: '#ffeeda' },
  { id: 'linea', label: 'Linea', color: '#61dfff' },
  { id: 'monad', label: 'Monad', color: '#836ef9' },
  { id: 'seismic', label: 'Seismic', color: '#6c8a8a' },
  { id: 'other', label: 'Khác', color: '#6c6c8a' },
]

function App() {
  const [projects, setProjects] = useState(() => {
    const saved = localStorage.getItem('airdrop-projects-v2')
    return saved ? JSON.parse(saved) : []
  })
  const [trashedProjects, setTrashedProjects] = useState(() => {
    const saved = localStorage.getItem('airdrop-trashed-v2')
    return saved ? JSON.parse(saved) : []
  })
  const [selectedProject, setSelectedProject] = useState(null)
  const [showAddModal, setShowAddModal] = useState(false)
  const [activeView, setActiveView] = useState('projects')
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    localStorage.setItem('airdrop-projects-v2', JSON.stringify(projects))
  }, [projects])

  useEffect(() => {
    localStorage.setItem('airdrop-trashed-v2', JSON.stringify(trashedProjects))
  }, [trashedProjects])

  const addProject = (project) => {
    const newProject = {
      ...project,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      status: 'chua_lam',
      tasks: project.tasks || [],
      profiles: 0,
      favorite: false,
      completedDates: {}
    }
    setProjects([newProject, ...projects])
    setShowAddModal(false)
  }

  const updateProject = (updatedProject) => {
    setProjects(projects.map(p => p.id === updatedProject.id ? updatedProject : p))
    if (selectedProject?.id === updatedProject.id) {
      setSelectedProject(updatedProject)
    }
  }

  const deleteProject = (projectId) => {
    const project = projects.find(p => p.id === projectId)
    if (project) {
      setTrashedProjects([project, ...trashedProjects])
      setProjects(projects.filter(p => p.id !== projectId))
    }
    if (selectedProject?.id === projectId) setSelectedProject(null)
  }

  const deleteMultiple = (ids) => {
    const toTrash = projects.filter(p => ids.includes(p.id))
    setTrashedProjects([...toTrash, ...trashedProjects])
    setProjects(projects.filter(p => !ids.includes(p.id)))
    if (selectedProject && ids.includes(selectedProject.id)) setSelectedProject(null)
  }

  const toggleDailyTask = (projectId, taskId, date) => {
    setProjects(projects.map(p => {
      if (p.id !== projectId) return p
      const dateKey = date || new Date().toISOString().split('T')[0]
      const completedDates = { ...p.completedDates }
      if (!completedDates[dateKey]) completedDates[dateKey] = []
      if (completedDates[dateKey].includes(taskId)) {
        completedDates[dateKey] = completedDates[dateKey].filter(id => id !== taskId)
      } else {
        completedDates[dateKey] = [...completedDates[dateKey], taskId]
      }
      return { ...p, completedDates }
    }))
  }

  return (
    <div className="app">
      <Sidebar
        activeView={activeView}
        setActiveView={setActiveView}
        projectCount={projects.length}
      />
      <main className="main-content">
        {activeView === 'projects' && (
          <ProjectsView
            projects={projects}
            selectedProject={selectedProject}
            onSelect={setSelectedProject}
            onAdd={() => setShowAddModal(true)}
            onUpdate={updateProject}
            onDelete={deleteProject}
            onDeleteMultiple={deleteMultiple}
            onToggleTask={toggleDailyTask}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            trashedCount={trashedProjects.length}
          />
        )}
        {activeView === 'checklist' && (
          <DailyChecklist
            projects={projects}
            onToggleTask={toggleDailyTask}
            onSelectProject={(p) => { setSelectedProject(p); setActiveView('projects') }}
            setActiveView={setActiveView}
          />
        )}
        {activeView === 'telegram' && (
          <TelegramFeed projects={projects} />
        )}
        {activeView === 'telegram-config' && (
          <TelegramConfig projects={projects} />
        )}
      </main>
      {showAddModal && (
        <AddProjectModal
          onAdd={addProject}
          onClose={() => setShowAddModal(false)}
        />
      )}
    </div>
  )
}

export default App
