import express from 'express'
import cors from 'cors'
import TelegramBot from 'node-telegram-bot-api'

const app = express()
app.use(cors())
app.use(express.json())

const PORT = process.env.PORT || 3001

// In-memory storage for messages and bot instances
let botInstance = null
let botToken = ''
let monitoredChats = [] // { chatId, title, projectId?, keywords[] }
let messages = [] // { chatId, messageId, text, date, from, chatTitle, matchedKeywords[] }
let globalKeywords = [] // Global keywords applied to all chats
const MAX_MESSAGES = 500

// Check if a message matches any keywords for its chat or globally
function matchesKeywords(text, chatId) {
  if (!text) return { matches: false, matchedKeywords: [] }
  const textLower = text.toLowerCase()

  // Find chat-specific keywords
  const chat = monitoredChats.find(c => c.chatId === chatId)
  const chatKeywords = chat?.keywords || []

  // Combine with global keywords
  const allKeywords = [...new Set([...globalKeywords, ...chatKeywords])]

  // If no keywords configured, accept nothing (require explicit keywords)
  if (allKeywords.length === 0) return { matches: false, matchedKeywords: [] }

  const matched = allKeywords.filter(kw => textLower.includes(kw.toLowerCase()))
  return { matches: matched.length > 0, matchedKeywords: matched }
}

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', botActive: !!botInstance, monitoredChats: monitoredChats.length })
})

// Configure bot token
app.post('/api/telegram/config', (req, res) => {
  const { token } = req.body
  if (!token) return res.status(400).json({ error: 'Token is required' })

  try {
    // Stop existing bot if running
    if (botInstance) {
      botInstance.stopPolling()
      botInstance = null
    }

    botToken = token
    botInstance = new TelegramBot(token, { polling: true })

    // Listen for all messages
    botInstance.on('message', (msg) => {
      const chatId = msg.chat.id.toString()
      const isMonitored = monitoredChats.some(c => c.chatId === chatId)

      // Auto-add chat if it's a group/supergroup
      if ((msg.chat.type === 'group' || msg.chat.type === 'supergroup') && !isMonitored) {
        monitoredChats.push({
          chatId,
          title: msg.chat.title || `Chat ${chatId}`,
          projectId: null,
          keywords: [],
          addedAt: new Date().toISOString()
        })
      }

      // Only store message if it matches keywords
      const text = msg.text || msg.caption || ''
      const { matches, matchedKeywords } = matchesKeywords(text, chatId)

      if (text && matches) {
        const messageEntry = {
          chatId,
          messageId: msg.message_id,
          text,
          date: new Date(msg.date * 1000).toISOString(),
          from: {
            id: msg.from?.id,
            firstName: msg.from?.first_name || '',
            lastName: msg.from?.last_name || '',
            username: msg.from?.username || ''
          },
          chatTitle: msg.chat.title || 'Private',
          chatType: msg.chat.type,
          matchedKeywords
        }
        messages.unshift(messageEntry)
        if (messages.length > MAX_MESSAGES) {
          messages = messages.slice(0, MAX_MESSAGES)
        }
      }
    })

    // Handle polling errors gracefully
    botInstance.on('polling_error', (error) => {
      console.error('Telegram polling error:', error.message)
    })

    res.json({ success: true, message: 'Bot connected successfully' })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// Get bot status
app.get('/api/telegram/status', (req, res) => {
  res.json({
    active: !!botInstance,
    token: botToken ? `${botToken.slice(0, 8)}...${botToken.slice(-4)}` : null,
    monitoredChats: monitoredChats.length,
    totalMessages: messages.length,
    globalKeywords
  })
})

// Disconnect bot
app.post('/api/telegram/disconnect', (req, res) => {
  if (botInstance) {
    botInstance.stopPolling()
    botInstance = null
  }
  botToken = ''
  res.json({ success: true })
})

// Get monitored chats
app.get('/api/telegram/chats', (req, res) => {
  res.json(monitoredChats)
})

// Link chat to project
app.post('/api/telegram/chats/:chatId/link', (req, res) => {
  const { chatId } = req.params
  const { projectId } = req.body
  const chat = monitoredChats.find(c => c.chatId === chatId)
  if (!chat) return res.status(404).json({ error: 'Chat not found' })
  chat.projectId = projectId || null
  res.json(chat)
})

// Remove chat from monitoring
app.delete('/api/telegram/chats/:chatId', (req, res) => {
  const { chatId } = req.params
  monitoredChats = monitoredChats.filter(c => c.chatId !== chatId)
  messages = messages.filter(m => m.chatId !== chatId)
  res.json({ success: true })
})

// Get all messages (with optional filters)
app.get('/api/telegram/messages', (req, res) => {
  const { chatId, projectId, limit = 50, offset = 0 } = req.query

  let filtered = [...messages]

  if (chatId) {
    filtered = filtered.filter(m => m.chatId === chatId)
  }

  if (projectId) {
    const linkedChatIds = monitoredChats
      .filter(c => c.projectId === projectId)
      .map(c => c.chatId)
    filtered = filtered.filter(m => linkedChatIds.includes(m.chatId))
  }

  const total = filtered.length
  const data = filtered.slice(Number(offset), Number(offset) + Number(limit))

  res.json({ data, total, offset: Number(offset), limit: Number(limit) })
})

// Get messages summary/aggregation per project
app.get('/api/telegram/summary', (req, res) => {
  const summary = monitoredChats.map(chat => {
    const chatMessages = messages.filter(m => m.chatId === chat.chatId)
    const today = new Date().toISOString().split('T')[0]
    const todayMessages = chatMessages.filter(m => m.date.startsWith(today))

    return {
      chatId: chat.chatId,
      title: chat.title,
      projectId: chat.projectId,
      totalMessages: chatMessages.length,
      todayMessages: todayMessages.length,
      latestMessage: chatMessages[0] || null
    }
  })

  res.json(summary)
})

// Manually add a chat to monitor (by chat ID or username)
app.post('/api/telegram/chats', async (req, res) => {
  const { chatId, title } = req.body
  if (!chatId) return res.status(400).json({ error: 'chatId is required' })

  const exists = monitoredChats.some(c => c.chatId === chatId.toString())
  if (exists) return res.status(400).json({ error: 'Chat already monitored' })

  monitoredChats.push({
    chatId: chatId.toString(),
    title: title || `Chat ${chatId}`,
    projectId: null,
    keywords: [],
    addedAt: new Date().toISOString()
  })

  res.json({ success: true })
})

// ==================== KEYWORD MANAGEMENT ====================

// Get global keywords
app.get('/api/telegram/keywords', (req, res) => {
  res.json({ globalKeywords })
})

// Set global keywords
app.post('/api/telegram/keywords', (req, res) => {
  const { keywords } = req.body
  if (!Array.isArray(keywords)) return res.status(400).json({ error: 'keywords must be an array' })
  globalKeywords = keywords.filter(k => k && k.trim()).map(k => k.trim())
  res.json({ globalKeywords })
})

// Add a global keyword
app.post('/api/telegram/keywords/add', (req, res) => {
  const { keyword } = req.body
  if (!keyword || !keyword.trim()) return res.status(400).json({ error: 'keyword is required' })
  const kw = keyword.trim()
  if (!globalKeywords.includes(kw)) {
    globalKeywords.push(kw)
  }
  res.json({ globalKeywords })
})

// Remove a global keyword
app.delete('/api/telegram/keywords/:keyword', (req, res) => {
  const kw = decodeURIComponent(req.params.keyword)
  globalKeywords = globalKeywords.filter(k => k !== kw)
  res.json({ globalKeywords })
})

// Set keywords for a specific chat
app.post('/api/telegram/chats/:chatId/keywords', (req, res) => {
  const { chatId } = req.params
  const { keywords } = req.body
  const chat = monitoredChats.find(c => c.chatId === chatId)
  if (!chat) return res.status(404).json({ error: 'Chat not found' })
  chat.keywords = Array.isArray(keywords) ? keywords.filter(k => k && k.trim()).map(k => k.trim()) : []
  res.json(chat)
})

// Add keyword to a specific chat
app.post('/api/telegram/chats/:chatId/keywords/add', (req, res) => {
  const { chatId } = req.params
  const { keyword } = req.body
  const chat = monitoredChats.find(c => c.chatId === chatId)
  if (!chat) return res.status(404).json({ error: 'Chat not found' })
  if (!keyword || !keyword.trim()) return res.status(400).json({ error: 'keyword is required' })
  const kw = keyword.trim()
  if (!chat.keywords) chat.keywords = []
  if (!chat.keywords.includes(kw)) {
    chat.keywords.push(kw)
  }
  res.json(chat)
})

app.listen(PORT, () => {
  console.log(`AirDrop Manager Backend running on port ${PORT}`)
  console.log(`API: http://localhost:${PORT}/api/health`)
})
