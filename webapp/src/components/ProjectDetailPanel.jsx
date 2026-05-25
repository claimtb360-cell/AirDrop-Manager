import { useState } from 'react'
import { STATUSES, CHAINS } from '../App'
import { X, ExternalLink, Plus, Trash2, Check, Heart, Copy, Edit3, Save } from 'lucide-react'

function ProjectDetailPanel({ project, onClose, onUpdate, onDelete, onToggleTask }) {
  const [editing, setEditing] = useState(false)
  const [editData, setEditData] = useState({})
  const [newTask, setNewTask] = useState('')
  const [newLinkLabel, setNewLinkLabel] = useState('')
  const [newLinkUrl, setNewLinkUrl] = useState('')

  const status = STATUSES.find(s => s.id === project.status) || STATUSES[0]
  const chain = CHAINS.find(c => c.id === project.chain)
  const today = new Date().toISOString().split('T')[0]
  const completedToday = project.completedDates?.[today] || []

  const startEdit = () => {
    setEditData({
      name: project.name,
      description: project.description || '',
      token: project.token || '',
      chain: project.chain || '',
      estimatedValue: project.estimatedValue || '',
      reward: project.reward || '',
      startDate: project.startDate || '',
      endDate: project.endDate || '',
      profiles: project.profiles || 0,
    })
    setEditing(true)
  }

  const saveEdit = () => {
    onUpdate({ ...project, ...editData })
    setEditing(false)
  }

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
    const link = { id: Date.now().toString(), label: newLinkLabel.trim() || 'Link', url: newLinkUrl.trim() }
    onUpdate({ ...project, links: [...(project.links || []), link] })
    setNewLinkLabel('')
    setNewLinkUrl('')
  }

  const removeLink = (linkId) => {
    onUpdate({ ...project, links: project.links.filter(l => l.id !== linkId) })
  }

  const handleStatusChange = (newStatus) => {
    onUpdate({ ...project, status: newStatus })
  }

  return (
    <div className="detail-panel">
      {/* Header */}
      <div className="detail-panel-header">
        <h3>{project.name}</h3>
        <button className="btn-icon" onClick={onClose}><X size={18} /></button>
      </div>

      {/* Status */}
      <div className="detail-panel-status">
        <button
          className="status-btn-lg"
          style={{ background: status.color + '22', color: status.color, borderColor: status.color + '44' }}
        >
          {status.label}
        </button>
        <button className="btn-icon" title="Sửa" onClick={startEdit}><Edit3 size={14} /></button>
      </div>

      {/* Quick Actions */}
      <div className="detail-actions">
        {project.links?.find(l => l.label?.toLowerCase().includes('telegram')) && (
          <button className="detail-action-btn" onClick={() => window.open(project.links.find(l => l.label?.toLowerCase().includes('telegram')).url, '_blank')}>
            Mở Telegram
          </button>
        )}
        {project.links?.[0] && (
          <button className="detail-action-btn" onClick={() => window.open(project.links[0].url, '_blank')}>
            Mở link đăng ký
          </button>
        )}
        <button className="detail-action-btn" onClick={startEdit}>
          Cập nhật
        </button>
        <button className="detail-action-btn" onClick={() => onUpdate({ ...project, favorite: !project.favorite })}>
          Thả tim
        </button>
      </div>

      <div className="detail-panel-body">
        {/* Edit Mode */}
        {editing && (
          <div className="edit-section">
            <h4>Chỉnh sửa dự án</h4>
            <input value={editData.name} onChange={e => setEditData({...editData, name: e.target.value})} placeholder="Tên dự án" />
            <textarea value={editData.description} onChange={e => setEditData({...editData, description: e.target.value})} placeholder="Mô tả" />
            <input value={editData.token} onChange={e => setEditData({...editData, token: e.target.value})} placeholder="Token (e.g., $TOKEN)" />
            <select value={editData.chain} onChange={e => setEditData({...editData, chain: e.target.value})}>
              <option value="">Chọn chain</option>
              {CHAINS.map(c => <option key={c.id} value={c.id}>{c.label}</option>)}
            </select>
            <input value={editData.reward} onChange={e => setEditData({...editData, reward: e.target.value})} placeholder="Reward info" />
            <input value={editData.estimatedValue} onChange={e => setEditData({...editData, estimatedValue: e.target.value})} placeholder="Raised / Pool (e.g., $7M+)" />
            <div className="edit-row">
              <input type="date" value={editData.startDate} onChange={e => setEditData({...editData, startDate: e.target.value})} />
              <input type="date" value={editData.endDate} onChange={e => setEditData({...editData, endDate: e.target.value})} />
            </div>
            <input type="number" value={editData.profiles} onChange={e => setEditData({...editData, profiles: parseInt(e.target.value) || 0})} placeholder="Số profile" />
            <div className="edit-actions">
              <button className="btn btn-primary" onClick={saveEdit}><Save size={14} /> Lưu</button>
              <button className="btn btn-secondary" onClick={() => setEditing(false)}>Hủy</button>
            </div>
          </div>
        )}

        {/* Description */}
        <div className="detail-section">
          <h4>MÔ TẢ</h4>
          <p className="detail-desc">{project.description || 'Chưa có mô tả'}</p>
          {project.reward && <p className="detail-reward">Reward: {project.reward}</p>}
          {project.estimatedValue && <p className="detail-value">Raised: {project.estimatedValue}</p>}
          {chain && <p className="detail-chain">Chain: <span className="chain-badge" style={{ background: chain.color + '22', color: chain.color }}>{chain.label}</span></p>}
        </div>

        {/* Links */}
        <div className="detail-section">
          <h4>LINK ĐĂNG KÝ</h4>
          {project.links?.length > 0 ? (
            project.links.map(link => (
              <div key={link.id} className="detail-link-item">
                <a href={link.url} target="_blank" rel="noopener noreferrer">
                  <ExternalLink size={12} /> {link.label}: {link.url}
                </a>
                <button className="btn-icon-sm" onClick={() => removeLink(link.id)}><X size={12} /></button>
              </div>
            ))
          ) : (
            <p className="text-muted">Chưa có link</p>
          )}
          <div className="detail-add-link">
            <input value={newLinkLabel} onChange={e => setNewLinkLabel(e.target.value)} placeholder="Label" style={{width: '80px'}} />
            <input value={newLinkUrl} onChange={e => setNewLinkUrl(e.target.value)} placeholder="https://..." onKeyDown={e => e.key === 'Enter' && addLink()} />
            <button className="btn-icon-sm" onClick={addLink}><Plus size={12} /></button>
          </div>
        </div>

        {/* Daily Tasks */}
        <div className="detail-section">
          <h4>DAILY TASKS ({completedToday.length}/{project.tasks?.length || 0})</h4>
          {project.tasks?.map(task => {
            const isChecked = completedToday.includes(task.id)
            return (
              <div key={task.id} className="detail-task-item">
                <div className={`task-check ${isChecked ? 'checked' : ''}`} onClick={() => onToggleTask(project.id, task.id, today)}>
                  {isChecked && <Check size={12} color="white" />}
                </div>
                <span className={isChecked ? 'completed' : ''}>{task.label}</span>
                <button className="btn-icon-sm" onClick={() => removeTask(task.id)}><X size={10} /></button>
              </div>
            )
          })}
          <div className="detail-add-task">
            <input value={newTask} onChange={e => setNewTask(e.target.value)} placeholder="Thêm task..." onKeyDown={e => e.key === 'Enter' && addTask()} />
            <button className="btn-icon-sm" onClick={addTask}><Plus size={12} /></button>
          </div>
        </div>

        {/* Delete */}
        <div className="detail-section">
          <button className="btn btn-danger" onClick={() => onDelete(project.id)}>
            <Trash2 size={14} /> Xóa dự án
          </button>
        </div>
      </div>
    </div>
  )
}

export default ProjectDetailPanel
