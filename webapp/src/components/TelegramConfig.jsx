import { useState, useEffect } from 'react'
import { Settings, Wifi, WifiOff, Trash2, Link, Send } from 'lucide-react'

const API_BASE = 'http://localhost:3001/api'

function TelegramConfig({ projects }) {
  const [token, setToken] = useState('')
  const [status, setStatus] = useState(null)
  const [chats, setChats] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [newChatId, setNewChatId] = useState('')
  const [newChatTitle, setNewChatTitle] = useState('')

  useEffect(() => {
    fetchStatus()
    fetchChats()
    const interval = setInterval(() => {
      fetchStatus()
      fetchChats()
    }, 10000)
    return () => clearInterval(interval)
  }, [])

  const fetchStatus = async () => {
    try {
      const res = await fetch(`${API_BASE}/telegram/status`)
      if (res.ok) setStatus(await res.json())
    } catch (e) {
      setStatus(null)
    }
  }

  const fetchChats = async () => {
    try {
      const res = await fetch(`${API_BASE}/telegram/chats`)
      if (res.ok) setChats(await res.json())
    } catch (e) {
      // backend offline
    }
  }

  const connectBot = async () => {
    if (!token.trim()) return
    setLoading(true)
    setError('')
    try {
      const res = await fetch(`${API_BASE}/telegram/config`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: token.trim() })
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      await fetchStatus()
      setToken('')
    } catch (e) {
      setError(e.message || 'Failed to connect bot')
    }
    setLoading(false)
  }

  const disconnectBot = async () => {
    try {
      await fetch(`${API_BASE}/telegram/disconnect`, { method: 'POST' })
      setStatus(null)
      setChats([])
    } catch (e) {
      setError('Failed to disconnect')
    }
  }

  const addChat = async () => {
    if (!newChatId.trim()) return
    setError('')
    try {
      const res = await fetch(`${API_BASE}/telegram/chats`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chatId: newChatId.trim(), title: newChatTitle.trim() || undefined })
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setNewChatId('')
      setNewChatTitle('')
      await fetchChats()
    } catch (e) {
      setError(e.message)
    }
  }

  const removeChat = async (chatId) => {
    try {
      await fetch(`${API_BASE}/telegram/chats/${chatId}`, { method: 'DELETE' })
      await fetchChats()
    } catch (e) {
      setError('Failed to remove chat')
    }
  }

  const linkChatToProject = async (chatId, projectId) => {
    try {
      await fetch(`${API_BASE}/telegram/chats/${chatId}/link`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ projectId: projectId || null })
      })
      await fetchChats()
    } catch (e) {
      setError('Failed to link chat')
    }
  }

  const isConnected = status?.active

  return (
    <div className="telegram-config">
      <div className="config-header">
        <Settings size={20} />
        <h3>Telegram Configuration</h3>
      </div>

      {/* Connection Status */}
      <div className={`status-card ${isConnected ? 'connected' : 'disconnected'}`}>
        <div className="status-indicator">
          {isConnected ? <Wifi size={16} /> : <WifiOff size={16} />}
          <span>{isConnected ? 'Bot Connected' : 'Bot Disconnected'}</span>
        </div>
        {isConnected && (
          <div className="status-details">
            <span>Token: {status.token}</span>
            <span>Chats: {status.monitoredChats}</span>
            <span>Messages: {status.totalMessages}</span>
          </div>
        )}
      </div>

      {/* Connect / Disconnect */}
      {!isConnected ? (
        <div className="config-section">
          <label>Bot Token</label>
          <p className="help-text">
            Create a bot via <a href="https://t.me/BotFather" target="_blank" rel="noopener noreferrer">@BotFather</a> on Telegram, 
            then disable privacy mode (<code>/setprivacy</code> → Disable) so it can read group messages.
            Add the bot to your airdrop groups.
          </p>
          <div className="token-input">
            <input
              type="password"
              value={token}
              onChange={(e) => setToken(e.target.value)}
              placeholder="Paste your bot token here..."
              onKeyDown={(e) => e.key === 'Enter' && connectBot()}
            />
            <button className="btn btn-primary" onClick={connectBot} disabled={loading}>
              {loading ? 'Connecting...' : 'Connect'}
            </button>
          </div>
        </div>
      ) : (
        <div className="config-section">
          <button className="btn btn-danger" onClick={disconnectBot}>
            <WifiOff size={14} /> Disconnect Bot
          </button>
        </div>
      )}

      {error && <div className="error-msg">{error}</div>}

      {/* Monitored Chats */}
      {isConnected && (
        <>
          <div className="config-section">
            <label>Monitored Groups/Channels</label>
            <p className="help-text">
              Groups are auto-detected when the bot receives messages. You can also add manually by Chat ID.
            </p>

            {chats.length > 0 ? (
              <div className="chats-list">
                {chats.map(chat => (
                  <div key={chat.chatId} className="chat-item">
                    <div className="chat-info">
                      <Send size={14} color="var(--accent)" />
                      <span className="chat-title">{chat.title}</span>
                      <span className="chat-id">ID: {chat.chatId}</span>
                    </div>
                    <div className="chat-actions">
                      <select
                        value={chat.projectId || ''}
                        onChange={(e) => linkChatToProject(chat.chatId, e.target.value)}
                        title="Link to project"
                      >
                        <option value="">No project</option>
                        {projects.map(p => (
                          <option key={p.id} value={p.id}>{p.name}</option>
                        ))}
                      </select>
                      <button className="btn btn-ghost" onClick={() => removeChat(chat.chatId)} title="Remove">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="empty-hint">No groups detected yet. Send a message in a group where the bot is added.</p>
            )}
          </div>

          {/* Manual add chat */}
          <div className="config-section">
            <label>Add Chat Manually</label>
            <div className="add-chat-form">
              <input
                type="text"
                value={newChatId}
                onChange={(e) => setNewChatId(e.target.value)}
                placeholder="Chat ID (e.g., -1001234567890)"
              />
              <input
                type="text"
                value={newChatTitle}
                onChange={(e) => setNewChatTitle(e.target.value)}
                placeholder="Group name (optional)"
              />
              <button className="btn btn-primary" onClick={addChat}>
                <Link size={14} /> Add
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}

export default TelegramConfig
