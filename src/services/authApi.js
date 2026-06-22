import axios from 'axios'

// const API_BASE_URL = 'http://localhost:8001'
const API_BASE_URL = 'https://web-production-fc549.up.railway.app'
export const MEDIA_BASE_URL = `${API_BASE_URL}/media`
export const DEFAULT_AVATAR =
  'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="120" height="120" viewBox="0 0 120 120"><rect width="120" height="120" rx="28" fill="%23EAFBF3"/><circle cx="60" cy="46" r="22" fill="%232FBF7B"/><path d="M24 104c6-24 24-36 36-36s30 12 36 36" fill="%232FBF7B"/></svg>'

export function buildMediaUrl(filePath = '') {
  if (!filePath) return ''
  if (/^https?:\/\//i.test(filePath)) return filePath

  const normalizedPath = String(filePath).replace(/\\/g, '/').replace(/^\/+/, '')
  const pathWithoutMediaPrefix = normalizedPath.replace(/^media\//, '')
  return encodeURI(`${MEDIA_BASE_URL}/${pathWithoutMediaPrefix}`)
}

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

export async function googleLoginUser({ credential }) {
  try {
    const response = await axios.post(
      `${API_BASE_URL}/api/user/v1/auth/google-login`,
      {
        credential,
        // Compatibility with the current Django controller, which reads id_token.
        id_token: credential,
      },
      {
        timeout: 45000,
        headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
      },
    )
    return response.data
  } catch (error) {
    throw new Error(getApiError(error, 'Google login failed.'), { cause: error })
  }
}

export async function updateProfile(payload = {}) {
  const formData = new FormData()
  formData.append('name', payload.name || '')
  formData.append('email', payload.email || '')
  formData.append('phone', payload.phone || '')
  if (payload.profileFile) {
    formData.append('profile', payload.profileFile)
  }

  try {
    const response = await axios.patch(`${API_BASE_URL}/api/user/v1/profile`, formData, {
      timeout: 60000,
      headers: authorizedHeaders(),
    })
    return response.data
  } catch (error) {
    throw new Error(getApiError(error, 'Unable to update your profile.'), { cause: error })
  }
}

export const getProfile = () => request('/api/user/v1/profile', undefined, 'GET')

export const createChat = (payload = {}) => request('/api/user/v1/chats', payload)

export const getChats = () => request('/api/user/v1/chats', undefined, 'GET')

export const getChatDetail = (chatId) => request(`/api/user/v1/chats/${chatId}`, undefined, 'GET')

export const updateChat = (chatId, payload) => request(`/api/user/v1/chats/${chatId}`, payload, 'PUT')

export const deleteChat = (chatId) => request(`/api/user/v1/chats/${chatId}`, undefined, 'DELETE')

export const getMeetingDetail = (meetingId) =>
  request(`/api/user/v1/meetings/${meetingId}`, undefined, 'GET')

export const getMeetings = ({ search = '', startDate = '', endDate = '' } = {}) => {
  const params = new URLSearchParams()
  if (search.trim()) params.set('search', search.trim())
  if (startDate) params.set('startDate', startDate)
  if (endDate) params.set('endDate', endDate)
  const query = params.toString()
  return request(`/api/user/v1/meetings${query ? `?${query}` : ''}`, undefined, 'GET')
}

export const deleteMeeting = (meetingId) =>
  request(`/api/user/v1/meetings/${meetingId}`, undefined, 'DELETE')

export const getFolders = () => request('/api/user/v1/folders', undefined, 'GET')

export const getFolderDetail = (folderId) =>
  request(`/api/user/v1/folders/${folderId}`, undefined, 'GET')

export const createFolder = (payload) => request('/api/user/v1/folders', payload)

export const updateFolder = (folderId, payload) =>
  request(`/api/user/v1/folders/${folderId}`, payload, 'PUT')

export const deleteFolder = (folderId) =>
  request(`/api/user/v1/folders/${folderId}`, undefined, 'DELETE')

export const getFolderMeetings = (folderId) =>
  request(`/api/user/v1/folders/${folderId}/meetings`, undefined, 'GET')

export const addMeetingToFolder = (folderId, meetingId) =>
  request(`/api/user/v1/folders/${folderId}/meetings/${meetingId}`, undefined, 'POST')

export const removeMeetingFromFolder = (folderId, meetingId) =>
  request(`/api/user/v1/folders/${folderId}/meetings/${meetingId}`, undefined, 'DELETE')

function getApiError(error, fallbackMessage) {
  const data = error.response?.data || {}
  return error.response?.status === 401
    ? 'Unauthorized. Please login again.'
    : data.message ||
        data.error ||
        Object.values(data.errors || {}).flat().join(' ') ||
        error.message ||
        fallbackMessage
}

function authorizedHeaders() {
  const token = getAuthToken()
  return {
    Accept: 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  }
}

export function extractMeetingPayload(response = {}) {
  return response.data?.data || response.data || response
}

export async function importMeeting({ file, title = '', language = '', duration, onProgress } = {}) {
  const token = getAuthToken()
  const formData = new FormData()

  formData.append('file', file)
  formData.append('title', title || file?.name || 'Untitled Meeting')
  formData.append('language', language)
  if (duration !== undefined && duration !== null && duration !== '') {
    formData.append('duration', duration)
  }

  try {
    const response = await axios.post(`${API_BASE_URL}/api/user/v1/meetings/import`, formData, {
      timeout: 120000,
      headers: {
        Accept: 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      onUploadProgress: (event) => {
        if (event.total && onProgress) {
          onProgress(Math.round((event.loaded * 100) / event.total))
        }
      },
    })
    return response.data
  } catch (error) {
    throw new Error(getApiError(error, 'Meeting import failed.'), { cause: error })
  }
}

export const startMeetingRecording = (payload = {}) =>
  request('/api/user/v1/meetings/record/start', payload)

export async function uploadMeetingRecordingChunk(meetingId, chunk, chunkIndex = 0) {
  const formData = new FormData()
  const extension = chunk.type.includes('ogg') ? 'ogg' : 'webm'
  formData.append('chunk', chunk, `recording-chunk-${chunkIndex}.${extension}`)

  try {
    const response = await axios.post(
      `${API_BASE_URL}/api/user/v1/meetings/${meetingId}/record/chunk`,
      formData,
      { timeout: 120000, headers: authorizedHeaders() },
    )
    return response.data
  } catch (error) {
    throw new Error(getApiError(error, 'Unable to transcribe the recording chunk.'), { cause: error })
  }
}

export async function finishMeetingRecording(meetingId, recording, onProgress) {
  const formData = new FormData()
  const extension = recording.type.includes('ogg') ? 'ogg' : 'webm'
  formData.append('file', recording, `meeting-recording-${meetingId}.${extension}`)

  try {
    const response = await axios.post(
      `${API_BASE_URL}/api/user/v1/meetings/${meetingId}/record/finish`,
      formData,
      {
        timeout: 120000,
        headers: authorizedHeaders(),
        onUploadProgress: (event) => {
          if (event.total && onProgress) {
            onProgress(Math.round((event.loaded * 100) / event.total))
          }
        },
      },
    )
    return response.data
  } catch (error) {
    throw new Error(getApiError(error, 'Unable to finish the recording.'), { cause: error })
  }
}

export function normalizeMeetings(data = []) {
  const meetings = firstArray([
    data,
    data.data,
    data.meetings,
    data.results,
    data.items,
    data.data?.data,
    data.data?.meetings,
    data.data?.results,
    data.data?.items,
    data.data?.data?.meetings,
    data.results?.data,
    data.meetings?.data,
  ])

  if (!meetings) {
    return []
  }

  return meetings.map(normalizeMeeting)
}

export function normalizeFolders(data = []) {
  const folders = firstArray([
    data,
    data.data,
    data.folders,
    data.results,
    data.items,
    data.data?.data,
    data.data?.folders,
    data.data?.results,
    data.data?.items,
    data.data?.data?.folders,
    data.folders?.data,
  ])

  if (!folders) {
    return []
  }

  return folders.map((folder, index) => normalizeFolder(folder, index))
}

export function normalizeFolder(data = {}, index = 0, fallback = {}) {
  const folder =
    data.data?.folder || data.data?.data?.folder || data.data?.data || data.folder || data.data || data

  return {
    ...fallback,
    ...folder,
    id: String(folder.id || folder.uuid || fallback.id || `folder-${index + 1}`),
    name: folder.name || folder.title || fallback.name || `Folder ${index + 1}`,
  }
}

export function normalizeFolderMeetings(data = []) {
  const payload =
    data.data?.meetings ||
    data.data?.data?.meetings ||
    data.meetings ||
    data.data?.data ||
    data.data ||
    data

  return normalizeMeetings(payload)
}

function normalizeMeeting(meeting = {}, index = 0) {
  const rawDate = meeting.date || meeting.meeting_date || meeting.started_at || meeting.created_at || ''
  const date = normalizeDateValue(rawDate)
  const languagesValue =
    meeting.languages || meeting.detected_languages || meeting.language_codes || meeting.language || []
  const languages = (Array.isArray(languagesValue)
    ? languagesValue
    : String(languagesValue).split(',')
  )
    .map((language) =>
      typeof language === 'object'
        ? language.code || language.short_code || language.name
        : language,
    )
    .filter(Boolean)
    .map((language) => String(language).toUpperCase())

  return {
    ...meeting,
    id: String(meeting.id || meeting.uuid || `meeting-${index + 1}`),
    title: meeting.title || meeting.name || meeting.topic || `Meeting ${index + 1}`,
    date,
    dateLabel: formatMeetingDateLabel(date),
    time: meeting.time || formatMeetingTime(rawDate),
    duration: formatMeetingDuration(meeting.duration || meeting.duration_seconds),
    languages,
    speakers: meeting.speakers || meeting.speaker_count || meeting.total_speakers || 0,
    summaryPreview:
      meeting.summary_preview || meeting.summary || meeting.description || 'Meeting transcript and summary.',
    status: meeting.status || 'completed',
  }
}

function normalizeDateValue(value) {
  if (!value) return ''
  if (/^\d{4}-\d{2}-\d{2}/.test(String(value))) return String(value).slice(0, 10)

  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return ''
  return date.toISOString().slice(0, 10)
}

function formatMeetingDateLabel(value) {
  if (!value) return 'Unknown date'

  const date = new Date(`${value}T00:00:00`)
  const today = new Date()
  const todayValue = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`
  const formatted = date.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })

  return value === todayValue ? `Today, ${formatted}` : formatted
}

function formatMeetingTime(value) {
  if (!value || !String(value).includes('T')) return ''
  const date = new Date(value)
  return Number.isNaN(date.getTime())
    ? ''
    : date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })
}

function formatMeetingDuration(value) {
  if (!value) return '0 min'
  if (typeof value === 'string' && !/^\d+$/.test(value)) return value

  const seconds = Number(value)
  if (!Number.isFinite(seconds)) return String(value)
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  const remainingSeconds = seconds % 60
  return [hours ? `${hours}h` : '', minutes ? `${minutes}m` : '', `${remainingSeconds}s`]
    .filter(Boolean)
    .join(' ')
}

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
  console.log('Create chat message payload:', {
    message: payload.message || '',
    attachments: attachments.map((file) => ({
      name: file.name,
      size: file.size,
      type: file.type,
    })),
  })

  try {
    const response = await axios.post(`${API_BASE_URL}/api/user/v1/chats/${chatId}/messages`, formData, {
      timeout: 90000,
      headers: {
        Accept: 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    })

    console.log('Create chat message response:', response.data)
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
    persistUser(user)
  }
}

export function persistUser(user) {
  const normalizedUser = normalizeUser(user)
  localStorage.setItem('voxa_user', JSON.stringify(normalizedUser))
  localStorage.setItem('user', JSON.stringify(normalizedUser))
  return normalizedUser
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
    attachments: normalizeAttachments(message),
    createdAt: message.created_at || message.createdAt || message.sent_at || 'Now',
  }))
}

function normalizeAttachments(message = {}) {
  const attachmentValue =
    firstArray([
      message.attachments,
      message.attachment,
      message.files,
      message.file,
      message.images,
      message.image,
      message.uploads,
      message.media,
    ]) ||
    firstObject([
      message.attachments,
      message.attachment,
      message.files,
      message.file,
      message.images,
      message.image,
      message.uploads,
      message.media,
    ])
  const rawAttachments = Array.isArray(attachmentValue)
    ? attachmentValue
    : [attachmentValue].filter(Boolean)

  if (!rawAttachments.length) {
    return []
  }

  return rawAttachments.map((attachment, index) => {
    const isStringAttachment = typeof attachment === 'string'
    const rawUrl =
      (isStringAttachment ? attachment : '') ||
      attachment.url ||
      attachment.file_url ||
      attachment.fileUrl ||
      attachment.path ||
      attachment.file ||
      attachment.image ||
      attachment.src ||
      ''
    const url = rawUrl && rawUrl.startsWith('/') ? `${API_BASE_URL}${rawUrl}` : rawUrl
    const name =
      attachment.name ||
      attachment.filename ||
      attachment.file_name ||
      attachment.fileName ||
      attachment.original_name ||
      attachment.originalName ||
      url.split('/').pop() ||
      `Attachment ${index + 1}`
    const type =
      attachment.type ||
      attachment.mime_type ||
      attachment.mimetype ||
      attachment.content_type ||
      attachment.contentType ||
      ''
    const isImage =
      String(type).toLowerCase().startsWith('image/') ||
      String(type).toLowerCase() === 'image' ||
      /\.(png|jpe?g|gif|webp)(\?.*)?$/i.test(name || url)

    return {
      id: String(attachment.id || attachment.uuid || `${name}-${index}`),
      name,
      type,
      url,
      previewUrl: url,
      isImage,
    }
  })
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
  const lastLocalUser = withoutPending.at(-1)
  const shouldReplaceLastUser =
    firstIncoming?.role === 'user' &&
    lastLocalUser?.role === 'user' &&
    lastLocalUser?.message === firstIncoming.message
  const incomingWithPreservedAttachments =
    shouldReplaceLastUser && lastLocalUser.attachments?.length && !firstIncoming.attachments?.length
      ? [{ ...firstIncoming, attachments: lastLocalUser.attachments }, ...incomingMessages.slice(1)]
      : incomingMessages
  const stableMessages = shouldReplaceLastUser ? withoutPending.slice(0, -1) : withoutPending
  const existingIds = new Set(stableMessages.map((message) => message.id))
  const nextMessages = incomingWithPreservedAttachments.filter((message) => !existingIds.has(message.id))

  return [...stableMessages, ...nextMessages]
}
