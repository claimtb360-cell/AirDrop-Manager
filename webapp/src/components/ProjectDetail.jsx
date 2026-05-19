import { useState } from 'react'
import { ArrowLeft, Trash2, ExternalLink, Calendar, Clock, Plus, X, Check } from 'lucide-react'

function formatDate(dateStr) {
  if (!dateStr) return ''
  try {
    const d = new Date(dateStr + 'T00:00:00')
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  } catch (e) {
    return dateStr
  }
}

function ProjectDetail({ project, onBack, onUpdate, onDelete, onToggleTask }) {
  const [newTask, setNewTask] = useState('')
  const [newLinkLabel, setNewLinkLabel] = useState('')
  const [newLinkUrl, setNewLinkUrl] = useState('')
  const [showAddLink, setShowAddLink] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)

  const today = new Date().toISOString().split('T')[0]
  const completedToday = project.completedDates?.[today] || []

  const addTask = () => {
    if (!newTask.trim()) return
    const task = { id: Date.now().toString(), label: newTask.trim() }
    onUpdate({ ...project, tasks: [...(project.tasks || []), task] })
    setNewTask('')
  }

  const removeTask = (taskId) => {
    onUpdate({ ...project, tasks: project.tasks.filter(t => t.id !== taskId) })
  }

  const addLink = () => {
    if (!newLinkUrl.trim()) return
    const link = {
      id: Date.now().toString(),
      label: newLinkLabel.trim() || 'Link',
      url: newLinkUrl.trim()
    }
    onUpdate({ ...project, links: [...(project.links || []), link] })
    setNewLinkLabel('')
    setNewLinkUrl('')
    setShowAddLink(false)
  }

  const removeLink = (linkId) => {
    onUpdate({ ...project, links: project.links.filter(l => l.id !== linkId) })
  }

  return (
    <div>
      <div className="detail-header">
        <button className="btn btn-ghost" onClick={onBack}>
          <ArrowLeft size={18} />
        </button>
        <h2>{project.name}</h2>
        {confirmDelete ? (
          <div style={{ display: 'flex', gap: '8px' }}>
            <button className="btn btn-danger" onClick={() => onDelete(project.id)}>
              Confirm Delete
            </button>
            <button className="btn btn-secondary" onClick={() => setConfirmDelete(false)}>
              Cancel
            </button>
          </div>
        ) : (
          <button className="btn btn-ghost" onClick={() => setConfirmDelete(true)}>
            <Trash2 size={18} />
          </button>
        )}
      </div>

      {project.description && (
        <p style={{ color: 'var(--text-secondary)', marginBottom: '24px', lineHeight: 1.6 }}>
          {project.description}
        </p>
      )}

      <div className="detail-info">
        {project.startDate && (
          <div className="info-card">
            <label>Start Date</label>
            <p><Calendar size={14} style={{ display: 'inline', marginRight: '6px' }} />
              {formatDate(project.startDate)}</p>
          </div>
        )}
        {project.endDate && (
          <div className="info-card">
            <label>End Date</label>
            <p><Clock size={14} style={{ display: 'inline', marginRight: '6px' }} />
              {formatDate(project.endDate)}</p>
          </div>
        )}
        {project.network && (
          <div className="info-card">
            <label>Network / Chain</label>
            <p>{project.network}</p>
          </div>
        )}
        {project.estimatedValue && (
          <div className="info-card">
            <label>Estimated Value</label>
            <p>{project.estimatedValue}</p>
          </div>
        )}
      </div>

      {/* Links Section */}
      <div className="tasks-section" style={{ marginBottom: '24px' }}>
        <div className="tasks-section-header">
          <h3>Access Links</h3>
          <button className="btn btn-ghost" onClick={() => setShowAddLink(!showAddLink)}>
            <Plus size={16} /> Add Link
          </button>
        </div>

        {project.links?.length > 0 ? (
          project.links.map(link => (
            <div key={link.id} className="link-item">
              <ExternalLink size={16} color="var(--accent)" />
              <span className="link-label">{link.label}</span>
              <a href={link.url} target="_blank" rel="noopener noreferrer">{link.url}</a>
              <button className="btn btn-ghost task-delete" onClick={() => removeLink(link.id)} style={{ opacity: 1 }}>
                <X size={14} />
              </button>
            </div>
          ))
        ) : (
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>No links added yet</p>
        )}

        {showAddLink && (
          <div className="add-task-input" style={{ flexDirection: 'column', gap: '8px' }}>
            <div style={{ display: 'flex', gap: '8px' }}>
              <input
                type="text"
                placeholder="Label (e.g., Website, Discord)"
                value={newLinkLabel}
                onChange={(e) => setNewLinkLabel(e.target.value)}
                style={{ flex: '0 0 180px' }}
              />
              <input
                type="url"
                placeholder="https://..."
                value={newLinkUrl}
                onChange={(e) => setNewLinkUrl(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && addLink()}
              />
              <button className="btn btn-primary" onClick={addLink} style={{ padding: '8px 12px' }}>
                <Plus size={16} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Daily Tasks */}
      <div className="tasks-section">
        <div className="tasks-section-header">
          <h3>Daily Tasks</h3>
          <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            {completedToday.length}/{project.tasks?.length || 0} done today
          </span>
        </div>

        {project.tasks?.map(task => {
          const isChecked = completedToday.includes(task.id)
          return (
            <div key={task.id} className="task-item">
              <div
                className={`task-checkbox ${isChecked ? 'checked' : ''}`}
                onClick={() => onToggleTask(project.id, task.id, today)}
              >
                {isChecked && <Check size={14} color="white" />}
              </div>
              <span className={`task-label ${isChecked ? 'completed' : ''}`}>{task.label}</span>
              <button className="task-delete" onClick={() => removeTask(task.id)}>
                <X size={14} />
              </button>
            </div>
          )
        })}

        <div className="add-task-input">
          <input
            type="text"
            placeholder="Add a daily task..."
            value={newTask}
            onChange={(e) => setNewTask(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && addTask()}
          />
          <button className="btn btn-primary" onClick={addTask} style={{ padding: '8px 12px' }}>
            <Plus size={16} />
          </button>
        </div>
      </div>
    </div>
  )
}

export default ProjectDetail
