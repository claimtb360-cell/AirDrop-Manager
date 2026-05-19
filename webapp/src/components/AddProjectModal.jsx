import { useState } from 'react'
import { X, Plus, Trash2 } from 'lucide-react'

function AddProjectModal({ onAdd, onClose }) {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [network, setNetwork] = useState('')
  const [estimatedValue, setEstimatedValue] = useState('')
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
      network: network.trim(),
      estimatedValue: estimatedValue.trim(),
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
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <h2>Add New Project</h2>
          <button className="btn btn-ghost" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Project Name *</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., LayerZero, zkSync"
              required
            />
          </div>

          <div className="form-group">
            <label>Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Brief description of the airdrop project..."
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Network / Chain</label>
              <input
                type="text"
                value={network}
                onChange={(e) => setNetwork(e.target.value)}
                placeholder="e.g., Ethereum, Solana"
              />
            </div>
            <div className="form-group">
              <label>Estimated Value</label>
              <input
                type="text"
                value={estimatedValue}
                onChange={(e) => setEstimatedValue(e.target.value)}
                placeholder="e.g., $500-$2000"
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Start Date</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>
            <div className="form-group">
              <label>End Date</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
          </div>

          {/* Links */}
          <div className="form-group">
            <label>Access Links</label>
            {links.map((link, i) => (
              <div key={i} style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
                <input
                  type="text"
                  value={link.label}
                  onChange={(e) => updateLink(i, 'label', e.target.value)}
                  placeholder="Label"
                  style={{ flex: '0 0 120px' }}
                />
                <input
                  type="url"
                  value={link.url}
                  onChange={(e) => updateLink(i, 'url', e.target.value)}
                  placeholder="https://..."
                />
                {links.length > 1 && (
                  <button type="button" className="btn btn-ghost" onClick={() => removeLinkField(i)}>
                    <Trash2 size={14} />
                  </button>
                )}
              </div>
            ))}
            <button type="button" className="btn btn-ghost" onClick={addLinkField} style={{ fontSize: '0.8rem' }}>
              <Plus size={14} /> Add another link
            </button>
          </div>

          {/* Tasks */}
          <div className="form-group">
            <label>Daily Tasks</label>
            {tasks.map((task, i) => (
              <div key={i} style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
                <input
                  type="text"
                  value={task}
                  onChange={(e) => updateTask(i, e.target.value)}
                  placeholder="e.g., Check-in on Discord"
                />
                {tasks.length > 1 && (
                  <button type="button" className="btn btn-ghost" onClick={() => removeTaskField(i)}>
                    <Trash2 size={14} />
                  </button>
                )}
              </div>
            ))}
            <button type="button" className="btn btn-ghost" onClick={addTaskField} style={{ fontSize: '0.8rem' }}>
              <Plus size={14} /> Add another task
            </button>
          </div>

          <div className="modal-actions">
            <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary">
              <Plus size={16} /> Add Project
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default AddProjectModal
