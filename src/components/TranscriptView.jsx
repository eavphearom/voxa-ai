function TranscriptView({ transcript = '', emptyMessage = 'No transcript available.' }) {
  const turns = parseSpeakerTranscript(transcript)

  if (!turns.length) {
    return <p className="text-sm text-text-secondary">{emptyMessage}</p>
  }

  return (
    <div className="space-y-6">
      {turns.map((turn, index) => (
        <article
          key={`${turn.speaker}-${index}`}
          className="grid gap-3 sm:grid-cols-[38px_minmax(0,1fr)] animate-fade-in"
        >
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-xs font-bold text-white">
            {speakerInitials(turn.speaker)}
          </span>
          <div className="min-w-0">
            <h3 className="font-semibold text-text-primary">{turn.speaker}</h3>
            <p className="mt-2 whitespace-pre-wrap text-sm leading-7 text-text-primary">{turn.text}</p>
          </div>
        </article>
      ))}
    </div>
  )
}

function parseSpeakerTranscript(transcript = '') {
  const value = String(transcript || '').trim()
  if (!value) return []

  const lines = value.split(/\r?\n/)
  const turns = []
  let current = null

  lines.forEach((rawLine) => {
    const line = rawLine.trim()
    if (!line) return

    const match = line.match(/^(Speaker\s+\d+|SPEAKER[_\s-]*\d+|Live transcript)\s*:\s*(.*)$/i)
    if (match) {
      current = { speaker: normalizeSpeaker(match[1]), text: match[2].trim() }
      turns.push(current)
      return
    }

    if (!current) {
      current = { speaker: 'Transcript', text: line }
      turns.push(current)
    } else {
      current.text = `${current.text}${current.text ? ' ' : ''}${line}`
    }
  })

  return turns.filter((turn) => turn.text)
}

function normalizeSpeaker(value) {
  if (/^live transcript$/i.test(value)) return 'Live transcript'
  const number = value.match(/\d+/)?.[0]
  return number ? `Speaker ${Number(number) + (/^SPEAKER_/i.test(value) ? 1 : 0)}` : value
}

function speakerInitials(speaker) {
  if (speaker === 'Live transcript') return 'AI'
  const number = speaker.match(/\d+/)?.[0]
  return number ? `S${number}` : 'T'
}

export default TranscriptView
