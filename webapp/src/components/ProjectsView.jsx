import { useState } from 'react'
import { STATUSES, CHAINS } from '../App'
import { Plus, Trash2, Search, Play, Edit3, Copy, RefreshCw, Heart, MoreHorizontal, ExternalLink, X, Check, ChevronDown } from 'lucide-react'
import ProjectDetailPanel from './ProjectDetailPanel'

function ProjectsView({ projects, selectedProject, onSelect, onAdd, onUpdate, onDelete, onDeleteMultiple, onToggleTask, searchQuery, setSearchQuery, trashedCount }) {
  const [selectedIds, setSelectedIds] = useState([])
  const [filterStatus, setFilterStatus] = useState('')
  const [filterChain, setFilterChain] = useState('')

  // Filter projects
  let filtered = projects.filter(p => {
    const matchSearch = !searchQuery || 
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.token?.toLowerCase().includes(searchQuery.toLowerCase())
    const matchStatus = !filterStatus || p.status === filterStatus
    const matchChain = !filterChain || p.chain === filterChain
    return matchSearch && matchStatus && matchChain
  })

  // Stats
  const stats = STATUSES.map(s => ({
    ...s,
    count: projects.filter(p => p.status === s.id).length
  }))
  const totalProjects = projects.length

  // Selection
  const toggleSelect = (id) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id])
  }
  const toggleSelectAll = () => {
    if (selectedIds.length === filtered.length) {
      setSelectedIds([])
    } else {
      setSelectedIds(filtered.map(p => p.id))
    }
  }

  const handleDeleteSelected = () => {
    if (selectedIds.length === 0) return
    onDeleteMultiple(selectedIds)
    setSelectedIds([])
  }

  const handleStatusChange = (projectId, newStatus) => {
    const project = projects.find(p => p.id === projectId)
    if (project) onUpdate({ ...project, status: newStatus })
  }

  const handleFavorite = (projectId) => {
    const project = projects.find(p => p.id === projectId)
    if (project) onUpdate({ ...project, favorite: !project.favorite })
  }

  const getChainInfo = (chainId) => CHAINS.find(c => c.id === chainId) || null
  const getStatusInfo = (statusId) => STATUSES.find(s => s.id === statusId) || STATUSES[0]

  const formatDate = (dateStr) => {
    if (!dateStr) return ''
    const d = new Date(dateStr)
    return d.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' }) + ' ' +
           d.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
  }

  return (
    <div className="projects-view">
      {/* Stats Bar */}
      <div className="stats-bar">
        <div className="stat-item stat-total">
          <span className="stat-number">{totalProjects}</span>
          <span className="stat-label">Tổng dự án</span>
        </div>
        {stats.map(s => (
          <div
            key={s.id}
            className={`stat-item ${filterStatus === s.id ? 'stat-active' : ''}`}
            onClick={() => setFilterStatus(filterStatus === s.id ? '' : s.id)}
            style={{ cursor: 'pointer' }}
          >
            <span className="stat-number" style={{ color: s.color }}>{s.count}</span>
            <span className="stat-label">{s.label}</span>
          </div>
        ))}
      </div>

      {/* Toolbar */}
      <div className="toolbar">
        <button className="btn btn-primary" onClick={onAdd}>
          <Plus size={16} /> Thêm dự án
        </button>

        {selectedIds.length > 0 && (
          <>
            <button className="btn btn-danger" onClick={handleDeleteSelected}>
              <Trash2 size={14} /> Xóa ({selectedIds.length})
            </button>
          </>
        )}

        <div className="toolbar-spacer" />

        <div className="toolbar-trash">
          <Trash2 size={14} />
          <span>Thùng rác ({trashedCount})</span>
        </div>

        <div className="search-input">
          <Search size={14} />
          <input
            type="text"
            placeholder="Tìm dự án, chain, tag..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <select className="filter-select" value={filterChain} onChange={(e) => setFilterChain(e.target.value)}>
          <option value="">Tất cả chain</option>
          {CHAINS.map(c => <option key={c.id} value={c.id}>{c.label}</option>)}
        </select>

        <select className="filter-select" value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
          <option value="">Tất cả trạng thái</option>
          {STATUSES.map(s => <option key={s.id} value={s.id}>{s.label}</option>)}
        </select>
      </div>

      {/* Main content: table + detail panel */}
      <div className="projects-layout">
        {/* Table */}
        <div className="projects-table-wrap">
          <table className="projects-table">
            <thead>
              <tr>
                <th className="col-check">
                  <input type="checkbox" checked={selectedIds.length === filtered.length && filtered.length > 0} onChange={toggleSelectAll} />
                </th>
                <th className="col-num">#</th>
                <th className="col-date">Ngày message</th>
                <th className="col-title">Tiêu đề</th>
                <th className="col-chain">Chain</th>
                <th className="col-status">Trạng thái</th>
                <th className="col-profiles">Profile</th>
                <th className="col-actions">Hành động</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} className="empty-row">
                    Chưa có dự án nào. Nhấn "Thêm dự án" để bắt đầu.
                  </td>
                </tr>
              ) : (
                filtered.map((project, idx) => {
                  const chain = getChainInfo(project.chain)
                  const status = getStatusInfo(project.status)
                  const isSelected = selectedIds.includes(project.id)
                  const isActive = selectedProject?.id === project.id

                  return (
                    <tr
                      key={project.id}
                      className={`${isActive ? 'row-active' : ''} ${isSelected ? 'row-selected' : ''}`}
                      onClick={() => onSelect(project)}
                    >
                      <td className="col-check" onClick={(e) => e.stopPropagation()}>
                        <input type="checkbox" checked={isSelected} onChange={() => toggleSelect(project.id)} />
                      </td>
                      <td className="col-num">{idx + 1}</td>
                      <td className="col-date">{formatDate(project.createdAt)}</td>
                      <td className="col-title">
                        <div className="title-cell">
                          <span className="title-name">{project.name}</span>
                          {project.token && <span className="title-token">token {project.token}</span>}
                        </div>
                      </td>
                      <td className="col-chain">
                        {chain && (
                          <span className="chain-badge" style={{ background: chain.color + '22', color: chain.color }}>
                            {chain.label}
                          </span>
                        )}
                      </td>
                      <td className="col-status" onClick={(e) => e.stopPropagation()}>
                        <StatusDropdown
                          current={project.status}
                          onChange={(s) => handleStatusChange(project.id, s)}
                        />
                      </td>
                      <td className="col-profiles">
                        <span className="profile-badge">
                          <span className="profile-icon">👤</span>
                          {project.profiles || 0}
                        </span>
                      </td>
                      <td className="col-actions" onClick={(e) => e.stopPropagation()}>
                        <div className="action-btns">
                          {project.links?.[0] && (
                            <button title="Mở link" onClick={() => window.open(project.links[0].url, '_blank')}>
                              <Play size={13} />
                            </button>
                          )}
                          <button title="Sửa" onClick={() => onSelect(project)}>
                            <Edit3 size={13} />
                          </button>
                          <button title="Copy" onClick={() => navigator.clipboard.writeText(project.name)}>
                            <Copy size={13} />
                          </button>
                          <button title="Yêu thích" className={project.favorite ? 'fav-active' : ''} onClick={() => handleFavorite(project.id)}>
                            <Heart size={13} fill={project.favorite ? '#f87171' : 'none'} />
                          </button>
                          <button title="Xóa" onClick={() => onDelete(project.id)}>
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Detail Panel */}
        {selectedProject && (
          <ProjectDetailPanel
            project={selectedProject}
            onClose={() => onSelect(null)}
            onUpdate={onUpdate}
            onDelete={onDelete}
            onToggleTask={onToggleTask}
          />
        )}
      </div>
    </div>
  )
}

// Status dropdown component
function StatusDropdown({ current, onChange }) {
  const [open, setOpen] = useState(false)
  const status = STATUSES.find(s => s.id === current) || STATUSES[0]

  return (
    <div className="status-dropdown-wrap">
      <button
        className="status-btn"
        style={{ background: status.color + '22', color: status.color, borderColor: status.color + '44' }}
        onClick={() => setOpen(!open)}
      >
        {status.label}
      </button>
      {open && (
        <>
          <div className="status-dropdown-overlay" onClick={() => setOpen(false)} />
          <div className="status-dropdown">
            {STATUSES.map(s => (
              <button
                key={s.id}
                className={`status-option ${s.id === current ? 'active' : ''}`}
                style={{ color: s.color }}
                onClick={() => { onChange(s.id); setOpen(false) }}
              >
                {s.label}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  )
}

export default ProjectsView
