import { Plus, Search, Calendar, CheckCircle2, ExternalLink, Rocket } from 'lucide-react'
import { format, isAfter, isBefore } from 'date-fns'

function getProjectStatus(project) {
  const now = new Date()
  if (project.endDate && isBefore(new Date(project.endDate), now)) return 'ended'
  if (project.startDate && isAfter(new Date(project.startDate), now)) return 'upcoming'
  return 'active'
}

function getTodayProgress(project) {
  const today = new Date().toISOString().split('T')[0]
  const totalTasks = project.tasks?.length || 0
  if (totalTasks === 0) return null
  const completed = project.completedDates?.[today]?.length || 0
  return { completed, total: totalTasks, percentage: Math.round((completed / totalTasks) * 100) }
}

function ProjectList({ projects, onSelect, onAdd, searchQuery, setSearchQuery }) {
  return (
    <div>
      <div className="project-list-header">
        <h2>Airdrop Projects</h2>
        <button className="btn btn-primary" onClick={onAdd}>
          <Plus size={18} />
          Add Project
        </button>
      </div>

      <div className="search-bar">
        <Search size={18} color="var(--text-muted)" />
        <input
          type="text"
          placeholder="Search projects..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {projects.length === 0 ? (
        <div className="empty-state">
          <Rocket size={48} color="var(--text-muted)" />
          <h3>No projects yet</h3>
          <p>Add your first airdrop project to get started</p>
        </div>
      ) : (
        <div className="projects-grid">
          {projects.map(project => {
            const status = getProjectStatus(project)
            const progress = getTodayProgress(project)
            return (
              <div key={project.id} className="project-card" onClick={() => onSelect(project)}>
                <div className="project-card-header">
                  <h3>{project.name}</h3>
                  <span className={`project-status status-${status}`}>{status}</span>
                </div>
                {project.description && (
                  <p className="project-card-desc">{project.description}</p>
                )}
                <div className="project-card-meta">
                  {project.startDate && (
                    <span>
                      <Calendar size={14} />
                      {format(new Date(project.startDate), 'MMM d, yyyy')}
                    </span>
                  )}
                  {project.tasks?.length > 0 && (
                    <span>
                      <CheckCircle2 size={14} />
                      {project.tasks.length} tasks
                    </span>
                  )}
                  {project.links?.length > 0 && (
                    <span>
                      <ExternalLink size={14} />
                      {project.links.length} links
                    </span>
                  )}
                </div>
                {progress && (
                  <div className="progress-bar">
                    <div className="progress-fill" style={{ width: `${progress.percentage}%` }} />
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

export default ProjectList
