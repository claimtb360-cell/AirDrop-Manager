import { useState } from 'react'
import { ChevronLeft, ChevronRight, Check, ExternalLink } from 'lucide-react'
import { format, addDays, subDays } from 'date-fns'

function DailyChecklist({ projects, onToggleTask, onSelectProject, setActiveView }) {
  const [currentDate, setCurrentDate] = useState(new Date())
  const dateKey = format(currentDate, 'yyyy-MM-dd')
  const isToday = dateKey === format(new Date(), 'yyyy-MM-dd')

  const projectsWithTasks = projects.filter(p => p.tasks && p.tasks.length > 0)

  const totalTasks = projectsWithTasks.reduce((sum, p) => sum + p.tasks.length, 0)
  const totalCompleted = projectsWithTasks.reduce((sum, p) => {
    return sum + (p.completedDates?.[dateKey]?.length || 0)
  }, 0)

  return (
    <div>
      <div className="checklist-header">
        <div>
          <h2>Daily Checklist</h2>
          {totalTasks > 0 && (
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: '4px' }}>
              {totalCompleted}/{totalTasks} tasks completed
              {isToday && ' today'}
            </p>
          )}
        </div>
        <div className="date-nav">
          <button onClick={() => setCurrentDate(subDays(currentDate, 1))}>
            <ChevronLeft size={16} />
          </button>
          <span>{isToday ? 'Today' : format(currentDate, 'MMM d, yyyy')}</span>
          <button onClick={() => setCurrentDate(addDays(currentDate, 1))}>
            <ChevronRight size={16} />
          </button>
        </div>
      </div>

      {totalTasks > 0 && (
        <div className="progress-bar" style={{ marginBottom: '24px', height: '6px' }}>
          <div
            className="progress-fill"
            style={{ width: `${totalTasks > 0 ? (totalCompleted / totalTasks) * 100 : 0}%` }}
          />
        </div>
      )}

      {projectsWithTasks.length === 0 ? (
        <div className="empty-state">
          <Check size={48} color="var(--text-muted)" />
          <h3>No daily tasks yet</h3>
          <p>Add tasks to your projects to see them here</p>
        </div>
      ) : (
        projectsWithTasks.map(project => {
          const completedForDate = project.completedDates?.[dateKey] || []
          const projectCompleted = completedForDate.length
          const projectTotal = project.tasks.length
          const allDone = projectCompleted === projectTotal

          return (
            <div key={project.id} className="checklist-project">
              <div
                className="checklist-project-header"
                onClick={() => { onSelectProject(project); setActiveView('projects') }}
              >
                <h4>
                  {allDone && <Check size={16} color="var(--success)" />}
                  {project.name}
                  {project.links?.length > 0 && (
                    <a
                      href={project.links[0].url}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      style={{ color: 'var(--accent)' }}
                    >
                      <ExternalLink size={14} />
                    </a>
                  )}
                </h4>
                <span className="checklist-progress">
                  {projectCompleted}/{projectTotal}
                </span>
              </div>

              {project.tasks.map(task => {
                const isChecked = completedForDate.includes(task.id)
                return (
                  <div key={task.id} className="task-item">
                    <div
                      className={`task-checkbox ${isChecked ? 'checked' : ''}`}
                      onClick={() => onToggleTask(project.id, task.id, dateKey)}
                    >
                      {isChecked && <Check size={14} color="white" />}
                    </div>
                    <span className={`task-label ${isChecked ? 'completed' : ''}`}>
                      {task.label}
                    </span>
                  </div>
                )
              })}
            </div>
          )
        })
      )}
    </div>
  )
}

export default DailyChecklist
