import axios from 'axios'

const API_BASE_URL = 'http://localhost:8000'
export const DEFAULT_AVATAR =
  'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="120" height="120" viewBox="0 0 120 120"><rect width="120" height="120" rx="28" fill="%23EAFBF3"/><circle cx="60" cy="46" r="22" fill="%232FBF7B"/><path d="M24 104c6-24 24-36 36-36s30 12 36 36" fill="%232FBF7B"/></svg>'

async function request(path, payload, method = 'POST', options = {}) {
  const token = getAuthToken()
  const controller = new AbortController()
  const timeout = options.timeout || 45000
  const timeoutId = window.setTimeout(() => controller.abort(), timeout)

  let response

  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      method,
      signal: controller.signal,
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      ...(payload !== undefined ? { body: JSON.stringify(payload) } : {}),
    })
  } catch (error) {
    if (error.name === 'AbortError') {
      throw new Error('The server did not respond in time. Please check your API response.', {
        cause: error,
      })
    }
    throw error
  } finally {
    window.clearTimeout(timeoutId)
  }

  const data = await response.json().catch(() => ({}))

  if (!response.ok) {
    const message =
      response.status === 401
        ? 'Unauthorized. Please login again.'
        :
      data.message ||
      data.error ||
      Object.values(data.errors || {}).flat().join(' ') ||
      'Something went wrong. Please try again.'
    throw new Error(message)
  }

  return data
}

export const loginUser = (payload) => request('/api/user/v1/auth/login', payload)

export const registerUser = (payload) => request('/api/user/v1/auth/register', payload)

export const createChat = (payload = {}) => request('/api/user/v1/chats', payload)

export const getChats = () => request('/api/user/v1/chats', undefined, 'GET')

export const getChatDetail = (chatId) => request(`/api/user/v1/chats/${chatId}`, undefined, 'GET')

export const updateChat = (chatId, payload) => request(`/api/user/v1/chats/${chatId}`, payload, 'PUT')

export const deleteChat = (chatId) => request(`/api/user/v1/chats/${chatId}`, undefined, 'DELETE')

export async function createChatMessage(chatId, payload = {}) {
  const token = getAuthToken()
  const formData = new FormData()
  const attachments = Array.isArray(payload.attachments)
    ? payload.attachments
    : [payload.attachments].filter(Boolean)

  formData.append('message', payload.message || '')
  attachments.forEach((file) => {
    formData.append('attachments', file)
  })

  try {
    const response = await axios.post(`${API_BASE_URL}/api/user/v1/chats/${chatId}/messages`, formData, {
      timeout: 90000,
      headers: {
        Accept: 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    })

    return response.data
  } catch (error) {
    if (error.code === 'ECONNABORTED') {
      throw new Error('The server did not respond in time. Please check your API response.', {
        cause: error,
      })
    }

    const data = error.response?.data || {}
    const message =
      error.response?.status === 401
        ? 'Unauthorized. Please login again.'
        : data.message ||
          data.error ||
          Object.values(data.errors || {}).flat().join(' ') ||
          error.message ||
          'Something went wrong. Please try again.'

    throw new Error(message, { cause: error })
  }
}

export function isApiChatId(chatId) {
  return /^\d+$/.test(String(chatId || ''))
}

export async function logoutUser() {
  const token = getAuthToken()

  const response = await fetch(`${API_BASE_URL}/api/user/v1/auth/logout`, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  })

  const data = await response.json().catch(() => ({}))

  if (!response.ok) {
    const message = data.message || data.error || 'Logout request failed.'
    throw new Error(message)
  }

  return data
}

export function persistAuth(data) {
  const token = getTokenFromAuthResponse(data)
  const user = data.user || data.data?.user || data.data?.data?.user || getUserFromAuthResponse(data)

  if (token) {
    localStorage.setItem('voxa_token', token)
    localStorage.setItem('token', token)
    localStorage.setItem('access_token', token)
  }
  if (user) {
    localStorage.setItem('voxa_user', JSON.stringify(user))
    localStorage.setItem('user', JSON.stringify(user))
  }
}

export function getAuthToken() {
  const token =
    localStorage.getItem('voxa_token') ||
    localStorage.getItem('access_token') ||
    localStorage.getItem('token')

  if (!token || token === 'undefined' || token === 'null') {
    return ''
  }

  return token
}

export function isAuthenticated() {
  return Boolean(getAuthToken())
}

export function getStoredUser() {
  const rawUser = localStorage.getItem('voxa_user') || localStorage.getItem('user')

  if (!rawUser) {
    return {
      name: 'User',
      email: 'No email',
      phone: 'No phone',
      avatar: DEFAULT_AVATAR,
    }
  }

  try {
    const user = JSON.parse(rawUser)
    return normalizeUser(user)
  } catch {
    return {
      name: 'User',
      email: 'No email',
      phone: 'No phone',
      avatar: DEFAULT_AVATAR,
    }
  }
}

export function normalizeUser(user = {}) {
  return {
    id: user.id,
    name: user.name || user.username || user.full_name || 'User',
    email: user.email || 'No email',
    phone: user.phone || user.phone_number || user.mobile || 'No phone',
    role: user.role || 'user',
    avatar:
      user.avatar ||
      user.image ||
      user.profile_image ||
      user.profile_photo ||
      user.profile ||
      user.photo ||
      DEFAULT_AVATAR,
  }
}

function getUserFromAuthResponse(data = {}) {
  if (
    data.data?.data &&
    typeof data.data.data === 'object' &&
    (data.data.data.email || data.data.data.name)
  ) {
    return data.data.data
  }

  if (data.data && typeof data.data === 'object' && (data.data.email || data.data.name)) {
    return data.data
  }

  if (data.email || data.name || data.phone || data.profile) {
    return data
  }

  return null
}

function getTokenFromAuthResponse(data = {}) {
  return (
    data.token ||
    data.access_token ||
    data.access ||
    data.jwt ||
    data.data?.token ||
    data.data?.access_token ||
    data.data?.access ||
    data.data?.jwt ||
    data.data?.data?.token ||
    data.data?.data?.access_token ||
    data.data?.data?.access ||
    data.data?.data?.jwt ||
    data.auth?.token ||
    data.auth?.access_token ||
    data.data?.auth?.token ||
    data.data?.auth?.access_token
  )
}

export function clearAuth() {
  localStorage.removeItem('voxa_token')
  localStorage.removeItem('token')
  localStorage.removeItem('access_token')
  localStorage.removeItem('voxa_user')
  localStorage.removeItem('user')
}

function compact(values) {
  return values.filter((value) => value !== undefined && value !== null)
}

function firstArray(values) {
  return compact(values).find((value) => Array.isArray(value))
}

function firstObject(values) {
  return compact(values).find(
    (value) => value && typeof value === 'object' && !Array.isArray(value),
  )
}

function normalizeRole(role, message = {}) {
  const value = String(role || message.sender || message.from || '').toLowerCase()

  if (['assistant', 'ai', 'bot', 'system'].includes(value) || message.is_ai || message.from_ai) {
    return 'ai'
  }

  return 'user'
}

function extractChatObject(data = {}) {
  return (
    firstObject([
      data.data?.chat,
      data.data?.data?.chat,
      data.data?.data,
      data.chat,
      data.result,
      data.item,
      data.data,
      data,
    ]) || {}
  )
}

function extractChatArray(data = []) {
  return firstArray([
    data,
    data.data,
    data.data?.data,
    data.data?.chats,
    data.data?.items,
    data.data?.results,
    data.data?.records,
    data.data?.data?.chats,
    data.data?.data?.items,
    data.data?.data?.results,
    data.chats,
    data.items,
    data.results,
    data.records,
    data.chat_history,
    data.histories,
    data.chats?.data,
    data.items?.data,
    data.results?.data,
  ])
}

function extractMessageArray(data = {}, chat = {}) {
  return firstArray([
    chat.messages,
    chat.chat_messages,
    chat.conversation,
    chat.message_history,
    chat.messages?.data,
    chat.chat_messages?.data,
    data.messages,
    data.chat_messages,
    data.conversation,
    data.message_history,
    data.data?.messages,
    data.data?.chat_messages,
    data.data?.conversation,
    data.data?.message_history,
    data.data?.data?.messages,
    data.data?.data?.chat_messages,
    data.data?.data?.conversation,
    data.data?.data?.message_history,
    data.data?.chat?.messages,
    data.data?.chat?.chat_messages,
    data.data?.data?.chat?.messages,
    data.data?.data?.chat?.chat_messages,
  ])
}

export function normalizeChat(data = {}, fallback = {}) {
  const chat = extractChatObject(data)
  const id = chat.id || chat.chat_id || chat.uuid || chat.slug || fallback.id

  return {
    id: String(id || `chat-${Date.now()}`),
    title:
      chat.title ||
      chat.name ||
      chat.chat_title ||
      chat.chat_name ||
      chat.subject ||
      chat.topic ||
      fallback.title ||
      'New Chat',
    updatedAt:
      chat.updated_at ||
      chat.updatedAt ||
      chat.created_at ||
      chat.createdAt ||
      chat.last_message_at ||
      fallback.updatedAt ||
      'Now',
    messages: normalizeMessages(extractMessageArray(data, chat) || fallback.messages || []),
  }
}

export function normalizeChats(data = [], fallback = []) {
  const chats = extractChatArray(data)

  if (!chats) {
    return fallback
  }

  return chats.map((chat, index) => normalizeChat(chat, fallback[index] || {}))
}

export function normalizeMessages(messages = []) {
  if (!Array.isArray(messages)) {
    return []
  }

  return messages.map((message, index) => ({
    id: String(message.id || message.message_id || message.uuid || `message-${index + 1}`),
    role: normalizeRole(message.role, message),
    message:
      message.message ||
      message.content ||
      message.text ||
      message.body ||
      message.question ||
      message.answer ||
      '',
    createdAt: message.created_at || message.createdAt || message.sent_at || 'Now',
  }))
}

export function normalizeCreatedMessage(data = {}, fallbackMessages = []) {
  const messages =
    data.data?.messages ||
    data.data?.data?.messages ||
    data.messages ||
    data.data?.chat_messages ||
    data.chat_messages

  if (Array.isArray(messages)) {
    return mergeMessages(fallbackMessages, normalizeMessages(messages))
  }

  const userMessage = data.data?.user_message || data.user_message
  const aiMessage =
    data.data?.ai_message ||
    data.data?.assistant_message ||
    data.data?.response ||
    data.data?.reply ||
    data.data?.answer ||
    data.ai_message ||
    data.assistant_message ||
    data.response ||
    data.reply ||
    data.answer ||
    data.data?.message ||
    data.message

  if (userMessage || aiMessage) {
    const normalized = normalizeMessages(
      [userMessage, typeof aiMessage === 'string' ? { role: 'ai', message: aiMessage } : aiMessage]
        .filter(Boolean),
    )

    if (!userMessage) {
      return mergeMessages(
        fallbackMessages,
        normalized.map((message) => ({ ...message, role: 'ai' })),
      )
    }

    return mergeMessages(fallbackMessages, normalized)
  }

  return fallbackMessages
}

function mergeMessages(currentMessages = [], incomingMessages = []) {
  if (!incomingMessages.length) {
    return currentMessages
  }

  if (incomingMessages.length >= currentMessages.filter((message) => !message.pending).length) {
    return incomingMessages
  }

  const withoutPending = currentMessages.filter((message) => !message.pending)
  const firstIncoming = incomingMessages[0]
  const shouldReplaceLastUser =
    firstIncoming?.role === 'user' &&
    withoutPending.at(-1)?.role === 'user' &&
    withoutPending.at(-1)?.message === firstIncoming.message
  const stableMessages = shouldReplaceLastUser ? withoutPending.slice(0, -1) : withoutPending
  const existingIds = new Set(stableMessages.map((message) => message.id))
  const nextMessages = incomingMessages.filter((message) => !existingIds.has(message.id))

  return [...stableMessages, ...nextMessages]
}
