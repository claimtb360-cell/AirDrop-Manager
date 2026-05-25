import { useState, useEffect } from 'react'
import { Settings, Wifi, WifiOff, Trash2, Link, Send, Tag, Plus, X } from 'lucide-react'

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001/api'

function TelegramConfig({ projects }) {
  const [token, setToken] = useState('')
  const [status, setStatus] = useState(null)
  const [chats, setChats] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [newChatId, setNewChatId] = useState('')
  const [newChatTitle, setNewChatTitle] = useState('')
  const [globalKeywords, setGlobalKeywords] = useState([])
  const [newGlobalKeyword, setNewGlobalKeyword] = useState('')
  const [chatKeywordInputs, setChatKeywordInputs] = useState({})

  useEffect(() => {
    fetchStatus()
    fetchChats()
    fetchKeywords()
    const interval = setInterval(() => {
      fetchStatus()
      fetchChats()
    }, 10000)
    return () => clearInterval(interval)
  }, [])

  const fetchStatus = async () => {
    try {
      const res = await fetch(`${API_BASE}/telegram/status`)
      if (res.ok) {
        const data = await res.json()
        setStatus(data)
        if (data.globalKeywords) setGlobalKeywords(data.globalKeywords)
      }
    } catch (e) {
      setStatus(null)
    }
  }

  const fetchChats = async () => {
    try {
      const res = await fetch(`${API_BASE}/telegram/chats`)
      if (res.ok) setChats(await res.json())
    } catch (e) {}
  }

  const fetchKeywords = async () => {
    try {
      const res = await fetch(`${API_BASE}/telegram/keywords`)
      if (res.ok) {
        const data = await res.json()
        setGlobalKeywords(data.globalKeywords || [])
      }
    } catch (e) {}
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

  // Global keyword management
  const addGlobalKeyword = async () => {
    if (!newGlobalKeyword.trim()) return
    try {
      const res = await fetch(`${API_BASE}/telegram/keywords/add`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ keyword: newGlobalKeyword.trim() })
      })
      if (res.ok) {
        const data = await res.json()
        setGlobalKeywords(data.globalKeywords)
        setNewGlobalKeyword('')
      }
    } catch (e) {
      setError('Failed to add keyword')
    }
  }

  const removeGlobalKeyword = async (kw) => {
    try {
      const res = await fetch(`${API_BASE}/telegram/keywords/${encodeURIComponent(kw)}`, { method: 'DELETE' })
      if (res.ok) {
        const data = await res.json()
        setGlobalKeywords(data.globalKeywords)
      }
    } catch (e) {
      setError('Failed to remove keyword')
    }
  }

  // Chat-specific keyword management
  const addChatKeyword = async (chatId) => {
    const kw = chatKeywordInputs[chatId]?.trim()
    if (!kw) return
    try {
      const res = await fetch(`${API_BASE}/telegram/chats/${chatId}/keywords/add`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ keyword: kw })
      })
      if (res.ok) {
        setChatKeywordInputs({ ...chatKeywordInputs, [chatId]: '' })
        await fetchChats()
      }
    } catch (e) {
      setError('Failed to add keyword')
    }
  }

  const removeChatKeyword = async (chatId, keyword) => {
    const chat = chats.find(c => c.chatId === chatId)
    if (!chat) return
    const newKeywords = (chat.keywords || []).filter(k => k !== keyword)
    try {
      await fetch(`${API_BASE}/telegram/chats/${chatId}/keywords`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ keywords: newKeywords })
      })
      await fetchChats()
    } catch (e) {
      setError('Failed to remove keyword')
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

      {/* KEYWORD FILTER SECTION */}
      {isConnected && (
        <div className="config-section keywords-section">
          <label><Tag size={14} style={{ display: 'inline', marginRight: '6px' }} />Keyword Filter (Global)</label>
          <p className="help-text">
            Only messages containing at least one keyword will be captured. 
            Use project names, terms like "airdrop", "claim", "snapshot", "testnet"...
          </p>

          <div className="keywords-list">
            {globalKeywords.length === 0 ? (
              <p className="empty-hint">No keywords set. Add keywords to start filtering messages.</p>
            ) : (
              globalKeywords.map(kw => (
                <span key={kw} className="keyword-tag">
                  {kw}
                  <button onClick={() => removeGlobalKeyword(kw)}><X size={12} /></button>
                </span>
              ))
            )}
          </div>

          <div className="keyword-input">
            <input
              type="text"
              value={newGlobalKeyword}
              onChange={(e) => setNewGlobalKeyword(e.target.value)}
              placeholder="e.g., airdrop, LayerZero, claim, testnet..."
              onKeyDown={(e) => e.key === 'Enter' && addGlobalKeyword()}
            />
            <button className="btn btn-primary" onClick={addGlobalKeyword} style={{ padding: '8px 12px' }}>
              <Plus size={14} />
            </button>
          </div>
        </div>
      )}

      {/* Monitored Chats */}
      {isConnected && (
        <>
          <div className="config-section">
            <label>Monitored Groups</label>
            <p className="help-text">
              Groups auto-detected when bot receives messages. You can add per-group keywords for more specific filtering.
            </p>

            {chats.length > 0 ? (
              <div className="chats-list">
                {chats.map(chat => (
                  <div key={chat.chatId} className="chat-item-expanded">
                    <div className="chat-item-header">
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

                    {/* Per-chat keywords */}
                    <div className="chat-keywords">
                      <span className="chat-keywords-label">Keywords:</span>
                      {(chat.keywords || []).map(kw => (
                        <span key={kw} className="keyword-tag keyword-tag-sm">
                          {kw}
                          <button onClick={() => removeChatKeyword(chat.chatId, kw)}><X size={10} /></button>
                        </span>
                      ))}
                      <div className="chat-keyword-add">
                        <input
                          type="text"
                          value={chatKeywordInputs[chat.chatId] || ''}
                          onChange={(e) => setChatKeywordInputs({ ...chatKeywordInputs, [chat.chatId]: e.target.value })}
                          placeholder="Add keyword..."
                          onKeyDown={(e) => e.key === 'Enter' && addChatKeyword(chat.chatId)}
                        />
                        <button onClick={() => addChatKeyword(chat.chatId)}><Plus size={12} /></button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="empty-hint">No groups detected yet.</p>
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
