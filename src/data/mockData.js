export const user = {
  name: 'Admin',
  email: 'admin@gmail.com',
  phone: '09565444566',
  avatar: 'https://images.unsplash.com/photo-1519682337058-a94d519337bc?auto=format&fit=crop&w=120&q=80',
}

export const meetings = [
  {
    id: 'daily-standup',
    title: 'Daily product sync',
    dateLabel: 'Today, May 2026',
    date: '2026-05-21',
    time: '2:40 PM',
    duration: '1mn 20s',
    languages: ['EN', 'KH'],
    speakers: 3,
    status: 'summarized',
    summaryPreview: 'Reviewed today priorities, blockers, and the next product release tasks.',
    chats: [
      {
        id: 'daily-summary',
        title: 'Summary Discussion',
        updatedAt: '2:45 PM',
        messages: [
          { id: 'daily-summary-1', role: 'user', message: 'Summarize this meeting.', createdAt: '2:41 PM' },
          {
            id: 'daily-summary-2',
            role: 'ai',
            message: 'Daily Product Sync focused on priorities, current blockers, and release tasks for the product team.',
            createdAt: '2:41 PM',
          },
        ],
      },
      {
        id: 'daily-actions',
        title: 'Action Items',
        updatedAt: '2:48 PM',
        messages: [
          { id: 'daily-actions-1', role: 'user', message: 'Generate action items.', createdAt: '2:48 PM' },
          {
            id: 'daily-actions-2',
            role: 'ai',
            message: 'Action items: finalize sidebar polish, review import flow, and prepare transcript language badge states.',
            createdAt: '2:48 PM',
          },
        ],
      },
      {
        id: 'daily-translation',
        title: 'Translation',
        updatedAt: '2:52 PM',
        messages: [
          { id: 'daily-translation-1', role: 'user', message: 'Translate the key points to Khmer.', createdAt: '2:52 PM' },
          {
            id: 'daily-translation-2',
            role: 'ai',
            message: 'Key points are prepared for Khmer translation in this static demo conversation.',
            createdAt: '2:52 PM',
          },
        ],
      },
      {
        id: 'daily-general',
        title: 'General Questions',
        updatedAt: '2:55 PM',
        messages: [
          { id: 'daily-general-1', role: 'user', message: 'What is this conversation talking about?', createdAt: '2:55 PM' },
          {
            id: 'daily-general-2',
            role: 'ai',
            message:
              'This conversation is about a multilingual meeting assistant workflow. The team discusses recording, transcripts, AI summaries, language detection, and follow-up tasks.',
            createdAt: '2:55 PM',
          },
        ],
      },
    ],
  },
  {
    id: 'design-review',
    title: 'Design review notes',
    dateLabel: 'Today, May 2026',
    date: '2026-05-21',
    time: '1:15 PM',
    duration: '32mn',
    languages: ['EN', 'CN'],
    speakers: 4,
    status: 'processing',
    summaryPreview: 'Discussed VOXA spacing, auth screens, sidebar states, and chat layout polish.',
    chats: [
      {
        id: 'design-summary',
        title: 'Summary Discussion',
        updatedAt: '1:28 PM',
        messages: [
          { id: 'design-summary-1', role: 'user', message: 'What design changes were discussed?', createdAt: '1:26 PM' },
          {
            id: 'design-summary-2',
            role: 'ai',
            message: 'The design review covered auth screens, sidebar spacing, responsive drawers, and cleaner controls.',
            createdAt: '1:26 PM',
          },
        ],
      },
      {
        id: 'design-general',
        title: 'General Questions',
        updatedAt: '1:31 PM',
        messages: [
          { id: 'design-general-1', role: 'user', message: 'What is this conversation talking about?', createdAt: '1:31 PM' },
          {
            id: 'design-general-2',
            role: 'ai',
            message:
              'This conversation is about improving VOXA AI UI quality, especially sidebar behavior, responsive pages, and clean meeting detail controls.',
            createdAt: '1:31 PM',
          },
        ],
      },
    ],
  },
  {
    id: 'client-call',
    title: 'Client follow-up call',
    dateLabel: 'Today, May 2026',
    date: '2026-05-21',
    time: '10:05 AM',
    duration: '45mn',
    languages: ['EN'],
    speakers: 2,
    status: 'summarized',
    summaryPreview: 'Captured client requests for import flow, transcript quality, and export options.',
    chats: [
      {
        id: 'client-summary',
        title: 'Summary Discussion',
        updatedAt: '10:48 AM',
        messages: [
          { id: 'client-summary-1', role: 'user', message: 'What did the client ask for?', createdAt: '10:46 AM' },
          {
            id: 'client-summary-2',
            role: 'ai',
            message: 'The client asked for a better import flow, clearer transcript quality, and simple export options.',
            createdAt: '10:46 AM',
          },
        ],
      },
    ],
  },
  {
    id: 'research-interview',
    title: 'Research interview',
    dateLabel: '20 May 2026',
    date: '2026-05-20',
    time: '4:20 PM',
    duration: '26mn',
    languages: ['KH', 'EN'],
    speakers: 2,
    status: 'summarized',
    summaryPreview: 'Interview notes about multilingual meeting pain points and note-taking habits.',
    chats: [
      {
        id: 'research-summary',
        title: 'Summary Discussion',
        updatedAt: '4:39 PM',
        messages: [
          { id: 'research-summary-1', role: 'user', message: 'Summarize the interview.', createdAt: '4:38 PM' },
          {
            id: 'research-summary-2',
            role: 'ai',
            message: 'The interview highlighted pain points around multilingual meetings and manual note taking.',
            createdAt: '4:38 PM',
          },
        ],
      },
    ],
  },
  {
    id: 'sprint-planning',
    title: 'Sprint planning',
    dateLabel: '20 May 2026',
    date: '2026-05-20',
    time: '9:30 AM',
    duration: '1h 08mn',
    languages: ['EN', 'CN', 'KH'],
    speakers: 5,
    status: 'summarized',
    summaryPreview: 'Planned the next sprint, ownership, milestones, and release risks.',
    chats: [
      {
        id: 'sprint-actions',
        title: 'Action Items',
        updatedAt: '10:30 AM',
        messages: [
          { id: 'sprint-actions-1', role: 'user', message: 'What tasks were assigned?', createdAt: '10:28 AM' },
          {
            id: 'sprint-actions-2',
            role: 'ai',
            message: 'Tasks were assigned for UI polish, meeting detail behavior, and responsive QA.',
            createdAt: '10:28 AM',
          },
        ],
      },
    ],
  },
  {
    id: 'recorded-meeting',
    title: 'Recorded meeting conversation',
    dateLabel: 'Today, May 2026',
    date: '2026-05-21',
    time: '1:33 AM',
    duration: '1mn 33s',
    languages: ['EN', 'KH', 'CN'],
    speakers: 2,
    status: 'summarized',
    summaryPreview: 'Auto-generated meeting detail from the recording page with summary, transcript, and insights.',
    chats: [
      {
        id: 'recorded-summary',
        title: 'Summary Discussion',
        updatedAt: '1:35 AM',
        messages: [
          { id: 'recorded-summary-1', role: 'user', message: 'Summarize this recording.', createdAt: '1:35 AM' },
          {
            id: 'recorded-summary-2',
            role: 'ai',
            message: 'This recording explains the live speech-to-text flow and how VOXA AI creates summaries after recording.',
            createdAt: '1:35 AM',
          },
        ],
      },
    ],
  },
]

export const folders = [
  {
    id: 'team-meetings',
    label: 'Team Meetings',
    type: 'single',
    path: '/communication/team-meetings',
    children: [],
  },
  {
    id: 'interviews',
    label: 'Interviews',
    type: 'folder',
    path: '/communication/interviews',
    children: [
      { id: 'ux-interview', label: 'UX Interview', path: '/meeting/research-interview' },
      { id: 'hiring-call', label: 'Hiring Call', path: '/meeting/client-call' },
    ],
  },
  {
    id: 'project-discussions',
    label: 'Project Discussions',
    type: 'folder',
    path: '/communication/project-discussions',
    children: [
      { id: 'sprint-planning-child', label: 'Sprint Planning', path: '/meeting/sprint-planning' },
      { id: 'design-review-child', label: 'Design Review', path: '/meeting/design-review' },
    ],
  },
]

export const histories = [
  { id: 'history-1', title: 'History 1', meetingId: 'daily-standup', path: '/history/history-1' },
  { id: 'history-2', title: 'History 2', meetingId: 'design-review', path: '/history/history-2' },
  { id: 'history-3', title: 'History 3', meetingId: 'client-call', path: '/history/history-3' },
  { id: 'history-4', title: 'History 4', meetingId: 'research-interview', path: '/history/history-4' },
]

export const generalChats = [
  {
    id: 'laravel-question',
    title: 'Laravel Question',
    updatedAt: '9:30 AM',
    messages: [
      { id: 'laravel-1', role: 'user', message: 'How do I structure a Laravel API controller?', createdAt: '9:29 AM' },
      {
        id: 'laravel-2',
        role: 'ai',
        message: 'Use routes for endpoints, controllers for request handling, form requests for validation, and resources for response shaping.',
        createdAt: '9:30 AM',
      },
    ],
  },
  {
    id: 'translate-khmer',
    title: 'Translate Khmer',
    updatedAt: '10:12 AM',
    messages: [
      { id: 'khmer-1', role: 'user', message: 'Translate my meeting summary to Khmer.', createdAt: '10:11 AM' },
      {
        id: 'khmer-2',
        role: 'ai',
        message: 'I can translate the summary and keep action items formatted clearly for your team.',
        createdAt: '10:12 AM',
      },
    ],
  },
  {
    id: 'study-plan',
    title: 'Study Plan',
    updatedAt: '11:04 AM',
    messages: [
      { id: 'study-1', role: 'user', message: 'Help me plan my AI subject assignment.', createdAt: '11:03 AM' },
      {
        id: 'study-2',
        role: 'ai',
        message: 'Break it into UI, routing, static data, responsive checks, and final presentation polish.',
        createdAt: '11:04 AM',
      },
    ],
  },
]

export const chatMessages = [
  { id: 'm1', role: 'user', message: 'What is this conversation talking about?', createdAt: '2:41 PM' },
  {
    id: 'm2',
    role: 'ai',
    message:
      'This conversation is about a multilingual meeting assistant workflow. The team discusses recording, transcripts, AI summaries, language detection, and keeping follow-up tasks easy to find.',
    createdAt: '2:41 PM',
  },
]

export const transcriptItems = [
  {
    id: 't1',
    speaker: 'Speaker 1',
    code: 'S1',
    timestamp: '0:04',
    text: 'Welcome everyone. Today we are reviewing the VOXA AI dashboard flow, upload experience, and what should happen after a meeting is recorded.',
  },
  {
    id: 't2',
    speaker: 'Speaker 2',
    code: 'S2',
    timestamp: '0:42',
    text: 'The main decision is to keep the home page focused on recent meetings, search, import, and record. The AI assistant should stay available in the detail view.',
  },
  {
    id: 't3',
    speaker: 'Speaker 3',
    code: 'S3',
    timestamp: '1:18',
    text: 'Action items are to polish the sidebar, improve Khmer and Chinese language badges, and make sure summaries are easy to scan.',
  },
]

export const summaryData = {
  overview:
    'The meeting covered VOXA AI core workflows: importing or recording meetings, producing multilingual transcripts, and using the assistant to summarize decisions and tasks.',
  actionItems: [
    'Polish the sidebar, recent history behavior, and mobile drawer.',
    'Prepare transcript badges for English, Khmer, and Chinese.',
    'Keep meeting detail questions available in the assistant panel.',
  ],
  decisions: [
    'Recent Meetings remains the home page focus.',
    'VOXA AI chat should feel familiar, simple, and close to ChatGPT.',
    'Audio controls stay visible without covering important transcript content.',
  ],
  keywords: ['meeting assistant', 'summary', 'transcript', 'upload', 'language detection'],
  languages: ['English', 'Khmer', 'Chinese'],
  duration: '1mn 30s',
  speakerCount: 3,
}

export const stats = [
  { id: 'meetings', label: 'Total Meetings', value: '128', icon: 'FileText' },
  { id: 'transcripts', label: 'Transcripts', value: '96', icon: 'MessageSquareText' },
  { id: 'languages', label: 'Languages', value: '12', icon: 'Languages' },
  { id: 'summaries', label: 'AI Summaries', value: '84', icon: 'Sparkles' },
]

export const suggestions = [
  'Summarize my meeting',
  'Translate transcript',
  'Generate action items',
  'What decisions were made?',
]

export const staticAiReply =
  'Here is a concise VOXA AI response based on the available meeting data. The main points are the discussion topic, decisions, and action items that should be followed up next.'

export const groupMeetingsByDate = (items) =>
  items.reduce((groups, meeting) => {
    const existing = groups.find((group) => group.label === meeting.dateLabel)
    if (existing) {
      existing.meetings.push(meeting)
      return groups
    }
    return [...groups, { label: meeting.dateLabel, meetings: [meeting] }]
  }, [])

export const getMeetingById = (id) => meetings.find((meeting) => meeting.id === id) || meetings[0]

export const getRecentById = (id) => histories.find((item) => item.id === id) || histories[0]

export const communicationItems = folders
export const recentItems = [
  { id: 'daily-product-sync', label: 'Daily Product Sync', meetingId: 'daily-standup', path: '/meeting/daily-standup' },
  { id: 'interview-candidate', label: 'Interview Candidate', meetingId: 'research-interview', path: '/meeting/research-interview' },
  { id: 'project-planning', label: 'Project Planning', meetingId: 'sprint-planning', path: '/meeting/sprint-planning' },
]
export const meetingGroups = groupMeetingsByDate(meetings)
export const transcript = transcriptItems.map(({ speaker, code, timestamp, text }) => ({ speaker, code, time: timestamp, text }))
