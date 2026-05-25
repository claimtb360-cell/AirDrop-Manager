import { useState, useEffect } from 'react'
import { MessageSquare, RefreshCw, Filter, ExternalLink, Clock, User } from 'lucide-react'
import { API_BASE } from '../config'

function TelegramFeed({ projects }) {
  const [messages, setMessages] = useState([])
  const [summary, setSummary] = useState([])
  const [loading, setLoading] = useState(false)
  const [filterProject, setFilterProject] = useState('')
  const [filterChat, setFilterChat] = useState('')
  const [autoRefresh, setAutoRefresh] = useState(true)
  const [lastUpdated, setLastUpdated] = useState(null)

  useEffect(() => {
    fetchMessages()
    fetchSummary()
  }, [filterProject, filterChat])

  useEffect(() => {
    if (!autoRefresh) return
    const interval = setInterval(() => {
      fetchMessages()
      fetchSummary()
    }, 15000) // Refresh every 15s
    return () => clearInterval(interval)
  }, [autoRefresh, filterProject, filterChat])

  const fetchMessages = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({ limit: '100' })
      if (filterProject) params.set('projectId', filterProject)
      if (filterChat) params.set('chatId', filterChat)

      const res = await fetch(`${API_BASE}/telegram/messages?${params}`)
      if (res.ok) {
        const data = await res.json()
        setMessages(data.data || [])
        setLastUpdated(new Date())
      }
    } catch (e) {
      // backend offline
    }
    setLoading(false)
  }

  const fetchSummary = async () => {
    try {
      const res = await fetch(`${API_BASE}/telegram/summary`)
      if (res.ok) setSummary(await res.json())
    } catch (e) {
      // ignore
    }
  }

  const formatTime = (dateStr) => {
    const d = new Date(dateStr)
    const now = new Date()
    const diff = (now - d) / 1000

    if (diff < 60) return 'just now'
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
  }

  const getProjectName = (projectId) => {
    const project = projects.find(p => p.id === projectId)
    return project?.name || null
  }

  const uniqueChats = [...new Set(messages.map(m => m.chatId))].map(chatId => {
    const msg = messages.find(m => m.chatId === chatId)
    return { chatId, title: msg?.chatTitle || chatId }
  })

  return (
    <div className="telegram-feed">
      <div className="feed-header">
        <div>
          <h2>
            <MessageSquare size={22} style={{ display: 'inline', marginRight: '8px' }} />
            Telegram Feed
          </h2>
          {lastUpdated && (
            <p className="last-updated">
              Last updated: {formatTime(lastUpdated.toISOString())}
            </p>
          )}
        </div>
        <div className="feed-actions">
          <label className="auto-refresh-toggle">
            <input
              type="checkbox"
              checked={autoRefresh}
              onChange={(e) => setAutoRefresh(e.target.checked)}
            />
            <span>Auto-refresh</span>
          </label>
          <button className="btn btn-ghost" onClick={fetchMessages} disabled={loading}>
            <RefreshCw size={16} className={loading ? 'spinning' : ''} />
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      {summary.length > 0 && (
        <div className="feed-summary">
          {summary.map(s => (
            <div key={s.chatId} className="summary-card" onClick={() => setFilterChat(s.chatId === filterChat ? '' : s.chatId)}>
              <div className="summary-card-header">
                <h4>{s.title}</h4>
                {s.projectId && (
                  <span className="project-tag">{getProjectName(s.projectId)}</span>
                )}
              </div>
              <div className="summary-card-stats">
                <span>{s.todayMessages} today</span>
                <span>{s.totalMessages} total</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Filters */}
      <div className="feed-filters">
        <Filter size={14} color="var(--text-muted)" />
        <select value={filterProject} onChange={(e) => setFilterProject(e.target.value)}>
          <option value="">All Projects</option>
          {projects.map(p => (
            <option key={p.id} value={p.id}>{p.name}</option>
          ))}
        </select>
        <select value={filterChat} onChange={(e) => setFilterChat(e.target.value)}>
          <option value="">All Groups</option>
          {uniqueChats.map(c => (
            <option key={c.chatId} value={c.chatId}>{c.title}</option>
          ))}
        </select>
      </div>

      {/* Messages */}
      <div className="messages-list">
        {messages.length === 0 ? (
          <div className="empty-state">
            <MessageSquare size={40} color="var(--text-muted)" />
            <h3>No messages yet</h3>
            <p>Connect your Telegram bot and add it to airdrop groups to start receiving messages.</p>
          </div>
        ) : (
          messages.map((msg, idx) => (
            <div key={`${msg.chatId}-${msg.messageId}-${idx}`} className="message-item">
              <div className="message-header">
                <div className="message-source">
                  <span className="message-chat">{msg.chatTitle}</span>
                  {msg.from?.username && (
                    <span className="message-author">
                      <User size={12} />
                      @{msg.from.username}
                    </span>
                  )}
                </div>
                <span className="message-time">
                  <Clock size={12} />
                  {formatTime(msg.date)}
                </span>
              </div>
              <p className="message-text">{msg.text}</p>
              {msg.matchedKeywords?.length > 0 && (
                <div className="message-keywords">
                  {msg.matchedKeywords.map(kw => (
                    <span key={kw} className="keyword-match-tag">{kw}</span>
                  ))}
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  )
}

export default TelegramFeed
