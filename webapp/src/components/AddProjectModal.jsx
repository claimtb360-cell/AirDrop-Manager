import { useState } from 'react'
import { X, Plus, Trash2 } from 'lucide-react'
import { CHAINS } from '../App'

function AddProjectModal({ onAdd, onClose }) {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [chain, setChain] = useState('')
  const [token, setToken] = useState('')
  const [estimatedValue, setEstimatedValue] = useState('')
  const [reward, setReward] = useState('')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [links, setLinks] = useState([{ label: '', url: '' }])
  const [tasks, setTasks] = useState([''])

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!name.trim()) return

    onAdd({
      name: name.trim(),
      description: description.trim(),
      chain: chain || null,
      token: token.trim() || null,
      estimatedValue: estimatedValue.trim(),
      reward: reward.trim(),
      startDate: startDate || null,
      endDate: endDate || null,
      links: links
        .filter(l => l.url.trim())
        .map(l => ({ id: Date.now().toString() + Math.random(), label: l.label || 'Link', url: l.url })),
      tasks: tasks
        .filter(t => t.trim())
        .map(t => ({ id: Date.now().toString() + Math.random(), label: t.trim() }))
    })
  }

  const addLinkField = () => setLinks([...links, { label: '', url: '' }])
  const removeLinkField = (i) => setLinks(links.filter((_, idx) => idx !== i))
  const updateLink = (i, field, value) => {
    const updated = [...links]
    updated[i][field] = value
    setLinks(updated)
  }

  const addTaskField = () => setTasks([...tasks, ''])
  const removeTaskField = (i) => setTasks(tasks.filter((_, idx) => idx !== i))
  const updateTask = (i, value) => {
    const updated = [...tasks]
    updated[i] = value
    setTasks(updated)
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Thêm dự án mới</h2>
          <button className="btn-icon" onClick={onClose}><X size={20} /></button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Tên dự án *</label>
            <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g., LayerZero, zkSync" required />
          </div>

          <div className="form-group">
            <label>Mô tả</label>
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Mô tả ngắn về dự án airdrop..." />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Chain</label>
              <select value={chain} onChange={(e) => setChain(e.target.value)}>
                <option value="">Chọn chain</option>
                {CHAINS.map(c => <option key={c.id} value={c.id}>{c.label}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label>Token</label>
              <input type="text" value={token} onChange={(e) => setToken(e.target.value)} placeholder="e.g., $ZRO, $STRK" />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Raised / Pool</label>
              <input type="text" value={estimatedValue} onChange={(e) => setEstimatedValue(e.target.value)} placeholder="e.g., $7M+" />
            </div>
            <div className="form-group">
              <label>Reward</label>
              <input type="text" value={reward} onChange={(e) => setReward(e.target.value)} placeholder="e.g., join WL, Early Users" />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Ngày bắt đầu</label>
              <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
            </div>
            <div className="form-group">
              <label>Deadline</label>
              <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
            </div>
          </div>

          {/* Links */}
          <div className="form-group">
            <label>Access Links</label>
            {links.map((link, i) => (
              <div key={i} className="form-inline">
                <input type="text" value={link.label} onChange={(e) => updateLink(i, 'label', e.target.value)} placeholder="Label" style={{ width: '100px' }} />
                <input type="url" value={link.url} onChange={(e) => updateLink(i, 'url', e.target.value)} placeholder="https://..." />
                {links.length > 1 && (
                  <button type="button" className="btn-icon" onClick={() => removeLinkField(i)}><Trash2 size={14} /></button>
                )}
              </div>
            ))}
            <button type="button" className="btn btn-ghost btn-sm" onClick={addLinkField}>
              <Plus size={14} /> Thêm link
            </button>
          </div>

          {/* Tasks */}
          <div className="form-group">
            <label>Daily Tasks</label>
            {tasks.map((task, i) => (
              <div key={i} className="form-inline">
                <input type="text" value={task} onChange={(e) => updateTask(i, e.target.value)} placeholder="e.g., Check-in Discord" />
                {tasks.length > 1 && (
                  <button type="button" className="btn-icon" onClick={() => removeTaskField(i)}><Trash2 size={14} /></button>
                )}
              </div>
            ))}
            <button type="button" className="btn btn-ghost btn-sm" onClick={addTaskField}>
              <Plus size={14} /> Thêm task
            </button>
          </div>

          <div className="modal-actions">
            <button type="button" className="btn btn-secondary" onClick={onClose}>Hủy</button>
            <button type="submit" className="btn btn-primary"><Plus size={16} /> Thêm dự án</button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default AddProjectModal
