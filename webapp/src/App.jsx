import { useState, useEffect } from 'react'
import Sidebar from './components/Sidebar'
import ProjectList from './components/ProjectList'
import ProjectDetail from './components/ProjectDetail'
import AddProjectModal from './components/AddProjectModal'
import DailyChecklist from './components/DailyChecklist'
import './App.css'

function App() {
  const [projects, setProjects] = useState(() => {
    const saved = localStorage.getItem('airdrop-projects')
    return saved ? JSON.parse(saved) : []
  })
  const [selectedProject, setSelectedProject] = useState(null)
  const [showAddModal, setShowAddModal] = useState(false)
  const [activeView, setActiveView] = useState('projects') // 'projects' | 'checklist'
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    localStorage.setItem('airdrop-projects', JSON.stringify(projects))
  }, [projects])

  const addProject = (project) => {
    const newProject = {
      ...project,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      tasks: project.tasks || [],
      completedDates: {}
    }
    setProjects([...projects, newProject])
    setShowAddModal(false)
  }

  const updateProject = (updatedProject) => {
    setProjects(projects.map(p => p.id === updatedProject.id ? updatedProject : p))
    setSelectedProject(updatedProject)
  }

  const deleteProject = (projectId) => {
    setProjects(projects.filter(p => p.id !== projectId))
    setSelectedProject(null)
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

  const filteredProjects = projects.filter(p =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.description?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="app">
      <Sidebar
        activeView={activeView}
        setActiveView={setActiveView}
        projectCount={projects.length}
      />
      <main className="main-content">
        {activeView === 'projects' && !selectedProject && (
          <ProjectList
            projects={filteredProjects}
            onSelect={setSelectedProject}
            onAdd={() => setShowAddModal(true)}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
          />
        )}
        {activeView === 'projects' && selectedProject && (
          <ProjectDetail
            project={selectedProject}
            onBack={() => setSelectedProject(null)}
            onUpdate={updateProject}
            onDelete={deleteProject}
            onToggleTask={toggleDailyTask}
          />
        )}
        {activeView === 'checklist' && (
          <DailyChecklist
            projects={projects}
            onToggleTask={toggleDailyTask}
            onSelectProject={setSelectedProject}
            setActiveView={setActiveView}
          />
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
